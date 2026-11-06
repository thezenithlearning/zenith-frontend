import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const source = await readFile(new URL('../src/features/course/utils/courseError.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const context = { exports: {} };
vm.runInNewContext(compiled, context);
const { getCourseErrorMessage } = context.exports;

test('course errors preserve the API reason for a denied request', () => {
  const message = 'This action requires the admin role. Your signed-in account has the user role.';
  assert.equal(getCourseErrorMessage({ status: 403, data: { message } }), message);
});
test('missing permission details explain which account and server to check', () => {
  assert.match(getCourseErrorMessage({ status: 403 }), /signed-in account.*admin role.*API server/);
});
test('expired sessions and validation messages remain distinct', () => {
  assert.match(getCourseErrorMessage({ status: 401 }), /Session expired/);
  assert.equal(getCourseErrorMessage({ status: 400, data: { message: 'Title is required' } }), 'Title is required');
});
