/**
 * Placeholder grid for the gallery.
 *
 * Rendered from inside the gallery page's own <Suspense> boundary rather than
 * from a loading.tsx file: a segment-level loading file wraps every nested
 * route as well, which made the detail page flash this grid on navigation.
 */
export default function GallerySkeleton() {
  return (
    <section className="mx-auto w-full max-w-7xl flex-1 px-6 py-16 sm:px-10 lg:px-16">
      <div className="mb-10">
        <div className="h-11 w-48 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
        <div className="mt-3 h-4 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800"
          >
            <div className="aspect-square w-full animate-pulse bg-neutral-200 dark:bg-neutral-800" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-3 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
