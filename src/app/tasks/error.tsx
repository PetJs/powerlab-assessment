"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <p className="mb-4 text-sm text-[#b91c1c]">
        {error.message || "Something went wrong while loading tasks."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full border border-[#e5e5e5] px-4 py-2 text-sm font-medium text-[#171717]"
      >
        Try again
      </button>
    </div>
  );
}
