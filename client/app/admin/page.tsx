"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import AdminSidebar, { type AdminView } from "../components/admin/AdminSidebar";
import PhotoEditor from "../components/admin/PhotoEditor";
import PhotoList from "../components/admin/PhotoList";
import UploadForm from "../components/admin/UploadForm";
import type { ImageItem } from "../lib/api";
import {
  ApiError,
  fetchAdminSession,
  listImages,
  logoutAdmin,
} from "../lib/admin-api";

const viewTitles: Record<AdminView, string> = {
  add: "Add image",
  manage: "Update or delete",
};

/**
 * Tracks a media query. The server snapshot is false, so the drawer starts
 * closed while rendering and opens on wide screens once the client takes over.
 */
function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/**
 * Admin dashboard at /admin.
 *
 * The drawer offers two destinations and the main panel follows the current
 * one: the upload form, the list of photos, or the editor for the photo picked
 * from that list.
 *
 * The session cookie is httpOnly and lives on the API's origin, so the check
 * runs in the browser: without a session the visitor is sent to /admin/login
 * before anything else renders.
 */
export default function AdminPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string | null>(null);
  const [images, setImages] = useState<ImageItem[] | null>(null);
  const [view, setView] = useState<AdminView>("add");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // null = follow the breakpoint, true/false = whatever the toggle last chose.
  const [sidebarChoice, setSidebarChoice] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const sidebarOpen = sidebarChoice ?? isDesktop;

  /** Re-reads the list after every add, edit or delete. */
  const refresh = useCallback(async () => {
    try {
      setImages(await listImages());
    } catch (err) {
      // The session can expire while the tab sits open on this page.
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/admin/login");
        return;
      }
      setError(
        err instanceof ApiError ? err.message : "Could not load the photos.",
      );
    }
  }, [router]);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      const session = await fetchAdminSession();

      if (!active) return;

      if (!session) {
        router.replace("/admin/login");
        return;
      }

      setEmail(session.email);
      await refresh();
    }

    checkSession();

    return () => {
      active = false;
    };
  }, [router, refresh]);

  async function onLogout() {
    await logoutAdmin().catch(() => null);
    router.replace("/admin/login");
  }

  /** New photo: refresh the list, then open its editor. */
  async function onAdded(image: ImageItem) {
    setView("manage");
    await refresh();
    setSelectedId(image._id);
  }

  if (email === null) {
    return (
      <section className="flex flex-1 items-center justify-center px-6 py-32 sm:px-10">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Checking session…
        </p>
      </section>
    );
  }

  const selected = selectedId
    ? (images?.find((image) => image._id === selectedId) ?? null)
    : null;

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <AdminSidebar
        open={sidebarOpen}
        view={view}
        email={email}
        onSelectView={(next) => {
          setView(next);
          // Leaving the editor resets the selection, so returning to this view
          // shows the list rather than a photo from before.
          if (next !== "manage") setSelectedId(null);
          // On a phone the drawer covers the page, so get out of the way.
          // On a wide screen it stays put and the panel swaps content.
          if (!isDesktop) setSidebarChoice(false);
        }}
        onClose={() => {
          // On a wide screen the drawer is permanent, so nothing to close.
          if (!isDesktop) setSidebarChoice(false);
        }}
        onLogout={onLogout}
      />

      <div className="min-w-0 flex-1">
        {/*
          Panel header. Below lg this row also carries the drawer toggle; from
          lg up the drawer is permanent, so the toggle disappears and the row
          collapses to the title and the link.
        */}
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-neutral-200 px-6 py-4 sm:px-10 lg:grid-cols-[1fr_auto] lg:px-30 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => setSidebarChoice(!sidebarOpen)}
            aria-expanded={sidebarOpen}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            className="-ml-1 inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:outline-none lg:hidden dark:text-neutral-300 dark:hover:bg-neutral-800 dark:focus-visible:ring-white"
          >
            <SidebarToggleIcon open={sidebarOpen} />
          </button>
          <h1 className="text-base font-semibold tracking-tight">
            {viewTitles[view]}
          </h1>

          <Link
            href="/gallery"
            className="justify-self-end rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950"
          >
            View gallery
          </Link>
        </div>

        <main className="px-6 py-8 sm:px-10 lg:px-30 lg:py-10">
          {error ? (
            <p
              role="alert"
              className="mb-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
            >
              {error}
            </p>
          ) : null}

          {view === "add" ? (
            <div className="mx-auto w-full max-w-3xl">
              <UploadForm onUploaded={onAdded} />
            </div>
          ) : images === null ? (
            <div className="space-y-3">
              {[0, 1, 2].map((row) => (
                <div
                  key={row}
                  className="h-20 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
                />
              ))}
            </div>
          ) : selected ? (
            <div className="mx-auto w-full max-w-3xl">
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:outline-none dark:text-neutral-400 dark:hover:text-white dark:focus-visible:ring-white"
              >
                <ArrowIcon />
                All photos
              </button>

              {/* Keyed on the id so the fields reset when the selection changes. */}
              <PhotoEditor
                key={selected._id}
                image={selected}
                onSaved={refresh}
                onDeleted={async () => {
                  setSelectedId(null);
                  await refresh();
                }}
                onClose={() => setSelectedId(null)}
              />
            </div>
          ) : (
            <div className="mx-auto w-full max-w-3xl">
              <PhotoList images={images} onSelect={setSelectedId} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/**
 * The one control for the drawer: a panel icon whose arrow rotates to point
 * the way the drawer will move - left to collapse it, right to bring it back.
 */
function SidebarToggleIcon({ open }: { open: boolean }) {
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
      <rect x="3" y="3" width="18" height="18" rx="3" />
      {/* divider marking the panel side */}
      <path d="M9.5 3v18" />
      <path
        d="M16 9.5 13 12l3 2.5"
        className={`transition-transform duration-200 ${open ? "" : "rotate-180"}`}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />
    </svg>
  );
}

/** Left arrow for "back to the list". */
function ArrowIcon() {
  return (
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
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}
