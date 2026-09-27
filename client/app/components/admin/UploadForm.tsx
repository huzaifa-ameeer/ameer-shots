"use client";

import Image from "next/image";
import { useRef, useState, type FormEvent } from "react";
import { toast } from "react-hot-toast";
import type { ImageItem } from "../../lib/api";
import { ApiError, uploadImage } from "../../lib/admin-api";

/** Matches multer's `limits.fileSize` in the server's image router. */
const MAX_BYTES = 5 * 1024 * 1024;

const fieldClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/20 dark:border-neutral-700 dark:bg-neutral-900/60 dark:placeholder:text-neutral-500 dark:focus:border-white dark:focus:ring-white/20";

const labelClass =
  "block text-sm font-medium text-neutral-700 dark:text-neutral-300";

/**
 * Add-photo form: pick a file, give it a name and a description, upload.
 *
 * The chosen file is previewed from an object URL, which is revoked again on
 * the next pick so the blob is not kept alive. The created image is handed back
 * to the caller so the panel can jump straight to its editor.
 */
export default function UploadForm({
  onUploaded,
}: {
  onUploaded: (image: ImageItem) => void | Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0] ?? null;

    setFile(picked);
    setError(null);

    if (preview) URL.revokeObjectURL(preview);
    setPreview(picked ? URL.createObjectURL(picked) : null);

    // Pre-fill the name from the filename until the admin types their own.
    if (picked && !name.trim()) {
      setName(
        picked.name
          .replace(/\.[^.]+$/, "")
          .replace(/[-_]+/g, " ")
          .trim(),
      );
    }
  }

  function reset() {
    setFile(null);
    setName("");
    setDescription("");
    if (inputRef.current) inputRef.current.value = "";
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!file) {
      setError("Choose an image first");
      return;
    }

    if (file.size > MAX_BYTES) {
      setError("Images must be 5 MB or smaller");
      return;
    }

    setSubmitting(true);

    const title = name.trim();

    try {
      const created = await uploadImage(file, title, description.trim());
      toast.success(`"${title}" added to the gallery`);
      await onUploaded(created);
      reset();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Upload failed. Please retry.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900/40"
    >
      <h2 className="text-lg font-semibold tracking-tight">Add a photo</h2>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Uploads go straight to the gallery.
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-[180px_1fr]">
        {/* Preview / picker */}
        <div>
          {preview ? (
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
              <Image
                src={preview}
                alt="Selected upload preview"
                fill
                unoptimized
                sizes="180px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-square w-full items-center justify-center rounded-xl border border-dashed border-neutral-300 text-xs text-neutral-400 dark:border-neutral-700">
              Preview
            </div>
          )}
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label htmlFor="file" className={labelClass}>
              Image file
            </label>
            <input
              ref={inputRef}
              id="file"
              type="file"
              accept="image/*"
              required
              onChange={onPick}
              className="mt-1.5 block w-full text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-neutral-700 dark:text-neutral-400 dark:file:bg-white dark:file:text-neutral-900 dark:hover:file:bg-neutral-200"
            />
            <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-500">
              JPG, PNG or WebP, up to 5 MB.
            </p>
          </div>

          <div>
            <label htmlFor="upload-name" className={labelClass}>
              Name
            </label>
            <input
              id="upload-name"
              type="text"
              required
              maxLength={120}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={`${fieldClass} mt-1.5`}
              placeholder="Golden hour on the balcony"
            />
          </div>

          <div>
            <label htmlFor="upload-description" className={labelClass}>
              Description
            </label>
            <textarea
              id="upload-description"
              rows={3}
              maxLength={1000}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={`${fieldClass} mt-1.5 resize-y`}
              placeholder="Optional - shown under the photo"
            />
          </div>
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950"
      >
        {submitting ? "Adding…" : "Add photo"}
      </button>
    </form>
  );
}
