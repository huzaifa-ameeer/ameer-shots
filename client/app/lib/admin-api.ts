/**
 * Browser-side calls for the admin panel.
 *
 * Separate from api.ts because these run in the browser and must send the
 * httpOnly session cookie, which requires `credentials: "include"` plus the
 * CORS headers the server already sends.
 *
 * The API lives on its own origin (see CLIENT_ORIGIN in the server's .env), so
 * every call is cross-origin - and the session cookie is only stored for the
 * API's host. That is why the session is checked from here rather than read
 * from a Server Component.
 */
import { API_URL, type ImageItem, type ImagesResponse } from "./api";

export type AdminSession = {
  email: string;
  role: string;
};

/** Error carrying the API's HTTP status, so callers can react to 401 vs 500. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Single place where the admin requests are shaped: credentials, JSON headers
 * and error handling. The API always answers with JSON, but a network failure
 * produces no body at all, hence the `catch` around res.json().
 */
async function adminRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...init,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(
      data?.error ?? `Request failed (${res.status})`,
      res.status,
    );
  }

  return data as T;
}

/** POST /api/auth/login - the cookie comes back in the response headers. */
export function loginAdmin(email: string, password: string): Promise<unknown> {
  return adminRequest("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

/** POST /api/auth/logout - the server expires the cookie. */
export function logoutAdmin(): Promise<unknown> {
  return adminRequest("/api/auth/logout", { method: "POST" });
}

/**
 * GET /api/auth/me - resolves to null when there is no usable session.
 *
 * 401/403 are the expected "signed out" answers, not failures worth showing, so
 * they collapse into null. Anything else (server down, CORS misconfigured) is
 * also reported as null and surfaces as a failed sign-in attempt.
 */
export async function fetchAdminSession(): Promise<AdminSession | null> {
  try {
    return await adminRequest<AdminSession>("/api/auth/me");
  } catch {
    return null;
  }
}

/** GET /api/images - newest first, as the dashboard lists them. */
export async function listImages(): Promise<ImageItem[]> {
  const data = await adminRequest<ImagesResponse>("/api/images");
  return data.images;
}

/**
 * POST /api/images - multipart upload.
 *
 * FormData is passed through untouched: setting Content-Type by hand would drop
 * the multipart boundary the server needs.
 */
export function uploadImage(
  file: File,
  name: string,
  description: string,
): Promise<ImageItem> {
  const body = new FormData();
  body.append("image", file);
  body.append("name", name);
  body.append("description", description);

  return adminRequest<ImageItem>("/api/images", { method: "POST", body });
}

/** PATCH /api/images/:id - only the fields passed are changed. */
export function updateImage(
  id: string,
  updates: { name?: string; description?: string },
): Promise<ImageItem> {
  return adminRequest<ImageItem>(`/api/images/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
}

/** DELETE /api/images/:id - removes the file from Cloudinary and the record. */
export function deleteImage(id: string): Promise<unknown> {
  return adminRequest(`/api/images/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
