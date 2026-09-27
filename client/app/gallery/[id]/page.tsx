import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import BackToGallery from "../../components/BackToGallery";
import { fetchImageById } from "../../lib/api";

/**
 * Same reasoning as /gallery: the API may need waking up, so the route gets a
 * generous execution budget.
 */
export const maxDuration = 60;

/**
 * Single photograph page at /gallery/[id].
 *
 * Server Component: the id arrives in the URL, so the image is fetched and
 * rendered on the server with no client round trip.
 */
export async function generateMetadata({
  params,
}: PageProps<"/gallery/[id]">): Promise<Metadata> {
  const { id } = await params;

  // Failures are swallowed here - the page itself reports them, and metadata
  // should never be the reason a page fails to render.
  const image = await fetchImageById(id).catch(() => null);

  // No title here on purpose: the site title stays "AmeerShots" everywhere and
  // is inherited from the root layout.
  if (!image) return {};

  return {
    description: image.description || undefined,
    openGraph: {
      images: [image.imageUrl],
    },
  };
}

export default async function ImagePage({ params }: PageProps<"/gallery/[id]">) {
  const { id } = await params;

  let image: Awaited<ReturnType<typeof fetchImageById>>;

  try {
    image = await fetchImageById(id);
  } catch {
    // Rendered inside the page rather than bubbling to error.tsx, so the
    // navbar and the back link stay usable and the user can retry.
    return (
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-32 text-center sm:px-10 lg:px-16">
        <h1 className="text-2xl font-bold tracking-tight">
          Could not load this image
        </h1>
        <p className="mt-2 max-w-md text-sm text-neutral-600 dark:text-neutral-400">
          The API did not respond. Make sure the server is running on port
          4000, then refresh this page.
        </p>
        <div className="mt-8">
          <BackToGallery />
        </div>
      </section>
    );
  }

  // Unknown or deleted id - render the segment's not-found UI.
  if (!image) notFound();

  return (
    <article className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 sm:px-10 sm:py-14 lg:px-16">
      <BackToGallery />

      {/* object-contain in a fixed-ratio box: the photo keeps its own aspect
          ratio, and the surrounding padding absorbs the difference. */}
      <div className="relative mt-8 aspect-[3/2] w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/40">
        <Image
          src={image.imageUrl}
          alt={image.name}
          fill
          // Largest contentful element on the page.
          fetchPriority="high"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1024px"
          className="object-contain"
        />
      </div>

      <h1 className="mt-10 text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
        {image.name}
      </h1>

      {image.description ? (
        <p className="mt-4 max-w-3xl text-pretty text-lg leading-relaxed text-neutral-600 sm:text-xl sm:leading-relaxed dark:text-neutral-300">
          {image.description}
        </p>
      ) : (
        <p className="mt-4 text-lg italic text-neutral-400 dark:text-neutral-600">
          No description
        </p>
      )}
    </article>
  );
}
