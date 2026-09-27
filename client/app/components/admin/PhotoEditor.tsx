"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-hot-toast";
import type { ImageItem } from "../../lib/api";
import { ApiError, deleteImage, updateImage } from "../../lib/admin-api";

const fieldClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/20 dark:border-neutral-700 dark:bg-neutral-900/60 dark:placeholder:text-neutral-500 dark:focus:border-white dark:focus:ring-white/20";

/**
 * Editor for the photo picked in the sidebar.
 *
 * Holds the two things an admin can change - name and description - and the
 * delete control, which confirms inline because the server also removes the
 * file from Cloudinary, leaving nothing to undo.
 */
export default function PhotoEditor({
  image,
  onSaved,
  onDeleted,
  onClose,
}: {
  image: ImageItem;
  onSaved: () => void | Promise<void>;
  onDeleted: () => void | Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(image.name);
  const [description, setDescription] = useState(image.description ?? "");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function report(err: unknown, fallback: string) {
    const message = err instanceof ApiError ? err.message : fallback;
    setError(message);
    toast.error(message);
  }

  async function save() {
    const nextName = name.trim();

    if (!nextName) {
      setError("The name cannot be empty");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Both fields always go: "" is how the description gets cleared.
      await updateImage(image._id, {
        name: nextName,
        description: description.trim(),
      });
      toast.success("Photo updated");
      await onSaved();
    } catch (err) {
      report(err, "Could not save the changes.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setDeleting(true);
    setError(null);

    try {
      await deleteImage(image._id);
      toast.success(`"${image.name}" deleted`);
      setConfirming(false);
      await onDeleted();
    } catch (err) {
      report(err, "Could not delete the photo.");
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-2xl font-bold tracking-tight">
            {image.name}
          </h2>
          <Link
            href={`/gallery/${image._id}`}
            className="mt-1 inline-block text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            View in the gallery
          </Link>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950"
        >
          Close
        </button>
      </div>

      {/* Preview */}
      <div className="relative mt-6 aspect-[3/2] w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/40">
        <Image
          src={image.imageUrl}
          alt={image.name}
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-contain"
        />
      </div>

      {/* Editable fields */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
        className="mt-8 space-y-5"
      >
        <div>
          <label
            htmlFor="edit-name"
            className="block text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400"
          >
            Name
          </label>
          <input
            id="edit-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={120}
            className={`${fieldClass} mt-1.5`}
          />
        </div>

        <div>
          <label
            htmlFor="edit-description"
            className="block text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400"
          >
            Description
          </label>
          <textarea
            id="edit-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Optional - shown under the photo"
            className={`${fieldClass} mt-1.5 resize-y`}
          />
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
          >
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>

          <button
            type="button"
            onClick={() => {
              setName(image.name);
              setDescription(image.description ?? "");
              setError(null);
            }}
            disabled={saving}
            className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Delete - the file is removed from Cloudinary too, so it is final */}
      <div className="mt-10 rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
        <h3 className="text-sm font-semibold tracking-tight">Delete photo</h3>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Removes the file from Cloudinary and the record from the database.
        </p>

        {!confirming ? (
          <button
            type="button"
            onClick={() => {
              setError(null);
              setConfirming(true);
            }}
            disabled={deleting}
            className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            Delete
          </button>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="text-sm text-red-700 dark:text-red-300">
              Delete &quot;{image.name}&quot; permanently?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={remove}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={deleting}
                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
