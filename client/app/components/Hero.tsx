/**
 * Landing hero.
 *
 * Static (Server Component) - no client JS needed for this section.
 */
export default function Hero() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center sm:px-10 sm:py-32 lg:px-16 lg:py-25">
      {/* Small label above the headline */}
      <p className="mb-6 text-xs font-medium tracking-[0.3em] text-neutral-500 uppercase dark:text-neutral-400">
        Photography · AmeerShots
      </p>

      {/* Main headline - the three lines carry the same idea as the brief:
          the person, the process, and the output. */}
      <h1 className="max-w-5xl text-5xl leading-[1.05] font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
        <span className="block">I shoot what I{" "}
          <span className="text-neutral-400 dark:text-neutral-600">would want</span>{" "}
          to remember.
        </span>
      </h1>

      {/* Supporting triad: who / what / why */}
      <div className="mt-14 grid max-w-3xl gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-6 text-left transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:border-neutral-700">
          <h2 className="text-sm font-semibold tracking-tight">Who I am</h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            Just a software engineer with a camera, paying attention.
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-6 text-left transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:border-neutral-700">
          <h2 className="text-sm font-semibold tracking-tight">What I take</h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            The light before it goes, and whatever happens next.
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-6 text-left transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:border-neutral-700">
          <h2 className="text-sm font-semibold tracking-tight">What I post</h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            Only the ones that still work the next morning.
          </p>
        </div>
      </div>
    </section>
  );
}
