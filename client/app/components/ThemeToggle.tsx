"use client";

/**
 * Light/dark switch for the navbar.
 *
 * The theme lives on the `dark` class of <html> rather than in React state, so
 * the button needs no state of its own: the two icons are swapped with the same
 * `dark:` variants as the rest of the app and the click handler just flips the
 * class and remembers the choice.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  function toggleTheme() {
    const root = document.documentElement;
    const next = root.classList.contains("dark") ? "light" : "dark";

    root.classList.toggle("dark", next === "dark");

    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage can be unavailable (private mode); the theme still switches,
      // it just will not be remembered.
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      className={`inline-flex h-10 w-10 items-center justify-center rounded-md text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:outline-none dark:text-neutral-300 dark:hover:bg-neutral-800 dark:focus-visible:ring-white ${className}`}
    >
      {/* Shown in dark mode, where it switches back to light. */}
      <SunIcon className="hidden dark:block" />
      <MoonIcon className="dark:hidden" />
    </button>
  );
}

/** Sun, for "switch to light". */
function SunIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

/** Moon, for "switch to dark". */
function MoonIcon({ className = "" }: { className?: string }) {
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
      className={className}
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}
