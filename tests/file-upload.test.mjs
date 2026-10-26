import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { File } from 'node:buffer';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

// Exercise the real upload helper with browser transport doubles, never a live API.
const source = await readFile(new URL('../src/features/file/api/uploadWithProgress.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const partSize = 8 * 1024 * 1024;

function harness({ partStatus, abortOnSend } = {}) {
  const requests = [];
  const progress = [];
  const tokens = new Map([['accessToken', 'old-token']]);
  let attempts = 0;
  class XHR {
    upload = {};
    headers = {};
    open(method, url) { this.method = method; this.url = url; }
    setRequestHeader(name, value) { this.headers[name] = value; }
    abort() { this.aborted = true; this.onabort?.(); }
    send(body) {
      requests.push({ method: this.method, url: this.url, size: body.get('file')?.size, token: this.headers.Authorization });
      queueMicrotask(() => {
        if (abortOnSend) { abortOnSend(); return; }
        if (this.aborted) return;
        const size = body.get('file')?.size || 0;
        this.upload.onprogress?.({ lengthComputable: true, loaded: size + 200, total: size + 200 });
        this.status = this.method === 'PUT' ? (partStatus?.(++attempts) ?? 200) : 202;
        if (!this.status) { this.onerror?.(); return; }
        this.responseText = JSON.stringify(this.status >= 400
          ? { message: 'Test upload failure' }
          : { success: true, data: this.method === 'PUT' ? { partNumber: 1 } : { _id: 'small-file', status: 'processing' } });
        this.onload?.();
      });
    }
  }
  const context = {
    exports: {}, require: () => ({ API_BASE_URL: 'https://upload.test/api/v1' }),
    File, FormData, Blob, AbortController, DOMException, Date, console,
    window: {}, document: { cookie: '' },
    localStorage: { getItem: (key) => tokens.get(key) ?? null, setItem: (key, value) => tokens.set(key, value) },
    XMLHttpRequest: XHR,
    // Keep retries deterministic and fast without changing application behavior.
    setTimeout: (callback) => setTimeout(callback, 0), clearTimeout,
    fetch: async (url, options = {}) => {
      requests.push({ method: options.method ?? 'GET', url, body: options.body });
      if (options.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      if (url.endsWith('/auth/refresh')) return new Response(JSON.stringify({ data: { accessToken: 'fresh-token' } }));
      if (options.method === 'DELETE') return new Response(null, { status: 204 });
      if (url.endsWith('/uploads')) return new Response(JSON.stringify({ data: { id: 'session-1', partSize } }), { status: 201 });
      return new Response(JSON.stringify({ success: true, data: { _id: 'file-1', status: 'ready' } }));
    },
  };
  vm.runInNewContext(compiled, context);
  return { ...context.exports, requests, progress, onProgress: (event) => progress.push(event) };
}

function form(size, type = 'video/mp4') {
  const body = new FormData();
  body.set('file', new File([new Uint8Array(size)], 'lesson.mp4', { type }));
  body.set('title', 'Lesson one');
  return body;
}

test('large videos use 8 MB parts and one completion, with byte-accurate progress', async () => {
  const api = harness();
  const result = await api.uploadFileWithProgress(form(partSize + 5), api.onProgress);
  assert.equal(result.data.status, 'ready');
  assert.deepEqual(api.requests.filter((r) => r.method === 'PUT').map((r) => r.size), [partSize, 5]);
  assert.equal(api.requests.filter((r) => r.url.endsWith('/complete')).length, 1);
  assert.equal(api.progress.at(-1).loaded, partSize + 5);
  assert.equal(api.progress.at(-1).total, partSize + 5);
  assert.equal(JSON.parse(api.requests[0].body).title, 'Lesson one');
});

test('transient failure retries only the interrupted part and progress never moves backward', async () => {
  const api = harness({ partStatus: (attempt) => attempt === 1 ? 0 : 200 });
  await api.uploadFileWithProgress(form(partSize + 5), api.onProgress);
  assert.deepEqual(api.requests.filter((r) => r.method === 'PUT').map((r) => r.url.split('/').at(-1)), ['1', '1', '2']);
  assert.ok(api.progress.every((value, index, all) => !index || value.loaded >= all[index - 1].loaded));
});

test('refreshes an expired token between parts without restarting the video', async () => {
  const api = harness({ partStatus: (attempt) => attempt === 2 ? 401 : 200 });
  await api.uploadFileWithProgress(form(partSize + 5), api.onProgress);
  const parts = api.requests.filter((r) => r.method === 'PUT');
  assert.deepEqual(parts.map((r) => r.url.split('/').at(-1)), ['1', '2', '2']);
  assert.equal(parts.at(-1).token, 'Bearer fresh-token');
});

test('rejects over 1 GB before network activity and accepts an already-cancelled signal', async () => {
  const api = harness();
  const body = form(1);
  Object.defineProperty(body.get('file'), 'size', { value: api.MAX_UPLOAD_BYTES + 1 });
  await assert.rejects(api.uploadFileWithProgress(body, api.onProgress), (error) => error.status === 413);
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(api.uploadFileWithProgress(form(1), api.onProgress, controller.signal), (error) => error.cancelled === true);
  assert.equal(api.requests.length, 0);
});

test('permanent part failure aborts its storage session and does not finalize', async () => {
  const api = harness({ partStatus: () => 413 });
  await assert.rejects(api.uploadFileWithProgress(form(partSize + 5), api.onProgress), (error) => error.status === 413);
  assert.equal(api.requests.filter((r) => r.method === 'PUT').length, 1);
  assert.ok(api.requests.some((r) => r.method === 'DELETE'));
  assert.ok(!api.requests.some((r) => r.url.endsWith('/complete')));
});

test('cancels an active upload and cleans up the multipart session', async () => {
  const controller = new AbortController();
  const api = harness({ abortOnSend: () => controller.abort() });
  await assert.rejects(api.uploadFileWithProgress(form(partSize + 5), api.onProgress, controller.signal), (error) => error.cancelled === true);
  assert.ok(api.requests.some((r) => r.method === 'DELETE'));
});

test('small images and PDFs retain their existing upload and ready-status polling', async () => {
  for (const type of ['image/png', 'application/pdf']) {
    const api = harness();
    const result = await api.uploadFileWithProgress(form(100, type), api.onProgress);
    assert.ok(api.requests[0].url.endsWith('/files'));
    const ready = await api.waitForFileReady(result.data);
    assert.equal(ready.status, 'ready');
  }
});
