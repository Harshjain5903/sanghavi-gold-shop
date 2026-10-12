import { auth } from './firebase';

// Backend base URL. Local dev defaults to the API on port 4000; production uses
// VITE_API_URL, and features that need the API stay off until it is set.
const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') || (import.meta.env.DEV ? 'http://localhost:4000/api' : '');

export const isApiConfigured = (): boolean => API_URL !== '';

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

/** Calls the backend with the signed-in user's Firebase ID token attached. */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_URL) throw new ApiError(0, 'The server is not configured yet.');

  const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError(0, 'Could not reach the server. Please try again.');
  }

  if (response.status === 204) return undefined as T;
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message;
    throw new ApiError(response.status, message || `Request failed (${response.status})`);
  }
  return body as T;
}
