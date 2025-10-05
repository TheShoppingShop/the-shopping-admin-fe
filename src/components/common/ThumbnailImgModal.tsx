import { useState } from "react";

export function ThumbnailCell({ v }: { v: any }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="cursor-pointer"
        onClick={() => v.thumbnailUrl && setOpen(true)}
      >
        {v.thumbnailUrl ? (
          <img
            src={v.thumbnailUrl}
            alt={`${v.title} thumbnail`}
            className="h-12 w-20 rounded object-cover border hover:opacity-80 transition"
          />
        ) : (
          <div className="h-12 w-20 rounded border bg-muted" />
        )}
      </div>

      {/* Modal */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <div className="relative">
            <img
              src={v.thumbnailUrl}
              alt={`${v.title} full`}
              className="max-h-[80vh] max-w-[90vw] rounded-lg shadow-lg border border-gray-700"
            />
            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/80"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
