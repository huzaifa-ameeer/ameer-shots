/**
 * Skeleton shown while a single image is being fetched.
 */
export default function ImageLoading() {
  return (
    <section className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 sm:px-10 sm:py-14 lg:px-16">
      <div className="h-5 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />

      <div className="mt-8 aspect-[3/2] w-full animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" />

      <div className="mt-10 space-y-4">
        <div className="h-10 w-3/4 animate-pulse rounded-lg bg-neutral-200 sm:h-12 dark:bg-neutral-800" />
        <div className="h-6 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-6 w-2/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      </div>
    </section>
  );
}
