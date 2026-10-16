import { apiFetch } from './api';

interface UploadSignature {
  uploadUrl: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
}

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/**
 * Uploads an image straight to Cloudinary using a short-lived signature from our API,
 * and returns a URL that serves the best format and quality for each device.
 */
export async function uploadImage(file: File, target: 'products' | 'categories'): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error(`${file.name} is not an image.`);
  if (file.size > MAX_IMAGE_BYTES) throw new Error(`${file.name} is larger than 5 MB.`);

  const sig = await apiFetch<UploadSignature>('/uploads/signature', {
    method: 'POST',
    body: JSON.stringify({ target }),
  });

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sig.apiKey);
  form.append('timestamp', String(sig.timestamp));
  form.append('folder', sig.folder);
  form.append('signature', sig.signature);

  const response = await fetch(sig.uploadUrl, { method: 'POST', body: form });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.secure_url) {
    throw new Error(body?.error?.message || `Upload of ${file.name} failed.`);
  }
  // f_auto,q_auto: Cloudinary picks WebP/AVIF and a sensible quality per browser.
  return String(body.secure_url).replace('/image/upload/', '/image/upload/f_auto,q_auto/');
}
