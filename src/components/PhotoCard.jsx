import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp } from "@fortawesome/free-solid-svg-icons";

export default function PhotoCard({
  photo,
  index,
  likes,
  onLike,
  mode = "live",
}) {
  const [broken, setBroken] = useState(false);
  return (
    <li className="photo-card">
      <div className="photo-frame">
        {broken ? (
          <div
            className="image-fallback"
            role="img"
            aria-label={`Photo by ${photo.author} unavailable`}
          >
            <span aria-hidden="true">▧</span>
            <p>This photo couldn’t load</p>
            <small>The photographer’s credit is below.</small>
          </div>
        ) : (
          <img
            src={photo.download_url}
            alt={
              photo.title
                ? `${photo.title}, photograph by ${photo.author}`
                : `Photograph by ${photo.author}`
            }
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
            onError={() => setBroken(true)}
          />
        )}
        <span className="photo-number" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div className="photo-details">
        <div>
          <p className="eyebrow">BEHIND THE LENS</p>
          <h2>{photo.author}</h2>
          <p className="photo-credit">
            {mode === "demo"
              ? "Local sample · Public domain"
              : "Photography via Lorem Picsum"}
          </p>
        </div>
        <button
          className={`like-button ${likes ? "has-likes" : ""}`}
          type="button"
          onClick={onLike}
          aria-label={`Like photo ${index + 1} by ${photo.author}`}
        >
          <FontAwesomeIcon icon={faThumbsUp} aria-hidden="true" />
          <span>Like</span>
          <span className="like-count" aria-live="polite" aria-atomic="true">
            {likes}
            <span className="sr-only"> likes</span>
          </span>
        </button>
      </div>
    </li>
  );
}
