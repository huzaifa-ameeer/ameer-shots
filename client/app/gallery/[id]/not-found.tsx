import BackToGallery from "../../components/BackToGallery";

/**
 * Shown when /gallery/[id] is visited with an id that no longer exists, or was
 * never a valid one.
 */
export default function ImageNotFound() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-6 py-32 text-center sm:px-10 lg:px-16">
      <h1 className="text-2xl font-bold tracking-tight">Image not found</h1>
      <p className="mt-2 max-w-md text-sm text-neutral-600 dark:text-neutral-400">
        This photograph may have been removed from the gallery.
      </p>
      <div className="mt-8">
        <BackToGallery />
      </div>
    </section>
  );
}
