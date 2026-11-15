import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { expect, it } from "vitest";
import credits from "../data/parkPhotoCredits.json";

it("includes 29 distinct local JPEGs and unique source references", () => {
  const files = [
    "earthrise.jpg",
    "blue-marble.jpg",
    "lunar-bootprint.jpg",
    "aldrin-on-moon.jpg",
    "apollo11-launch.jpg",
    ...credits.map((photo) => photo.file),
  ];
  expect(files).toHaveLength(29);
  expect(new Set(credits.map((photo) => photo.asset)).size).toBe(24);
  const hashes = files.map((file) => {
    const bytes = readFileSync(resolve(process.cwd(), "src/assets/demo", file));
    expect(bytes.readUInt16BE(0)).toBe(0xffd8);
    return createHash("sha256").update(bytes).digest("hex");
  });
  expect(new Set(hashes).size).toBe(29);
});
