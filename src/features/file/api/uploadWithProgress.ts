import { API_BASE_URL } from '../../../services/baseApi';
import type { FileResponse } from './fileApi';

export interface UploadProgressEvent {
  loaded: number;
  total: number;
}

export interface UploadError {
  status?: number;
  message: string;
  data?: { message?: string };
  cancelled?: boolean;
}

export const MAX_UPLOAD_BYTES = 1024 * 1024 * 1024;
const MULTIPART_THRESHOLD = 8 * 1024 * 1024;

const cancelled = (): UploadError => ({ message: 'Upload cancelled.', cancelled: true });

const delay = (milliseconds: number, signal?: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(cancelled());
    const onAbort = () => {
      clearTimeout(timer);
      reject(cancelled());
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, milliseconds);
    signal?.addEventListener('abort', onAbort, { once: true });
  });

const getToken = (): string | null =>
  typeof window === 'undefined' ? null : localStorage.getItem('accessToken');

const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) return null;

    const json = (await response.json()) as { data?: { accessToken?: string } };
    const token = json?.data?.accessToken;
    if (!token) return null;

    localStorage.setItem('accessToken', token);
    document.cookie = `accessToken=${token}; path=/; max-age=86400; SameSite=Lax`;
    return token;
  } catch {
    return null;
  }
};

/**
 * The server accepts the bytes, answers immediately (202) and copies the file
 * to storage in the background. Poll until it is ready (or failed).
 */
export const waitForFileReady = async (
  file: FileResponse['data'],
  signal?: AbortSignal,
): Promise<FileResponse['data']> => {
  if (!file || file.status !== 'processing') return file;

  const deadline = Date.now() + 60 * 60 * 1000;
  let failures = 0;

  while (Date.now() < deadline) {
    if (signal?.aborted) {
      throw { message: 'Stopped waiting for the server.', cancelled: true } satisfies UploadError;
    }
    await delay(2000, signal);

    try {
      const response = await fetch(`${API_BASE_URL}/files/${file._id}`, {
        credentials: 'include',
        signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const json = (await response.json()) as FileResponse;
      failures = 0;

      if (json.data.status === 'failed') {
        throw {
          status: 503,
          message: json.data.errorMessage || 'The server could not store the file.',
          data: { message: json.data.errorMessage || 'The server could not store the file.' },
        } satisfies UploadError;
      }
      if (json.data.status !== 'processing') return json.data;
    } catch (error) {
      if ((error as UploadError).message && !(error instanceof Error) && !(error instanceof DOMException)) {
        throw error;
      }
      // Transient network hiccup: keep polling, give up after a few in a row.
      if (signal?.aborted) {
        throw { message: 'Stopped waiting for the server.', cancelled: true } satisfies UploadError;
      }
      if (++failures >= 5) {
        throw { message: 'Lost contact with the server while finalizing the upload.' } satisfies UploadError;
      }
    }
  }

  throw { message: 'Timed out while the server was finalizing the upload.' } satisfies UploadError;
};

const sendOnce = (
  body: FormData,
  token: string | null,
  onProgress: (event: UploadProgressEvent) => void,
  signal?: AbortSignal,
  endpoint = '/files',
  method = 'POST',
): Promise<{ status: number; json: unknown }> =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(cancelled());
    const xhr = new XMLHttpRequest();
    xhr.open(method, `${API_BASE_URL}${endpoint}`);
    xhr.withCredentials = true;
    xhr.setRequestHeader('Accept', 'application/json');
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress({ loaded: event.loaded, total: event.total });
      }
    };
    xhr.onload = () => {
      cleanup();
      let json: unknown = null;
      try {
        json = JSON.parse(xhr.responseText);
      } catch {
        json = null;
      }
      resolve({ status: xhr.status, json });
    };
    xhr.onerror = () => {
      cleanup();
      reject({
        message:
          'Network error: the connection was lost during upload. Check your connection and the server upload limits.',
      } satisfies UploadError);
    };
    xhr.ontimeout = () => {
      cleanup();
      reject({ message: 'Upload timed out.' } satisfies UploadError);
    };
    xhr.onabort = () => {
      cleanup();
      reject(cancelled());
    };

    const onAbort = () => xhr.abort();
    const cleanup = () => signal?.removeEventListener('abort', onAbort);
    signal?.addEventListener('abort', onAbort, { once: true });
    xhr.send(body);
  });

const unwrapResponse = <T>(result: { status: number; json: unknown }): T => {
  if (result.status >= 200 && result.status < 300) {
    return result.json as T;
  }

  const message =
    (result.json as { message?: string } | null)?.message ||
    (result.status === 413
      ? 'The server rejected this upload because of its size. Files must be 1 GB or smaller.'
      : result.status === 502 || result.status === 503 || result.status === 504
        ? `The server could not receive the upload (HTTP ${result.status}). Please try again.`
        : `Upload failed (HTTP ${result.status}).`);

  throw {
    status: result.status,
    message,
    data: { message },
  } satisfies UploadError;
};

const requestJson = async <T>(endpoint: string, method: string, body?: unknown, signal?: AbortSignal): Promise<T> => {
  const send = async () => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
    return { status: response.status, json: await response.json().catch(() => null) as unknown };
  };
  let result = await send();
  if (result.status === 401 && await refreshAccessToken()) result = await send();
  return unwrapResponse<T>(result);
};

const sendAuthenticated = async (
  body: FormData,
  onProgress: (event: UploadProgressEvent) => void,
  signal?: AbortSignal,
  endpoint = '/files',
  method = 'POST',
) => {
  let result = await sendOnce(body, getToken(), onProgress, signal, endpoint, method);
  if (result.status === 401 && await refreshAccessToken()) {
    result = await sendOnce(body, getToken(), onProgress, signal, endpoint, method);
  }
  return unwrapResponse<FileResponse>(result);
};

const retry = async <T>(operation: () => Promise<T>, signal?: AbortSignal): Promise<T> => {
  for (let attempt = 0; ; attempt++) {
    if (signal?.aborted) throw cancelled();
    try {
      return await operation();
    } catch (error) {
      if (signal?.aborted || (error as UploadError).cancelled) throw cancelled();
      const status = (error as UploadError).status;
      const retryable = status === undefined || status === 408 || status === 429 || status >= 500;
      if (!retryable || attempt >= 2) throw error;
      await delay(1000 * 2 ** attempt, signal);
    }
  }
};

/** Large files travel in bounded parts; a failed part never restarts the whole video. */
export const uploadFileWithProgress = async (
  body: FormData,
  onProgress: (event: UploadProgressEvent) => void,
  signal?: AbortSignal,
): Promise<FileResponse> => {
  if (signal?.aborted) throw cancelled();
  const file = body.get('file');
  if (!(file instanceof File) || !file.size) {
    throw { status: 400, message: 'Choose a non-empty file to upload.' } satisfies UploadError;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw { status: 413, message: 'Files, including videos, must be 1 GB or smaller.' } satisfies UploadError;
  }
  if (file.size <= MULTIPART_THRESHOLD) return sendAuthenticated(body, onProgress, signal);

  const metadata = Object.fromEntries(['title', 'description', 'altText', 'caption']
    .flatMap((key) => typeof body.get(key) === 'string' ? [[key, body.get(key)]] : []));
  const session = await requestJson<{ data: { id: string; partSize: number } }>('/files/uploads', 'POST', {
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
    ...metadata,
  }, signal);
  if (!session?.data?.id || !Number.isSafeInteger(session.data.partSize) || session.data.partSize <= 0) {
    throw { message: 'The server could not start the upload.' } satisfies UploadError;
  }
  const endpoint = `/files/uploads/${encodeURIComponent(session.data.id)}`;
  let completing = false;
  let reported = 0;

  try {
    for (let offset = 0, partNumber = 1; offset < file.size; offset += session.data.partSize, partNumber++) {
      const chunk = file.slice(offset, Math.min(offset + session.data.partSize, file.size));
      const part = new FormData();
      part.append('file', chunk, 'part');
      await retry(() => sendAuthenticated(part, ({ loaded, total }) => {
        // Exclude multipart overhead, and keep progress steady during retries.
        reported = Math.max(reported, offset + Math.min(chunk.size, chunk.size * loaded / total));
        onProgress({ loaded: reported, total: file.size });
      }, signal, `${endpoint}/parts/${partNumber}`, 'PUT'), signal);
    }
    completing = true;
    return await retry(() => requestJson<FileResponse>(`${endpoint}/complete`, 'POST', undefined, signal), signal);
  } catch (error) {
    // Completion can succeed after a connection drops; retain its receipt for verification.
    if (!completing) void requestJson(endpoint, 'DELETE').catch(() => undefined);
    if (signal?.aborted) throw cancelled();
    throw error;
  }
};
