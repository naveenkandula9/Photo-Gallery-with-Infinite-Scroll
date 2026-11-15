export default function GalleryStatus({
  status,
  error,
  hasMore,
  count,
  retry,
  mode = "live",
  onUseDemo,
}) {
  if (status === "error")
    return (
      <div className="gallery-status error-state" role="alert">
        <p>We couldn’t load {count ? "more photos" : "the photos"}.</p>
        <span>
          {error?.message || "The photos could not be loaded. Please retry."}
        </span>
        <button className="retry-button" onClick={retry}>
          Retry
        </button>
        {mode === "live" && onUseDemo && (
          <>
            <small>
              Browse local sample photos while Picsum is unavailable.
            </small>
            <button className="demo-option" onClick={onUseDemo}>
              Use Demo mode
            </button>
          </>
        )}
      </div>
    );
  if (status === "loading")
    return (
      <div className="gallery-status" role="status">
        <span className="spinner" aria-hidden="true" />
        {count ? "Finding your next perspective…" : "Loading the gallery…"}
      </div>
    );
  if (!hasMore)
    return (
      <div className="gallery-status end-state" role="status">
        <span aria-hidden="true">—</span>
        <p>
          {count
            ? mode === "demo"
              ? "You’ve reached the end of the demo gallery."
              : "End of gallery"
            : "No photos to show yet"}
        </p>
        <small>
          {count
            ? mode === "demo"
              ? "Sample data demonstrates the gallery; it does not verify Picsum availability."
              : "You’ve seen every perspective. Thanks for exploring."
            : "The photo service returned an empty gallery."}
        </small>
      </div>
    );
  return null;
}
