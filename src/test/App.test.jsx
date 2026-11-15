import { StrictMode } from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App.jsx";
import { fetchPhotos, PHOTO_REQUEST_TIMEOUT_MS } from "../api/photos.js";

const photo = (id, author = `Author ${id}`) => ({
  id,
  author,
  download_url: `https://example.com/${id}.jpg`,
});
const response = (data) => ({ ok: true, json: async () => data });
let observers;
let fetchMock;

beforeEach(() => {
  vi.stubEnv("DEV", true);
  observers = [];
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback) {
        this.callback = callback;
        this.active = true;
        observers.push(this);
      }
      observe() {}
      disconnect() {
        this.active = false;
      }
    },
  );
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

async function approachBottom() {
  await waitFor(() =>
    expect(observers.some((observer) => observer.active)).toBe(true),
  );
  act(() =>
    observers
      .filter((observer) => observer.active)
      .forEach((observer) => observer.callback([{ isIntersecting: true }])),
  );
}

describe("gallery", () => {
  it("explains an initial Picsum 522 and retries page 1", async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 522 })
      .mockResolvedValueOnce(response([photo("1")]));
    render(<App />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Picsum's photo service timed out (HTTP 522). Please try again later.",
    );
    expect(screen.queryByText("End of gallery")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    await screen.findByAltText("Photograph by Author 1");
    expect(fetchMock.mock.calls.map((call) => call[0])).toEqual(
      Array(2).fill("/api/photos?page=1"),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("preserves photos and repeated likes across a later-page 522 and retry", async () => {
    fetchMock
      .mockResolvedValueOnce(response([photo("1"), photo("2")]))
      .mockResolvedValueOnce({ ok: false, status: 522 })
      .mockResolvedValueOnce(response([photo("3")]));
    render(<App />);
    const first = await screen.findByRole("button", {
      name: "Like photo 1 by Author 1",
    });
    await userEvent.click(first);
    await userEvent.click(first);
    await approachBottom();
    expect(await screen.findByRole("alert")).toHaveTextContent("HTTP 522");
    expect(within(first).getByText("2")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    await screen.findByAltText("Photograph by Author 3");
    expect(within(first).getByText("2")).toBeInTheDocument();
    expect(
      within(
        screen.getByRole("button", { name: "Like photo 2 by Author 2" }),
      ).getByText("0"),
    ).toBeInTheDocument();
    expect(fetchMock.mock.calls.map((call) => call[0])).toEqual([
      "/api/photos?page=1",
      "/api/photos?page=2",
      "/api/photos?page=2",
    ]);
  });

  it("loads page 1 using download_url and author, appends pages 2 and 3, deduplicates, and stops at an empty page", async () => {
    fetchMock
      .mockResolvedValueOnce(response([photo("1")]))
      .mockResolvedValueOnce(response([photo("1"), photo("2"), photo("2")]))
      .mockResolvedValueOnce(response([photo("3")]))
      .mockResolvedValueOnce(response([]));
    render(<App />);
    expect(screen.getByText("Loading the gallery…")).toBeInTheDocument();
    expect(
      await screen.findByAltText("Photograph by Author 1"),
    ).toHaveAttribute("src", "https://example.com/1.jpg");
    expect(
      screen.getByRole("heading", { name: "Author 1" }),
    ).toBeInTheDocument();
    await approachBottom();
    await screen.findByAltText("Photograph by Author 2");
    await approachBottom();
    await screen.findByAltText("Photograph by Author 3");
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    await approachBottom();
    await screen.findByText("End of gallery");
    expect(fetchMock.mock.calls.map((call) => call[0])).toEqual(
      [1, 2, 3, 4].map((page) => `/api/photos?page=${page}`),
    );
    expect(observers.every((observer) => !observer.active)).toBe(true);
  });

  it("shows an initial empty state", async () => {
    fetchMock.mockResolvedValue(response([]));
    render(<App />);
    await screen.findByText("No photos to show yet");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("retries the initial failed page", async () => {
    fetchMock
      .mockRejectedValueOnce(new Error("Offline"))
      .mockResolvedValueOnce(response([photo("1")]));
    render(<App />);
    await userEvent.click(await screen.findByRole("button", { name: "Retry" }));
    await screen.findByAltText("Photograph by Author 1");
    expect(fetchMock.mock.calls.map((call) => call[0])).toEqual(
      Array(2).fill("/api/photos?page=1"),
    );
  });

  it("preserves photos and likes after a failure and retries the same page", async () => {
    fetchMock
      .mockResolvedValueOnce(response([photo("1")]))
      .mockRejectedValueOnce(new Error("Offline"))
      .mockResolvedValueOnce(response([photo("2")]));
    render(<App />);
    const like = await screen.findByRole("button", {
      name: "Like photo 1 by Author 1",
    });
    await userEvent.click(like);
    await approachBottom();
    await screen.findByRole("alert");
    expect(screen.queryByText("End of gallery")).not.toBeInTheDocument();
    expect(within(like).getByText("1")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    await screen.findByAltText("Photograph by Author 2");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(fetchMock.mock.calls.slice(1).map((call) => call[0])).toEqual(
      Array(2).fill("/api/photos?page=2"),
    );
    expect(within(like).getByText("1")).toBeInTheDocument();
  });

  it("increments independent likes on every mouse or keyboard activation and uses Font Awesome", async () => {
    fetchMock.mockResolvedValue(response([photo("1"), photo("2")]));
    render(<App />);
    const first = await screen.findByRole("button", {
      name: "Like photo 1 by Author 1",
    });
    const second = screen.getByRole("button", {
      name: "Like photo 2 by Author 2",
    });
    expect(within(first).getByText("0")).toBeInTheDocument();
    await userEvent.click(first);
    await userEvent.click(first);
    first.focus();
    await userEvent.keyboard("{Enter} ");
    expect(within(first).getByText("4")).toBeInTheDocument();
    expect(within(second).getByText("0")).toBeInTheDocument();
    expect(
      first.querySelector('svg[data-icon="thumbs-up"]'),
    ).toBeInTheDocument();
  });

  it("does not overlap page requests even when the observer fires repeatedly", async () => {
    let finish;
    fetchMock
      .mockResolvedValueOnce(response([photo("1")]))
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finish = resolve;
          }),
      );
    render(<App />);
    await screen.findByAltText("Photograph by Author 1");
    await waitFor(() => expect(observers.length).toBeGreaterThan(0));
    const observer = observers.at(-1);
    act(() => {
      for (let i = 0; i < 5; i++) observer.callback([{ isIntersecting: true }]);
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await act(async () => finish(response([photo("2")])));
    await screen.findByAltText("Photograph by Author 2");
  });

  it("keeps loading after a nonempty duplicate-only page", async () => {
    fetchMock
      .mockResolvedValueOnce(response([photo("1")]))
      .mockResolvedValueOnce(response([photo("1")]))
      .mockResolvedValueOnce(response([photo("2")]));
    render(<App />);
    await screen.findByAltText("Photograph by Author 1");
    const before = observers.length;
    await approachBottom();
    await waitFor(() => expect(observers.length).toBeGreaterThan(before));
    await approachBottom();
    await screen.findByAltText("Photograph by Author 2");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("replaces a broken image with an accessible fallback", async () => {
    fetchMock.mockResolvedValue(response([photo("1")]));
    render(<App />);
    fireEvent.error(await screen.findByAltText("Photograph by Author 1"));
    expect(
      screen.getByRole("img", { name: "Photo by Author 1 unavailable" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Like photo 1 by Author 1" }),
    ).toBeInTheDocument();
  });

  it("cancels obsolete StrictMode requests and disconnects observers on unmount", async () => {
    const pending = [];
    fetchMock.mockImplementation(
      (url, { signal }) =>
        new Promise((resolve) => pending.push({ resolve, signal })),
    );
    const view = render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    expect(pending).toHaveLength(2);
    expect(pending[0].signal.aborted).toBe(true);
    await act(async () => pending[1].resolve(response([photo("2")])));
    await screen.findByAltText("Photograph by Author 2");
    await act(async () => pending[0].resolve(response([photo("1")])));
    expect(
      screen.queryByAltText("Photograph by Author 1"),
    ).not.toBeInTheDocument();
    view.unmount();
    expect(observers.every((observer) => !observer.active)).toBe(true);
  });

  it("aborts a pending photo request on unmount", async () => {
    let requestSignal;
    fetchMock.mockImplementation(
      (url, { signal }) =>
        new Promise((resolve, reject) => {
          requestSignal = signal;
          signal.addEventListener("abort", () => reject(signal.reason), {
            once: true,
          });
        }),
    );
    const view = render(<App />);
    expect(requestSignal.aborted).toBe(false);
    await act(async () => view.unmount());
    expect(requestSignal.aborted).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("API validation", () => {
  it("retains HTTP 522 metadata without parsing the error HTML", async () => {
    const json = vi.fn();
    fetchMock.mockResolvedValue({ ok: false, status: 522, json });
    await expect(fetchPhotos(1)).rejects.toMatchObject({
      kind: "http",
      status: 522,
    });
    expect(json).not.toHaveBeenCalled();
  });

  it("classifies network and invalid JSON failures separately", async () => {
    fetchMock
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new SyntaxError("Invalid JSON");
        },
      });
    await expect(fetchPhotos(1)).rejects.toMatchObject({ kind: "network" });
    await expect(fetchPhotos(1)).rejects.toMatchObject({
      kind: "invalid-response",
    });
  });

  it.each(["headers", "body"])(
    "times out after 60 seconds while waiting for %s and clears the timer",
    async (phase) => {
      vi.useFakeTimers();
      let requestSignal;
      fetchMock.mockImplementation((url, { signal }) => {
        requestSignal = signal;
        const pending = () =>
          new Promise((resolve, reject) => {
            signal.addEventListener("abort", () => reject(signal.reason), {
              once: true,
            });
          });
        return phase === "headers"
          ? pending()
          : Promise.resolve({ ok: true, json: pending });
      });
      const pending = fetchPhotos(1);
      const rejected = expect(pending).rejects.toMatchObject({
        kind: "timeout",
        status: null,
      });
      await vi.advanceTimersByTimeAsync(PHOTO_REQUEST_TIMEOUT_MS - 1);
      expect(requestSignal.aborted).toBe(false);
      await vi.advanceTimersByTimeAsync(1);
      await rejected;
      expect(requestSignal.aborted).toBe(true);
      expect(vi.getTimerCount()).toBe(0);
    },
  );

  it("forwards cancellation without treating it as a network failure and removes its listener", async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const remove = vi.spyOn(controller.signal, "removeEventListener");
    let requestSignal;
    fetchMock.mockImplementation(
      (url, { signal }) =>
        new Promise((resolve, reject) => {
          requestSignal = signal;
          signal.addEventListener("abort", () => reject(signal.reason), {
            once: true,
          });
        }),
    );
    const pending = fetchPhotos(1, controller.signal);
    const rejected = expect(pending).rejects.toMatchObject({
      name: "AbortError",
    });
    controller.abort();
    await rejected;
    expect(requestSignal.aborted).toBe(true);
    expect(remove).toHaveBeenCalledWith("abort", expect.any(Function));
    expect(vi.getTimerCount()).toBe(0);
  });

  it("clears the deadline and abort listener after success", async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const remove = vi.spyOn(controller.signal, "removeEventListener");
    fetchMock.mockResolvedValue(response([]));
    await fetchPhotos(1, controller.signal);
    expect(remove).toHaveBeenCalledWith("abort", expect.any(Function));
    expect(vi.getTimerCount()).toBe(0);
  });

  it("does not send an already cancelled request", async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(fetchPhotos(1, controller.signal)).rejects.toMatchObject({
      name: "AbortError",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uses the local proxy in development and forwards the page and cancellation signal", async () => {
    const controller = new AbortController();
    fetchMock.mockResolvedValue(response([photo("1")]));
    await expect(fetchPhotos(2, controller.signal)).resolves.toEqual([
      photo("1"),
    ]);
    expect(fetchMock).toHaveBeenCalledWith("/api/photos?page=2", {
      signal: expect.any(AbortSignal),
    });
  });

  it("uses the public Picsum endpoint in production", async () => {
    vi.stubEnv("DEV", false);
    fetchMock.mockResolvedValue(response([]));
    await fetchPhotos(3);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://picsum.photos/v2/list?page=3",
      { signal: expect.any(AbortSignal) },
    );
  });

  it("rejects HTTP failures", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 503 });
    await expect(fetchPhotos(1)).rejects.toThrow("503");
  });
  it.each([
    { data: {} },
    { data: [null] },
    { data: [{ id: "1", author: "Name" }] },
  ])("rejects malformed data %#", async ({ data }) => {
    fetchMock.mockResolvedValue(response(data));
    await expect(fetchPhotos(1)).rejects.toThrow("unexpected response");
  });
});
