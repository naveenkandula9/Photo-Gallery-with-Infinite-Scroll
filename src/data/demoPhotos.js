import earthrise from "../assets/demo/earthrise.jpg";
import blueMarble from "../assets/demo/blue-marble.jpg";
import bootprint from "../assets/demo/lunar-bootprint.jpg";
import aldrin from "../assets/demo/aldrin-on-moon.jpg";
import launch from "../assets/demo/apollo11-launch.jpg";
import parkPhotoCredits from "./parkPhotoCredits.json";

const images = import.meta.glob("../assets/demo/nps-*.jpg", {
  eager: true,
  query: "?url",
  import: "default",
});
const photos = [
  { id: "demo-01", author: "NASA / William Anders", download_url: earthrise },
  { id: "demo-02", author: "NASA / Apollo 17 crew", download_url: blueMarble },
  { id: "demo-03", author: "NASA / Buzz Aldrin", download_url: bootprint },
  { id: "demo-04", author: "NASA / Neil Armstrong", download_url: aldrin },
  { id: "demo-05", author: "NASA", download_url: launch },
  ...parkPhotoCredits.map((photo, index) => {
    const url = images[`../assets/demo/${photo.file}`];
    if (!url) throw new Error(`Missing local demo photo: ${photo.file}`);
    return {
      id: `demo-${String(index + 6).padStart(2, "0")}`,
      author: photo.credit,
      title: photo.title,
      download_url: url,
    };
  }),
];
export const DEMO_PAGE_SIZE = 5;
export const DEMO_PHOTO_COUNT = photos.length;
export const DEMO_PAGE_COUNT = Math.ceil(DEMO_PHOTO_COUNT / DEMO_PAGE_SIZE);
export async function fetchDemoPhotos(page, signal) {
  if (signal?.aborted) throw signal.reason;
  const start = (page - 1) * DEMO_PAGE_SIZE;
  return photos
    .slice(start, start + DEMO_PAGE_SIZE)
    .map((photo) => ({ ...photo }));
}
