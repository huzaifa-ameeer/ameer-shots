"use client";

import { useEffect } from "react";

/** Which panel the main area shows. */
export type AdminView = "add" | "manage";

const items: {
  id: AdminView;
  label: string;
  hint: string;
  icon: () => React.ReactElement;
}[] = [
  { id: "add", label: "Add image", hint: "Upload a new photo", icon: ImagePlusIcon },
  {
    id: "manage",
    label: "Update or delete",
    hint: "Change or remove a photo",
    icon: PencilIcon,
  },
];

/**
 * Admin drawer.
 *
 * Two destinations only - add a photo, or change/remove one. From `lg` up it is
 * a permanent column; below `lg` it slides over the page as an overlay, opened
 * by the panel header toggle and closed by the backdrop, the Escape key or
 * picking a destination.
 */
export default function AdminSidebar({
  open,
  view,
  email,
  onSelectView,
  onClose,
  onLogout,
}: {
  open: boolean;
  view: AdminView;
  email: string;
  onSelectView: (view: AdminView) => void;
  onClose: () => void;
  onLogout: () => void;
}) {
  // Escape closes the drawer, as expected of an overlay menu.
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop, small screens only */}
      <div
        onClick={onClose}
        aria-hidden={!open}
        className={`fixed inset-0 z-40 bg-neutral-950/40 transition-opacity duration-200 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        // Below lg the drawer slides off-canvas and is opened by the panel
        // header toggle. From lg up the toggle is gone and the drawer is a
        // permanent column, so the closed state only has to cancel the slide.
        className={`fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col gap-6 overflow-y-auto border-r border-neutral-200 bg-white px-4 py-5 transition-transform duration-200 ease-out dark:border-neutral-800 dark:bg-neutral-950 lg:sticky lg:top-0 lg:z-30 lg:h-screen ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Heading - the single open/close toggle lives in the panel header */}
        <div>
          <p className="text-lg font-bold tracking-tight">Admin</p>
          <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
            {email}
          </p>
        </div>

        {/* The two destinations */}
        <nav aria-label="Admin sections" className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = item.id === view;

            return (
              <button
                key={item.id}
                type="button"
                // The page decides whether picking a destination also closes the
                // drawer - it stays open on wide screens.
                onClick={() => onSelectView(item.id)}
                aria-current={active}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:outline-none dark:focus-visible:ring-white ${
                  active
                    ? "bg-neutral-100 dark:bg-neutral-800"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                    active
                      ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                      : "border-neutral-300 text-neutral-600 dark:border-neutral-700 dark:text-neutral-400"
                  }`}
                >
                  <Icon />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{item.label}</span>
                  <span className="block truncate text-xs text-neutral-500 dark:text-neutral-500">
                    {item.hint}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:outline-none dark:text-neutral-400 dark:hover:bg-neutral-800 dark:focus-visible:ring-white"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-300 dark:border-neutral-700">
              <SignOutIcon />
            </span>
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

/** Frame with a plus: picking a file to upload. */
function ImagePlusIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8.5 13.5 11 16l4.5-5" />
      <path d="M21 15v6M18 18h6" />
    </svg>
  );
}

/** Pencil in a frame: changing what is already there. */
function PencilIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M14.5 5.5 18.5 9.5" />
      <path d="M13 7 8 12l-1 3.5 3.5-1 5-5" />
    </svg>
  );
}

/** Arrow leaving a door. */
function SignOutIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 8 6 12l4 4" />
      <path d="M6 12h9" />
    </svg>
  );
}
