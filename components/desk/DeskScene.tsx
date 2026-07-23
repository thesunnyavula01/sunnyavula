"use client";

// Phase 1 replaces this with the interactive react-three-fiber "aerial desk":
// a top-down 3D desk where scroll drives the camera and four objects
// (papers, laptop, ticker, gavel + mic) are clickable hotspots -> section routes.
export function DeskScene() {
  return (
    <div className="relative flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-black/20 bg-black/[0.03] dark:border-white/20 dark:bg-white/[0.03]">
      <div className="text-center">
        <p className="text-sm uppercase tracking-widest text-black/40 dark:text-white/40">
          Aerial desk · 3D
        </p>
        <p className="mt-2 text-black/50 dark:text-white/50">
          Interactive scene lands in Phase 1
        </p>
      </div>
    </div>
  );
}
