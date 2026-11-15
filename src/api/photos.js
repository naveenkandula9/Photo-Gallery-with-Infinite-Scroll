export const PHOTO_REQUEST_TIMEOUT_MS = 60_000;

export class PhotoRequestError extends Error {
  constructor(kind, message, { status = null, cause } = {}) {
    super(message, { cause });
    this.name = "PhotoRequestError";
    this.kind = kind;
    this.status = status;
  }
}

export async function fetchPhotos(page, signal) {
  if (signal?.aborted) throw signal.reason;

  const endpoint = import.meta.env.DEV
    ? "/api/photos"
    : "https://picsum.photos/v2/list";
  const controller = new AbortController();
  const cancel = () => controller.abort(signal.reason);
  signal?.addEventListener("abort", cancel, { once: true });
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, PHOTO_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${endpoint}?page=${page}`, {
      signal: controller.signal,
    });
    if (!response.ok) {
      const message =
        response.status === 522
          ? "Picsum's photo service timed out (HTTP 522). Please try again later."
          : `The photo service returned HTTP ${response.status}. Please try again later.`;
      throw new PhotoRequestError("http", message, { status: response.status });
    }
    const photos = await response.json();
    if (
      !Array.isArray(photos) ||
      photos.some(
        (photo) =>
          !photo ||
          typeof photo.id !== "string" ||
          typeof photo.author !== "string" ||
          typeof photo.download_url !== "string",
      )
    ) {
      throw new PhotoRequestError(
        "invalid-response",
        "The photo service returned an unexpected response. Please retry.",
      );
    }
    return photos;
  } catch (error) {
    // Unmount/StrictMode cancellation is not a failure to show to the user.
    if (signal?.aborted) throw error;
    if (timedOut) {
      throw new PhotoRequestError(
        "timeout",
        "The photo request took longer than 60 seconds. Please retry.",
        { cause: error },
      );
    }
    if (error instanceof PhotoRequestError) throw error;
    if (error instanceof SyntaxError) {
      throw new PhotoRequestError(
        "invalid-response",
        "The photo service returned an unexpected response. Please retry.",
        { cause: error },
      );
    }
    throw new PhotoRequestError(
      "network",
      "We couldn't reach the photo service. Check your connection and retry.",
      { cause: error },
    );
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", cancel);
  }
}
