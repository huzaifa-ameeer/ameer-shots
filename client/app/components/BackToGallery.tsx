import Link from "next/link";

/**
 * Back link used by the image detail route (and its not-found state) to return
 * to the gallery. The arrow nudges left on hover to match the direction of
 * travel.
 */
export default function BackToGallery() {
  return (
    <Link
      href="/gallery"
      className="group inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:outline-none dark:text-neutral-400 dark:hover:text-white dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950"
    >
      <svg
        width="20"
        height="20"
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
      Back to gallery
    </Link>
  );
}
