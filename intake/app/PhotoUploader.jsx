"use client";

import { useRef } from "react";
import { upload } from "@vercel/blob/client";

// Photos are sent to Vercel Blob straight from the browser, byte for byte.
// The file is never resized, cropped or re-encoded here. The preview
// thumbnail below is only a local display copy.

const ACCEPT = "image/jpeg,image/png,image/webp";
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MULTIPART_THRESHOLD = 8 * 1024 * 1024;
const PARALLEL_UPLOADS = 3;

function readDimensions(file) {
  return new Promise((resolve) => {
    const previewUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () =>
      resolve({
        previewUrl,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    img.onerror = () => resolve({ previewUrl, width: 0, height: 0 });
    img.src = previewUrl;
  });
}

function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function softNote(item, role) {
  if (item.status !== "done" && item.status !== "uploading") return "";
  if (item.width && item.width < 1200) {
    return "This photo is quite small. Larger originals look best, but you are welcome to keep it.";
  }
  if (role === "cover" && item.width && item.height > item.width) {
    return "This is a portrait photo. The cover works best as a landscape photo, but you can keep it.";
  }
  return "";
}

export default function PhotoUploader({
  role,
  title,
  description,
  max,
  items,
  setItems,
}) {
  const inputRef = useRef(null);
  const filesRef = useRef(new Map());
  const remaining = max - items.length;

  const patchItem = (id, patch) =>
    setItems((list) =>
      list.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );

  async function sendFile(id) {
    const file = filesRef.current.get(id);
    if (!file) return;
    patchItem(id, { status: "uploading", progress: 0, error: "" });
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const blob = await upload(`intake/${role}/${safeName}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        contentType: file.type,
        multipart: file.size > MULTIPART_THRESHOLD,
        onUploadProgress: ({ percentage }) =>
          patchItem(id, { progress: Math.round(percentage) }),
      });
      patchItem(id, { status: "done", progress: 100, url: blob.url });
    } catch (err) {
      patchItem(id, {
        status: "error",
        error: "This photo did not upload. Please try again.",
      });
    }
  }

  async function addFiles(fileList) {
    const picked = Array.from(fileList || []);
    const rejected = picked.filter((f) => !ALLOWED.includes(f.type));
    const accepted = picked
      .filter((f) => ALLOWED.includes(f.type))
      .slice(0, Math.max(remaining, 0));

    const prepared = [];
    for (const file of accepted) {
      const dims = await readDimensions(file);
      const id = `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      filesRef.current.set(id, file);
      prepared.push({
        id,
        name: file.name,
        size: file.size,
        previewUrl: dims.previewUrl,
        width: dims.width,
        height: dims.height,
        status: "uploading",
        progress: 0,
        url: "",
        error: "",
      });
    }

    if (rejected.length) {
      prepared.push(
        ...rejected.map((f, i) => ({
          id: `${role}-rejected-${Date.now()}-${i}`,
          name: f.name,
          size: f.size,
          previewUrl: "",
          width: 0,
          height: 0,
          status: "rejected",
          progress: 0,
          url: "",
          error: "Please use a JPG, PNG or WebP photo.",
        }))
      );
    }

    if (!prepared.length) return;
    setItems((list) => [...list, ...prepared]);

    const queue = prepared.filter((p) => p.status === "uploading").map((p) => p.id);
    const workers = Array.from(
      { length: Math.min(PARALLEL_UPLOADS, queue.length) },
      async () => {
        while (queue.length) {
          const next = queue.shift();
          await sendFile(next);
        }
      }
    );
    await Promise.all(workers);
  }

  function removeItem(id) {
    filesRef.current.delete(id);
    setItems((list) => {
      const gone = list.find((it) => it.id === id);
      if (gone?.previewUrl) URL.revokeObjectURL(gone.previewUrl);
      return list.filter((it) => it.id !== id);
    });
  }

  const canAdd = remaining > 0;

  return (
    <div className="space-y-3 rounded-lg border border-line bg-white/40 p-5">
      <div>
        <p className="text-sm font-medium tracking-wide text-ink">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-ink/60">{description}</p>
      </div>

      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item) => {
            const note = softNote(item, role);
            return (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-md border border-line/70 bg-white/60 p-2"
              >
                {item.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.previewUrl}
                    alt=""
                    className="h-14 w-14 flex-shrink-0 rounded object-cover"
                  />
                ) : (
                  <div className="h-14 w-14 flex-shrink-0 rounded bg-line/40" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink">{item.name}</p>
                  <p className="text-xs text-ink/50">
                    {formatSize(item.size)}
                    {item.width ? ` \u00b7 ${item.width} \u00d7 ${item.height}` : ""}
                  </p>
                  {item.status === "uploading" && (
                    <div className="mt-1 h-1 w-full overflow-hidden rounded bg-line/50">
                      <div
                        className="h-1 bg-wine transition-all"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                  {item.status === "done" && (
                    <p className="text-xs text-sage">Uploaded</p>
                  )}
                  {(item.status === "error" || item.status === "rejected") && (
                    <p className="text-xs text-wine">{item.error}</p>
                  )}
                  {note && <p className="text-xs text-ink/50">{note}</p>}
                </div>
                {item.status === "error" && (
                  <button
                    type="button"
                    onClick={() => sendFile(item.id)}
                    className="text-xs text-wine underline underline-offset-2"
                  >
                    Retry
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-xs text-ink/50 underline underline-offset-2"
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {canAdd && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            multiple={max > 1}
            className="hidden"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full rounded-md border border-dashed border-line bg-white/50 px-4 py-3 text-sm text-ink transition-colors hover:border-wine/50"
          >
            {max === 1
              ? "Choose a photo"
              : items.length
              ? `Add more photos (${items.length} of ${max})`
              : `Choose photos (up to ${max})`}
          </button>
        </>
      )}
    </div>
  );
}
