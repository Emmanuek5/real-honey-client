## RealHoney — Automatic Coupon Finder (WXT + React)

RealHoney is a browser extension that automatically discovers and surfaces coupon codes while you shop. It watches for checkout pages, fetches coupons for the current store from a local API, stores them in IndexedDB, and shows a sleek notification and popup UI where you can copy codes with one click.

![RealHoney](public/real-honey.png)

### Features
- **Automatic detection**: Identifies shopping and checkout pages on supported sites.
- **Coupon fetching**: Queries a local API for available coupons for the current domain.
- **Local storage**: Persists coupons in IndexedDB using `idb` for quick access.
- **Beautiful UI**: In-page notification and a polished popup UI with copy-to-clipboard.
- **Multi-browser ready**: Build and run for Chromium and Firefox via WXT.

### Tech Stack
- **WXT** for extension tooling and dev server
- **React 19 + TypeScript** for UI and logic
- **Tailwind CSS** for styling
- **idb** (IndexedDB) for storage
- **@webext-core/proxy-service** for background/content/popup communication

---

### Prerequisites
- Node.js 18+ and npm (or Bun/PNPM if you prefer)
- A Chromium-based browser (for development) and/or Firefox
- A coupons API running locally at `http://localhost:3001` that serves `GET /api/coupons/:domain`

Example response shape:
```json
{
  "success": true,
  "store": "amazon.com",
  "message": "Found coupons",
  "coupons": [
    {
      "code": "SAVE10",
      "title": "10% off",
      "description": "Save 10% on eligible items",
      "website": "https://amazon.com",
      "domain": "amazon.com",
      "lastUpdated": 1735689600000
    }
  ]
}
```

The base URL is currently defined in `lib/functions.ts` as `API_URL = 'http://localhost:3001'`.

---

### Getting Started (Development)
1. Install dependencies:
   - npm: `npm install`
   - bun: `bun install`

2. Start the extension in dev mode (Chromium):
   - `npm run dev`
   - This will build to `.output/chrome-mv3` and keep watching for changes.

3. Load the extension in your browser:
   - Open `chrome://extensions` → Enable Developer mode → Load unpacked → select `.output/chrome-mv3`.
   - The dev server will auto-reload on changes.

4. Optional (Firefox):
   - `npm run dev:firefox` and follow WXT’s prompts. Build output is under `.output/firefox-mv2`.

Tip: The dev runner is configured to open `https://amazon.com/` for quick testing.

---

### Build & Package
- Production build (Chromium): `npm run build`
- Production build (Firefox): `npm run build:firefox`
- Create zips for distribution:
  - Chromium: `npm run zip`
  - Firefox: `npm run zip:firefox`

Artifacts are generated under `.output/*`.

---

### How It Works
- `entrypoints/background.ts`
  - Opens the extension DB and registers the coupon service.
  - On tab updates, fetches coupons for the current domain via `lib/functions.ts#getCoupons`.
  - On checkout pages, sends a message to the content script to display a notification with the number of coupons found.

- `entrypoints/content.ts`
  - Listens for `SHOW_COUPON_NOTIFICATION` messages from the background.
  - Injects a styled notification with a CTA that opens the popup.

- `entrypoints/popup/*`
  - Renders the popup UI, shows the current domain, lists stored coupons, and lets users copy codes.

- `lib/database.ts`
  - Defines an IndexedDB schema with a compound key `[domain, code]` and an index by domain.

- `lib/coupon-service.ts`
  - Provides a proxied service to insert and query coupons across contexts.

- `wxt.config.ts`
  - Sets the extension name, description, icons, permissions, and action popup.

---

### Configuration
- **API URL**: Edit `lib/functions.ts` to point to your coupons API.
- **Permissions/manifest**: Update `wxt.config.ts` for permissions, host permissions, and branding.
- **Styling**: Tailwind config lives in `tailwind.config.js`; PostCSS config in `postcss.config.js`.

---

### Scripts
- `npm run dev` — Start WXT in dev mode (Chromium)
- `npm run dev:firefox` — Start WXT in dev mode (Firefox)
- `npm run build` — Production build (Chromium)
- `npm run build:firefox` — Production build (Firefox)
- `npm run zip` — Package Chromium build
- `npm run zip:firefox` — Package Firefox build
- `npm run compile` — Type-check with TypeScript

---

### Project Structure (excerpt)
```
entrypoints/
  background.ts         # Background script: tab monitoring, coupon fetching, messaging
  content.ts            # Content script: in-page notifications
  popup/                # Popup UI (React)
lib/
  coupon-service.ts     # Proxy service for coupon CRUD in IndexedDB
  coupon-tester.ts      # Utilities to test/apply codes in-page (experimental)
  database.ts           # IndexedDB schema and open helper
  functions.ts          # API calls (getCoupons, getFavicon)
public/
  real-honey.png        # Branding, used in popup/notification
wxt.config.ts           # Extension config and manifest
tailwind.config.js      # Tailwind theme and content sources
```

---

### Notes
- This project uses React 19 and WXT 0.19.x.
- Some features rely on `host_permissions: ["<all_urls>"]` and `permissions: ["tabs", "storage", "activeTab"]`.
- The content script currently matches broadly: `https://*.com/*` (see `entrypoints/content.ts`). Adjust as needed.

---

### Acknowledgements
- Built with **WXT** (`wxt.dev`) and **React**.
- Styling with **Tailwind CSS**.
