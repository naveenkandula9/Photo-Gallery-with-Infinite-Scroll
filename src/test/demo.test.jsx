import {
  render,
  screen,
  waitFor,
  act,
  within,
  cleanup,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import App from "../App.jsx";
import {
  fetchDemoPhotos,
  DEMO_PAGE_COUNT,
  DEMO_PHOTO_COUNT,
} from "../data/demoPhotos.js";

let observers;
beforeEach(() => {
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
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 522 }));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
async function scrollNext() {
  await waitFor(() => expect(observers.some((o) => o.active)).toBe(true));
  act(() =>
    observers
      .filter((o) => o.active)
      .forEach((o) => o.callback([{ isIntersecting: true }])),
  );
}

it("provides 29 distinct sample photos over six finite pages without fetching", async () => {
  const batches = await Promise.all(
    Array.from({ length: DEMO_PAGE_COUNT + 1 }, (_, index) =>
      fetchDemoPhotos(index + 1),
    ),
  );
  expect(DEMO_PHOTO_COUNT).toBe(29);
  expect(batches.map((batch) => batch.length)).toEqual([5, 5, 5, 5, 5, 4, 0]);
  expect(new Set(batches.flat().map((photo) => photo.id)).size).toBe(
    DEMO_PHOTO_COUNT,
  );
  expect(new Set(batches.flat().map((photo) => photo.download_url)).size).toBe(
    DEMO_PHOTO_COUNT,
  );
  expect(
    batches
      .flat()
      .every((photo) => !photo.download_url.includes("picsum.photos")),
  ).toBe(true);
  expect(fetch).not.toHaveBeenCalled();
  const controller = new AbortController();
  controller.abort();
  await expect(fetchDemoPhotos(1, controller.signal)).rejects.toMatchObject({
    name: "AbortError",
  });
});

it("defaults to live, keeps its 522 error, and only switches after an explicit selection", async () => {
  render(<App />);
  expect(screen.getByRole("radio", { name: "Live (Picsum)" })).toBeChecked();
  expect(await screen.findByRole("alert")).toHaveTextContent("HTTP 522");
  expect(screen.queryByText("Demo mode — sample data")).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Use Demo mode" }));
  await screen.findByRole("heading", { name: "NASA / William Anders" });
  expect(screen.getByText("Demo mode — sample data")).toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(
    screen.queryByText("Photography via Lorem Picsum"),
  ).not.toBeInTheDocument();
});

it("appends all finite demo pages and keeps repeated likes independent without further live requests", async () => {
  render(<App />);
  await screen.findByRole("alert");
  await userEvent.click(screen.getByRole("radio", { name: "Demo" }));
  const first = await screen.findByRole("button", {
    name: "Like photo 1 by NASA / William Anders",
  });
  const calls = fetch.mock.calls.length;
  expect(screen.getAllByRole("listitem")).toHaveLength(5);
  await userEvent.click(first);
  await userEvent.click(first);
  first.focus();
  await userEvent.keyboard("{Enter} ");
  expect(within(first).getByText("4")).toBeInTheDocument();
  expect(
    within(
      screen.getByRole("button", {
        name: "Like photo 2 by NASA / Apollo 17 crew",
      }),
    ).getByText("0"),
  ).toBeInTheDocument();
  await userEvent.click(
    screen.getByRole("button", { name: "Load more photos" }),
  );
  await waitFor(() => expect(screen.getAllByRole("listitem")).toHaveLength(10));
  for (const expected of [15, 20, 25, 29]) {
    await scrollNext();
    await waitFor(() =>
      expect(screen.getAllByRole("listitem")).toHaveLength(expected),
    );
  }
  await screen.findByText("You’ve reached the end of the demo gallery.");
  expect(
    screen.queryByRole("button", { name: "Load more photos" }),
  ).not.toBeInTheDocument();
  expect(within(first).getByText("4")).toBeInTheDocument();
  expect(fetch).toHaveBeenCalledTimes(calls);
  expect(observers.every((o) => !o.active)).toBe(true);
  await userEvent.click(screen.getByRole("radio", { name: "Live (Picsum)" }));
  await screen.findByRole("alert");
  await userEvent.click(screen.getByRole("radio", { name: "Demo" }));
  const reset = await screen.findByRole("button", {
    name: "Like photo 1 by NASA / William Anders",
  });
  expect(within(reset).getByText("0")).toBeInTheDocument();
  expect(screen.getAllByRole("listitem")).toHaveLength(5);
});

it("aborts live requests on switching and ignores delayed live results", async () => {
  let finish;
  let signal;
  fetch.mockImplementation((url, options) => {
    signal = options.signal;
    return new Promise((resolve) => {
      finish = resolve;
    });
  });
  render(<App />);
  await userEvent.click(screen.getByRole("radio", { name: "Demo" }));
  await screen.findByRole("heading", { name: "NASA / William Anders" });
  expect(signal.aborted).toBe(true);
  await act(async () =>
    finish({
      ok: true,
      json: async () => [
        {
          id: "live-1",
          author: "Delayed live author",
          download_url: "https://picsum.photos/id/1/500/300",
        },
      ],
    }),
  );
  expect(screen.queryByText("Delayed live author")).not.toBeInTheDocument();
  expect(screen.getByText("Demo mode — sample data")).toBeInTheDocument();
});

it("shares one in-flight request between the manual button and observer", async () => {
  let finish;
  fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: "1", author: "First", download_url: "https://example.com/1.jpg" },
      ],
    })
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
  render(<App />);
  await screen.findByRole("heading", { name: "First" });
  await waitFor(() =>
    expect(observers.some((observer) => observer.active)).toBe(true),
  );
  const observer = observers.find((observer) => observer.active);
  act(() => {
    fireEvent.click(screen.getByRole("button", { name: "Load more photos" }));
    observer.callback([{ isIntersecting: true }]);
    observer.callback([{ isIntersecting: true }]);
  });
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(
    screen.getByRole("button", { name: "Loading photos…" }),
  ).toBeDisabled();
  await act(async () =>
    finish({
      ok: true,
      json: async () => [
        {
          id: "2",
          author: "Second",
          download_url: "https://example.com/2.jpg",
        },
      ],
    }),
  );
  await screen.findByRole("heading", { name: "Second" });
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
});
