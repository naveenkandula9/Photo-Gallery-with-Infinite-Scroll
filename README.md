# Photo Gallery

A single-page photo gallery built for the Exactspace assignment using React, Vite, JavaScript, and plain CSS. Photos appear in one vertical list, with photographer credits and a Font Awesome thumbs-up button. Scrolling appends additional API pages; every button activation adds one like to that photo.

## Live and Demo modes

The app starts in **Live (Picsum)** on every refresh and retains the required Picsum integration. When that service is unavailable, select **Demo** in the Photo source controls. The interface explicitly displays **Demo mode — sample data**; errors never switch the source automatically.

Demo uses 29 distinct bundled local photographs, including the original five NASA images and 24 nature/travel photographs from the National Park Service. It opens with five photos, appends up to five more per page, and stops after the last page with **“You’ve reached the end of the demo gallery.”** Photos are never recycled. Automatic scrolling and the optional Load more photos button share one request lock and page counter. The button is disabled while loading and disappears at the end; Live errors retain Retry and offer an explicit Use Demo mode button. Demo images and records need no external service. Optional Google Fonts use local sans-serif fallback if unavailable; the local server must remain running.

Switching either direction cancels the old session, restarts at page 1, and resets likes to zero. Likes remain independent and increase on every activation. Demo demonstrates the application; **it does not verify the live Picsum service**. Live retains its API, timeout, error messages, and Retry behavior. A failed live request is never an empty final page.

### Sample image attribution

The original five JPEGs in `src/assets/demo/` are NASA photographs identified as public domain on their linked source pages; see [NASA's image/media guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/).

| Local filename        | Credit                                                                                   | Source and public-domain reference                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `earthrise.jpg`       | NASA / William Anders                                                                    | [Earthrise](https://commons.wikimedia.org/wiki/File:NASA-Apollo8-Dec24-Earthrise.jpg)              |
| `blue-marble.jpg`     | NASA / Apollo 17 crew; source crop and brightness/contrast/gamma adjustment by Deglr6328 | [Blue Marble](https://commons.wikimedia.org/wiki/File:The_Blue_Marble.jpg)                         |
| `lunar-bootprint.jpg` | NASA / Buzz Aldrin                                                                       | [Apollo 11 bootprint](https://commons.wikimedia.org/wiki/File:Apollo_11_bootprint.jpg)             |
| `aldrin-on-moon.jpg`  | NASA / Neil Armstrong                                                                    | [Buzz Aldrin on the Moon](https://commons.wikimedia.org/wiki/File:Aldrin_Apollo_11.jpg)            |
| `apollo11-launch.jpg` | NASA                                                                                     | [Apollo 11 launch](https://commons.wikimedia.org/wiki/File:Apollo_11_Launch_-_GPN-2000-000630.jpg) |

Among the original five photos, Earthrise uses the original source JPEG; the other four use 960px previews from the source, without further edits. CSS crops their display frames without distortion. No runtime image hotlinks or substitute API provider are used.

### Additional nature and travel photographs

Each NPS asset below explicitly lists public-domain reuse in its source metadata. The credit is retained in each card and here; the Sahale image includes its requested courtesy credit. Source previews or originals are stored unchanged locally, as indicated in the manifest. Every original asset ID is distinct. These are sample photos and never replace Picsum in Live mode.

| Local file   | Subject                                | Photographer / required credit                           | Source and public-domain metadata                                                       |
| ------------ | -------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `nps-06.jpg` | Lower Falls, Yellowstone River         | NPS / Diane Renkin                                       | [NPS asset](https://npgallery.nps.gov/AssetDetail/65ae005b-611a-4750-9e65-408ec21db36d) |
| `nps-07.jpg` | Sunrise from Sahale Glacier Camp       | Courtesy of North Cascades National Park Service Complex | [NPS asset](https://npgallery.nps.gov/AssetDetail/3c95838731d24c2b91cedafcf3e0c6f3)     |
| `nps-08.jpg` | Gorham Mountain and Sand Beach, Acadia | NPS / Victoria Stauffenberg                              | [NPS asset](https://npgallery.nps.gov/AssetDetail/d9165282-413b-4c13-aaa5-f935fe6e105f) |
| `nps-09.jpg` | Sandstone Falls viewing deck           | NPS / Dave Bieri                                         | [NPS asset](https://npgallery.nps.gov/AssetDetail/3e75e14e-21d7-4dd0-aa76-59997bffedfb) |
| `nps-10.jpg` | Mountain view from Kuwohi              | NPS                                                      | [NPS asset](https://npgallery.nps.gov/AssetDetail/28871cb0-1dd8-b71c-07c3-29eb1bb7680b) |
| `nps-11.jpg` | Purple Mountain hiking trail           | NPS / Diane Renkin                                       | [NPS asset](https://npgallery.nps.gov/AssetDetail/1a736724-ddad-4572-bf26-d31975bf3909) |
| `nps-12.jpg` | Gorham Mountain summit                 | NPS / Victoria Stauffenberg                              | [NPS asset](https://npgallery.nps.gov/AssetDetail/3d426afd-c7b9-4ef9-8777-b4f7a9d69f5d) |
| `nps-13.jpg` | Mount Storm King forest trail          | NPS / Nicole Segnini                                     | [NPS asset](https://npgallery.nps.gov/AssetDetail/aa769f9b-dda2-4b50-bf95-d21f285c6c5b) |
| `nps-14.jpg` | Desert pond, Capitol Reef              | NPS / USGS                                               | [NPS asset](https://npgallery.nps.gov/AssetDetail/b04992b7-a5ad-4902-8080-cf38a746a4c8) |
| `nps-15.jpg` | Glenn Springs Road, Big Bend           | NPS                                                      | [NPS asset](https://npgallery.nps.gov/AssetDetail/a2bff689-b996-4671-9f98-901cec98d562) |
| `nps-16.jpg` | George Rogers Clark Memorial statue    | National Park Service                                    | [NPS asset](https://npgallery.nps.gov/AssetDetail/9321204e-0d4c-83ce-2dc2-8248d7e0542d) |
| `nps-17.jpg` | Statue of Liberty Fort Wood doors      | HDP / Paul Davidson and Ryan Pierce                      | [NPS asset](https://npgallery.nps.gov/AssetDetail/471b4e45-1dec-4c8b-aa82-394c3d047297) |
| `nps-18.jpg` | Statue of Liberty on Liberty Island    | NPS Photo                                                | [NPS asset](https://npgallery.nps.gov/AssetDetail/3454fd91-1dd8-b71b-0b21-a93398840c35) |
| `nps-19.jpg` | Little River Trail                     | NPS Photo                                                | [NPS asset](https://npgallery.nps.gov/AssetDetail/c1eda4f1-a592-4e38-ab73-dc58d3c22cac) |
| `nps-20.jpg` | Long Point forest trail                | NPS / Dave Bieri                                         | [NPS asset](https://npgallery.nps.gov/AssetDetail/bb3624f9-8999-4c32-aeb5-c821d9677f8e) |
| `nps-21.jpg` | Old lodgepole pine forest              | NPS / Diane Renkin                                       | [NPS asset](https://npgallery.nps.gov/AssetDetail/092e6a08-1fd8-43ef-8a31-1597eadd6c46) |
| `nps-22.jpg` | Redstone sandstone landscape           | Lake Mead National Recreation Area / Andrew Cattoir      | [NPS asset](https://npgallery.nps.gov/AssetDetail/1bbb54f2-821f-4380-bbfd-c461b6e51159) |
| `nps-23.jpg` | Little River Trail wooden bridge       | NPS Photo                                                | [NPS asset](https://npgallery.nps.gov/AssetDetail/da834159-9dfc-4897-94e2-dde0b59eb17e) |
| `nps-24.jpg` | Lake habitat, Olympic National Park    | NPS / USGS / Collin Eagles-Smith                         | [NPS asset](https://npgallery.nps.gov/AssetDetail/55e40441-11c9-4839-b2cb-4715c01f46f4) |
| `nps-25.jpg` | Skew Arch Bridge                       | NPS                                                      | [NPS asset](https://npgallery.nps.gov/AssetDetail/436d4769-a908-41b0-9d3b-fa63e7824363) |
| `nps-26.jpg` | Cape Lookout Lighthouse at night       | National Park Service                                    | [NPS asset](https://npgallery.nps.gov/AssetDetail/8b290fe6-1dd8-b71c-074c-708914ee82ea) |
| `nps-27.jpg` | Humpback Bridge over Boundary Channel  | NPS / Victoria Stauffenberg                              | [NPS asset](https://npgallery.nps.gov/AssetDetail/408fd244-9536-4ea5-ac2c-94373e1d7c20) |
| `nps-28.jpg` | New River Gorge Bridge                 | Gary Hartley                                             | [NPS asset](https://npgallery.nps.gov/AssetDetail/bad7e122-7e3f-4555-9a4f-c90ebfd4a2b1) |
| `nps-29.jpg` | James River bridge, Blue Ridge Parkway | NPS / Victoria Stauffenberg                              | [NPS asset](https://npgallery.nps.gov/AssetDetail/f825bda3-7342-470e-a377-9ca9b4bc1fcb) |

## Prerequisites and quick start

Use Node.js 22.12+ (Node 24 recommended), npm, and an internet connection for package installation and Picsum images/API requests. This project is independent of any other app. Run the commands in this folder:

```sh
npm install
npm run dev
```

Open the Local URL printed by Vite, normally http://localhost:5173. Stop the server with Ctrl+C.

If the app was already running before the CORS proxy change, stop it with Ctrl+C, run `npm run dev` again, and refresh the browser. No dependency reinstall is needed for this change. To check the local proxy directly, open `http://localhost:5173/api/photos?page=1` (use your actual Vite port); it should return a JSON array of photos.

```sh
npm test             # Run automated tests once
npm run test:watch   # Watch tests while developing
npm run build        # Generate production assets in dist/
npm run preview      # Preview a successful production build locally
```

If your environment forces offline npm installs, use `npm install --offline=false` on a connection that can reach registry.npmjs.org. An `ECONNREFUSED` error means the registry connection failed; it is separate from the application's API behavior.

## Project structure

```text
public/favicon.svg          Local gallery brand mark
src/
  api/photos.js             Fetch and validate a Picsum page
  hooks/usePhotos.js        Pagination, deduplication, cancellation, retry
  components/
    PhotoCard.jsx           Image, author, and independent like button
    GalleryStatus.jsx       Loading, error, empty, and end states
  test/
    setup.js                DOM matchers and cleanup
    App.test.jsx            Behavior and API-validation tests
  App.jsx                   Gallery layout, observer, and likes
  main.jsx                  React root with StrictMode
  styles.css                Responsive design and accessibility styles
index.html                  HTML entry and page metadata
vite.config.js              React and Vitest configuration
plan.text                   Original brief (preserved)
```

## How it works

In development, `fetchPhotos` calls `/api/photos?page=N` on the same origin as the app. Vite proxies it to `https://picsum.photos/v2/list?page=N`, preserving the page query. This avoids the browser CORS failure observed with direct requests from localhost. Production builds use the public Picsum URL directly. The original `download_url` becomes each image's source, and the API's `author` becomes its visible credit. Failed HTTP responses or malformed JSON data are errors, not the end of the list.

`usePhotos` requests page 1 on mount and maintains the next page, accumulated photos, and loading/error/end state. A synchronous request lock prevents overlapping requests. Photos are deduplicated by `id`; the page advances after a successful response, including duplicate-only pages. Only an empty response ends pagination. Retry requests the failed page without removing earlier photos or likes. Cancellation and request versions prevent obsolete responses from changing state during unmounts or StrictMode's development effect checks.

`App` observes a bottom sentinel with a 400px margin. When it comes near the viewport, it requests another page. Re-observing after each successful page lets short lists and duplicate-only pages keep loading while the sentinel remains visible. Automatic requests pause on error until Retry is activated. Load more photos is also available when more data remains, even with IntersectionObserver support. Both controls call the same loadNext function. Demo supplies a derived six-page limit so it ends immediately after the thirtieth photo; Live still ends only after an empty API page.

Likes are stored in React state keyed by photo ID. Every click, Enter, or Space activation increments the chosen photo's count. This is not a like/unlike toggle. Counts start at zero, remain independent, survive pagination/retries, and reset on refresh. They are neither shared nor saved to a server. The icon comes from `@fortawesome/free-solid-svg-icons` via the official `@fortawesome/react-fontawesome` component; no paid kit is used.

The gallery remains one column at all sizes. Each card places the image alongside its details on desktop and stacks the details below the image under 640px. Images have fixed proportions and `object-fit: cover`, which can crop edges without stretching. The first image loads eagerly; later images load lazily. Failed images become accessible placeholders while credit and likes stay available. Native buttons, focus outlines, a skip link, status messages, and reduced-motion styles support keyboard and assistive-technology use.

## Testing and verification status

The Vitest/React Testing Library suite covers both data sources. `App.test.jsx` covers Live behavior, cancellation/cleanup, deadlines, HTTP 522, retries preserving photos and likes, pagination, deduplication, keyboard/mouse likes, Font Awesome, request locking, StrictMode, and malformed responses. `demo.test.jsx` covers finite sample pages, Live as the default, mode labels, no new Live requests after selecting Demo, repeated sample likes, switching/resetting, and obsolete Live responses. Fetch and IntersectionObserver are mocked; these tests do not prove live service availability.

Dependencies are installed. The updated full test suite and production build were attempted but remain blocked by this execution environment's `spawn EPERM` restriction in Vite's Windows path resolution. Separate in-process checks passed against the actual API helper and React pagination hook with controlled Fetch and clock implementations: HTTP 522 metadata/messages without parsing error HTML, network/invalid-response classification, header/body deadlines, cancellation and cleanup, pages 1–3 appending/deduplicating, preservation of existing photos, paused requests after failure, retrying the same page, error clearing, and empty-page termination. These checks do not establish that the full UI suite passes. Run `npm test` and `npm run build` from your normal terminal and complete the browser checks below.

Live browser diagnosis reproduced HTTP 522 through the local proxy and directly from Picsum pages 1 and 2, each after approximately 39 seconds. Successful live photo loading remains unverified while this upstream failure persists.

Historical five-photo Demo verification (before this expansion) is reported separately:

- **Local sample checks passed:** all five JPEG files decoded successfully; direct checks of the real Demo provider and hook confirmed 2/2/1 pages, unique records, cancellation, fixture isolation, zero Live provider calls, and honest termination.
- **Browser checks passed with local sample data:** selecting Demo displayed its label and local photos; scrolling appended all five photos and reached the end message. Two clicks and Enter raised one count to 3 while others stayed at 0. Switching to Live and back reset the Demo feed to two photos with zero likes. All five images displayed, and the gallery remained one column at narrow (approximately 300px) and wider (approximately 850px) viewport widths.
- **Live checks:** a fresh browser request still returned HTTP 522 during verification. Separate direct requests for live pages 1, 2, and 3 from the restricted executor each reached a 10-second deadline without a response; these are executor timeouts, not additional observed HTTP 522 responses. Successful Live loading is not established by Demo results.
- **Full automated suite and build:** attempted again after this change; still blocked by `spawn EPERM` before tests/build could complete. They are not reported as passing. Formatting and isolated source checks passed.

Before submission, perform these browser checks:

1. Confirm real photos and authors load and the thumb icon appears.
2. Scroll to the bottom repeatedly; ensure new photos append and previous likes remain.
3. Click one thumb repeatedly, then activate it using Tab/Enter/Space; confirm only its count changes.
4. Inspect at 375px and desktop widths; confirm one column, readable credits, visible buttons, no horizontal overflow, and visible keyboard focus.
5. After initial data loads, temporarily take the browser offline, scroll to request another page, restore the connection, and press Retry. Confirm existing photos remain and loading resumes.

Empty-page termination and malformed responses are covered with controlled test fixtures rather than assuming the live service returns a particular last-page number.

### Current 29-photo verification

- **Demo:** direct checks of the real React interface with mocked Live responses and local sample data passed for explicit error-to-Demo switching, manual and automatic page appends, repeated mouse/keyboard likes, independent counts, the final end message, source resets, and simultaneous request locking. Separate checks confirmed all 29 JPEGs decode and have distinct SHA-256 hashes, all 24 NPS source IDs are unique, and the real pagination hook produces page sizes 5/5/5/5/5/4 and stops without requesting a seventh page. The final page deliberately contains four photos, reflecting the user's choice to use the photos already downloaded.
- **Live API (November 15, 2026, 21:34 IST):** direct requests to Picsum pages 1, 2, and 3 each returned HTTP 200 with 30 records containing `id`, `author`, and `download_url`. This confirms the endpoint responded to direct requests at that time; an end-to-end browser check of the expanded gallery was not performed in this environment.
- **Suite/build:** the full Vitest suite and Vite production build were attempted but could not complete because this execution environment rejects Vite's child process with `spawn EPERM`. The in-process checks above are separate and do not establish a full suite/build pass. A fresh browser/mobile layout inspection of the expanded gallery remains unverified.

## Deployment and limitations

This is a frontend-only static app: no backend, database, login, API key, or environment variables are required. After `npm run build`, deploy `dist/` to a static host. Use `npm run build` as the build command and `dist` as the publish directory. No router rewrite is required for this single-page, single-route app.

The default Vite base path is `/`, suitable for root-domain hosting. For GitHub Pages under a repository subpath, set `base: '/YOUR-REPOSITORY-NAME/'` in `vite.config.js` and change the favicon URLs in `index.html` and `App.jsx` to use the configured base before building. Other static hosts at a domain root need no change.

The Vite development proxy routes API-list requests through the local server to handle browser CORS restrictions. Its target, page-query rewrite, and HTTPS-validation defaults were checked and are correct. Image URLs remain the original API `download_url` values.

During diagnosis on November 15, 2026, `/api/photos?page=1` returned HTTP 522 with `Server: cloudflare` and an HTML page titled `picsum.photos | 522: Connection timed out`. Opening `https://picsum.photos/v2/list?page=1` and `https://picsum.photos/v2/list?page=2` directly in Chrome produced the same error. The page reported **Browser Working, Cloudflare Working, Host Error**. This identifies a failure on Cloudflare's connection to Picsum's origin on the tested route, not a confirmed worldwide outage. See [Cloudflare's HTTP 522 explanation](https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-5xx-errors/error-522/). Repository changes cannot repair that external connection.

HTTP failures retain their status in `PhotoRequestError` and flow through the hook to the error display. A 522 explicitly explains that Picsum timed out, instead of telling every user to check their connection. Network and malformed-response errors have separate messages. Each request has a 60-second deadline covering both response headers and JSON-body loading; completion or cancellation clears the timer and abort listener. Retry requests the failed page and retains earlier photos and likes. No automatic retry loop or fallback photo provider is used. When Picsum recovers, press Retry; if errors persist, compare the direct API URL and record its status. DNS/TLS/connection errors in Vite's terminal should be investigated separately from an HTTP 522 response.

The proxy is configured under Vite's `server` setting only. It is **not included in `dist/` and is not provided by `npm run preview`**. Production builds continue to request Picsum directly; verify CORS from the deployed origin before submission. If that origin is blocked too, deployment needs an explicitly configured server-side proxy or an upstream CORS fix. Do not assume local success establishes production access.

Picsum availability and large original image sizes are outside the app's control. Lazy loading reduces initial transfers, but original `download_url` images can still use significant bandwidth. Photos and DOM entries remain in memory as you scroll; virtualization is intentionally omitted for this assignment. Google Fonts supplies DM Sans/Manrope, with local sans-serif fallbacks if unavailable. Images can be cropped to fit their frames. Likes are session-only.

## Simple interview explanation

“I split the application into a page-fetching API helper, a pagination hook, and reusable photo cards and status components. An IntersectionObserver watches the bottom of the list and asks the hook for the next page. The hook appends unique photos, blocks overlapping requests, and retries the same page after failures. Each image uses its API download URL and shows its photographer's name. Likes live in a React state object indexed by photo ID, so every click increments only that photo. CSS keeps the gallery in one column and changes the arrangement inside each card for mobile.”

## Publish your public GitHub repository

First install dependencies, run tests/build, and finish the browser checks. A successful `npm install` creates `package-lock.json`; commit it with the source for reproducible installs. The `.gitignore` excludes dependencies, builds, logs, caches, and environment files.

1. On GitHub, create a new **public** repository named `exactspace-photo-gallery`. Leave its README, license, and gitignore options unchecked because this folder already supplies project files.
2. In a terminal opened in this folder, run:

```sh
git init
git branch -M main
git add .
git commit -m "Build responsive photo gallery with infinite scrolling"
git remote add origin https://github.com/YOUR-USERNAME/exactspace-photo-gallery.git
git push -u origin main
```

3. Replace `YOUR-USERNAME` with your GitHub username. Sign in to GitHub when Git requests it.
4. Open the repository link in a signed-out/private browser window to confirm it is public. Check that the source, README, and lockfile are present and node_modules is absent.
5. Email the company the **repository URL**, for example `https://github.com/YOUR-USERNAME/exactspace-photo-gallery`. Include a short note that it implements the assignment and that setup/test instructions are in the README. A hosted demo is optional; the requested submission is the public repository link.

No repository has been published and no email has been sent on your behalf.
