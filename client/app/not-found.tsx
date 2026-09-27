import Link from "next/link";

/**
 * Global 404 - rendered for any URL that does not match a route.
 *
 * Sits inside the root layout, so the navbar and footer-less page frame are
 * already in place and only the content area is filled here.
 */
export default function NotFound() {
  return (
    <section className="relative flex flex-1 flex-col items-center justify-center px-6 py-15 mb-7 text-center sm:px-10">
      {/* Soft glow behind the badge, purely decorative. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-100 blur-3xl dark:bg-neutral-900"
      />

      {/* Broken frame badge */}
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="text-neutral-400 dark:text-neutral-500"
        >
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="m3.5 16 5-5 4 4 3-3 5 5" />
          <circle cx="9" cy="8.5" r="1.5" />
        </svg>
      </div>

      <p className="relative mt-8 bg-gradient-to-r from-neutral-900 to-neutral-500 bg-clip-text text-7xl font-bold tracking-tight text-transparent sm:text-8xl dark:from-white dark:to-neutral-400">
        404
      </p>

      <h1 className="relative mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
        This page is out of frame
      </h1>
      <p className="relative mt-3 max-w-md text-sm text-neutral-600 sm:text-base dark:text-neutral-400">
        The address may be mistyped, or the page may have been moved. The
        gallery is still right where you left it.
      </p>

      <div className="relative mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
        {/* Primary: back to home, arrow nudges in the direction of travel. */}
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:outline-none dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="transition-transform group-hover:-translate-x-1"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>

        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950"
        >
          Browse the gallery
        </Link>
      </div>
    </section>
  );
}
