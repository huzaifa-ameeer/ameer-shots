import { Suspense } from "react";
import GallerySkeleton from "../components/GallerySkeleton";
import ImageCard from "../components/ImageCard";
import { fetchImages } from "../lib/api";

export const metadata = {
  description: "Every shot from AmeerShots",
};

/**
 * The API is a separate service that can be asleep when this request arrives -
 * on Render's free plan a cold start takes tens of seconds - so the route needs
 * a generous execution budget rather than the platform default.
 */
export const maxDuration = 60;

/**
 * The request is awaited inside a child component so the skeleton is bound to
 * this page only. A loading.tsx file in this segment would also wrap
 * /gallery/[id], showing the grid on the way to a single photo.
 */
export default function GalleryPage() {
  return (
    <Suspense fallback={<GallerySkeleton />}>
      <GalleryContent />
    </Suspense>
  );
}

async function GalleryContent() {
  let images: Awaited<ReturnType<typeof fetchImages>>;

  try {
    images = await fetchImages();
  } catch (error) {
    // Rendered inside the page rather than bubbling to error.tsx, so the
    // navbar stays usable and the user can retry. The reason from fetchImages
    // is shown verbatim: a wrong API URL and a failing API need different fixes.
    return (
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-32 text-center sm:px-10 lg:px-16">
        <h1 className="text-2xl font-bold tracking-tight">
          Could not load the gallery
        </h1>
        <p className="mt-2 max-w-md text-sm text-neutral-600 dark:text-neutral-400">
          {error instanceof Error ? error.message : "The API did not respond."}
        </p>
        <p className="mt-1 max-w-md text-sm text-neutral-600 dark:text-neutral-400">
          Check that the Express API is running and that the client points at
          it, then refresh this page.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl flex-1 px-6 py-16 sm:px-10 lg:px-16">
      {/* Page heading */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Gallery
        </h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          {images.total === 0
            ? "Nothing here yet"
            : `${images.total} ${images.total === 1 ? "photograph" : "photographs"}`}
        </p>
      </div>

      {images.images.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 py-24 text-center dark:border-neutral-700">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            No images yet. Once the admin uploads something it will show up
            here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {images.images.map((image) => (
            <ImageCard key={image._id} image={image} />
          ))}
        </div>
      )}
    </section>
  );
}
