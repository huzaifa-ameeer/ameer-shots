import Image from "next/image";
import type { ImageItem } from "../lib/api";

/**
 * Single gallery card: image on top, then name and description.
 */
export default function ImageCard({ image }: { image: ImageItem }) {
  return (
    <article className="group overflow-hidden rounded-xl border border-neutral-200 bg-white transition-shadow hover:shadow-lg hover:shadow-neutral-900/5 dark:border-neutral-800 dark:bg-neutral-900/40">
      {/* Square crop keeps every card the same height regardless of the
          original photo's aspect ratio. */}
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800/60">
        <Image
          src={image.imageUrl}
          alt={image.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="p-4">
        <h2 className="truncate font-semibold tracking-tight">{image.name}</h2>

        {image.description ? (
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            {image.description}
          </p>
        ) : (
          <p className="mt-1 text-sm italic text-neutral-400 dark:text-neutral-600">
            No description
          </p>
        )}
      </div>
    </article>
  );
}
