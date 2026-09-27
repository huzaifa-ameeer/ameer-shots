import ImageCard from "../components/ImageCard";
import { fetchImages } from "../lib/api";

export const metadata = {
  title: "Gallery · AmeerShots",
  description: "Every shot from AmeerShots",
};

export default async function GalleryPage() {
  let images: Awaited<ReturnType<typeof fetchImages>>;

  try {
    images = await fetchImages();
  } catch {
    // Rendered inside the page rather than bubbling to error.tsx, so the
    // navbar stays usable and the user can retry.
    return (
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-32 text-center sm:px-10 lg:px-16">
        <h1 className="text-2xl font-bold tracking-tight">
          Could not load the gallery
        </h1>
        <p className="mt-2 max-w-md text-sm text-neutral-600 dark:text-neutral-400">
          The API did not respond. Make sure the server is running on port
          4000, then refresh this page.
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
