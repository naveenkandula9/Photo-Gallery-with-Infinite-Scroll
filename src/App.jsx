import { useEffect, useRef, useState } from "react";
import { fetchPhotos } from "./api/photos.js";
import { fetchDemoPhotos, DEMO_PAGE_COUNT } from "./data/demoPhotos.js";
import { usePhotos } from "./hooks/usePhotos.js";
import PhotoCard from "./components/PhotoCard.jsx";
import GalleryStatus from "./components/GalleryStatus.jsx";

function GallerySession({ mode, onUseDemo }) {
  const { photos, status, hasMore, loadedPage, error, loadNext, retry } =
    usePhotos(mode === "demo" ? fetchDemoPhotos : fetchPhotos, {
      pageLimit: mode === "demo" ? DEMO_PAGE_COUNT : Infinity,
    });
  const [likes, setLikes] = useState({});
  const sentinel = useRef(null);

  useEffect(() => {
    if (status !== "ready" || !hasMore || !("IntersectionObserver" in window))
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadNext();
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [status, hasMore, loadedPage, loadNext]);

  return (
    <>
      <div className="intro">
        <div>
          <p className="eyebrow intro-label">
            <span /> THE EVERYDAY COLLECTION
          </p>
          <h1>
            A little inspiration.
            <br />
            <span>One photo at a time.</span>
          </h1>
          <p className="intro-description">
            Discover the world through someone else’s lens.
            <br className="desktop-break" /> Keep scrolling. Give your favorites
            a little love.
          </p>
        </div>
        <div className="collection-note">
          <span className="live-dot" />
          {photos.length
            ? `${photos.length} photos discovered`
            : "Curated by curiosity"}
        </div>
      </div>
      <div className="list-heading">
        <span>THE GALLERY</span>
        <span>
          SCROLL TO EXPLORE <span aria-hidden="true">↓</span>
        </span>
      </div>
      <ul
        className="photo-list"
        aria-label="Photographs"
        aria-busy={status === "loading"}
      >
        {photos.map((photo, index) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            mode={mode}
            index={index}
            likes={likes[photo.id] || 0}
            onLike={() =>
              setLikes((previous) => ({
                ...previous,
                [photo.id]: (previous[photo.id] || 0) + 1,
              }))
            }
          />
        ))}
      </ul>
      {status === "loading" && photos.length === 0 && (
        <div className="skeleton-card" aria-hidden="true">
          <div />
          <span />
        </div>
      )}
      <GalleryStatus
        status={status}
        mode={mode}
        error={error}
        hasMore={hasMore}
        count={photos.length}
        retry={retry}
        onUseDemo={onUseDemo}
      />
      <div ref={sentinel} className="sentinel" aria-hidden="true" />
      {photos.length > 0 && hasMore && status !== "error" && (
        <button
          className="retry-button load-more"
          onClick={() => loadNext()}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Loading photos…" : "Load more photos"}
        </button>
      )}
      <footer>
        <span>A collection of moments, made to be explored.</span>
        {mode === "demo" ? (
          <span>Local sample photos · NASA and NPS · Public domain</span>
        ) : (
          <span>
            Photos from{" "}
            <a href="https://picsum.photos/" target="_blank" rel="noreferrer">
              Lorem Picsum ↗
            </a>
          </span>
        )}
      </footer>
    </>
  );
}

export default function App() {
  const [mode, setMode] = useState("live");
  return (
    <>
      <a className="skip-link" href="#gallery">
        Skip to gallery
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="#" aria-label="Photo Gallery home">
            <img src="/favicon.svg" alt="" width="36" height="36" />
            <span>
              Photo Gallery<span className="brand-dot">.</span>
            </span>
          </a>
          <span className="header-note">A new perspective, every scroll</span>
        </div>
      </header>
      <main id="gallery" className="main-content">
        <section className="mode-bar" aria-label="Gallery data source">
          <fieldset className="mode-selector">
            <legend>Photo source</legend>
            <label>
              <input
                type="radio"
                name="source"
                value="live"
                checked={mode === "live"}
                onChange={() => setMode("live")}
              />{" "}
              Live (Picsum)
            </label>
            <label>
              <input
                type="radio"
                name="source"
                value="demo"
                checked={mode === "demo"}
                onChange={() => setMode("demo")}
              />{" "}
              Demo
            </label>
          </fieldset>
          <p className={"mode-label " + mode} role="status">
            {mode === "demo"
              ? "Demo mode — sample data"
              : "Live mode — Picsum API"}
          </p>
          <small>Switching source resets photos and likes.</small>
        </section>
        <GallerySession
          key={mode}
          mode={mode}
          onUseDemo={() => setMode("demo")}
        />
      </main>
    </>
  );
}
