/**
 * Typed client for the Express API.
 *
 * Only used from Server Components for now, so requests never hit CORS.
 * The same base URL is reused later for browser-side admin actions, which do
 * need the CORS headers the server now sends.
 */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/** Shape of a gallery image as returned by GET /api/images. */
export type ImageItem = {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  publicId: string;
  createdAt: string;
  updatedAt: string;
};

export type ImagesResponse = {
  total: number;
  page: number;
  images: ImageItem[];
};

/**
 * Fetches the image list.
 *
 * Throws if the API is unreachable so the nearest error boundary can take
 * over instead of rendering a half-built page.
 */
export async function fetchImages(): Promise<ImagesResponse> {
  const res = await fetch(`${API_URL}/api/images`, {
    // Always read fresh data; the gallery changes whenever the admin uploads.
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load images (${res.status})`);
  }

  return res.json();
}

/**
 * Fetches one image by its Mongo id.
 *
 * A missing image (404) and a malformed id (400) both resolve to `null` so the
 * caller can render the not-found UI - neither is a server fault. Every other
 * failure throws, matching fetchImages.
 */
export async function fetchImageById(id: string): Promise<ImageItem | null> {
  const res = await fetch(`${API_URL}/api/images/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });

  if (res.status === 400 || res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to load image (${res.status})`);
  }

  return res.json();
}
