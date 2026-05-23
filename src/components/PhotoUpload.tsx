"use client";

import { upload } from "@vercel/blob/client";
import { useState, useRef } from "react";

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
};

export default function PhotoUpload({ value, onChange, label = "Photo" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const blob = await upload(`phones/${safeName}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload"
      });
      onChange(blob.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-start gap-3">
        {value && (
          <div className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Uploaded photo"
              className="w-24 h-24 object-cover rounded-md border border-gray-300"
            />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-xs text-red-600 hover:underline mt-1 block"
            >
              Remove
            </button>
          </div>
        )}
        <div className="flex-1">
          <label className="btn-secondary cursor-pointer inline-block">
            {uploading ? "Uploading…" : value ? "Replace photo" : "📷 Upload photo"}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              disabled={uploading}
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Tap to pick from your camera roll or take a new photo. Max 15MB.
          </p>
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          {value && (
            <p className="text-xs text-gray-400 mt-1 break-all">
              <span className="text-gray-500">URL:</span> {value}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
