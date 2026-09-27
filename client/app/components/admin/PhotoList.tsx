"use client";

import Image from "next/image";
import type { ImageItem } from "../../lib/api";

/**
 * Picker shown in the "Update or delete" panel: the photo to work on is chosen
 * here, so the sidebar only has to offer the two destinations.
 */
export default function PhotoList({
  images,
  onSelect,
}: {
  images: ImageItem[];
  onSelect: (id: string) => void;
}) {
  if (images.length === 0) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 text-center dark:border-neutral-700">
        <h2 className="text-lg font-semibold tracking-tight">No photos yet</h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-400">
          Add one first, then it shows up here for editing or deleting.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight">
        Update or delete a photo
      </h2>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Pick one to change its name and description, or remove it.
      </p>

      <ul className="mt-6 divide-y divide-neutral-200 overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900/40">
        {images.map((image) => (
          <li key={image._id}>
            <button
              type="button"
              onClick={() => onSelect(image._id)}
              className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral-900 focus-visible:outline-none dark:hover:bg-neutral-800/40 dark:focus-visible:ring-white"
            >
              <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <Image
                  src={image.imageUrl}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold tracking-tight">
                  {image.name}
                </span>
                {image.description ? (
                  <span className="mt-0.5 block truncate text-sm text-neutral-600 dark:text-neutral-400">
                    {image.description}
                  </span>
                ) : (
                  <span className="mt-0.5 block text-sm italic text-neutral-400 dark:text-neutral-600">
                    No description
                  </span>
                )}
              </span>

              <span className="shrink-0 text-neutral-400 dark:text-neutral-600">
                <ChevronIcon />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChevronIcon() {
  return (
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
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}
