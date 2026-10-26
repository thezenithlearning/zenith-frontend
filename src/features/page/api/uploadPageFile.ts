import type { IFile } from '../../file/api/fileApi';
import { uploadFileWithProgress, waitForFileReady } from '../../file/api/uploadWithProgress';

/** "my_photo-final.JPG" -> "my photo final" */
export const humanizeFileName = (fileName: string): string =>
  fileName
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const isImageFile = (file: File): boolean => file.type.toLowerCase().startsWith('image/');

/**
 * Uploads through the shared File Manager endpoint (POST /files) and waits for
 * the server to finish copying the file to storage.
 */
export const uploadPageFile = async (
  file: File,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
): Promise<IFile> => {
  const name = humanizeFileName(file.name);
  const body = new FormData();

  body.append('title', name);
  if (isImageFile(file)) body.append('altText', name);
  // File goes last so the text fields are available while multer streams it.
  body.append('file', file);

  const uploaded = await uploadFileWithProgress(
    body,
    ({ loaded, total }) => onProgress?.(total ? Math.round((loaded / total) * 100) : 0),
    signal,
  );

  return waitForFileReady(uploaded.data, signal);
};
