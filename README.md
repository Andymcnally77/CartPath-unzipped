# CartPath 🛒

The smarter way to grocery shop. AI-powered lists, in-store navigation, scan-and-go checkout, and QR exit verification.

---

## Deploy to Your iPhone (No Coding Required)

### Step 1 — Get the code on GitHub (free, ~5 min)

1. Go to [github.com](https://github.com) and create a free account
2. Click the **+** button → **New repository**
3. Name it `cartpath`, set it to **Public**, click **Create repository**
4. Click **uploading an existing file**
5. Drag the entire `cartpath` folder contents into the upload area
6. Click **Commit changes**

---

### Step 2 — Deploy on Vercel (free, ~2 min)

1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account
2. Click **Add New Project**
3. Find your `cartpath` repo and click **Import**
4. Leave all settings as default — Vercel auto-detects Vite
5. Click **Deploy**
6. Wait ~60 seconds. You'll get a URL like `cartpath.vercel.app` ✅

---

### Step 3 — Add to your iPhone Home Screen (30 seconds)

1. On your iPhone, open **Safari** (must be Safari, not Chrome)
2. Go to your Vercel URL (e.g. `cartpath.vercel.app`)
3. Tap the **Share** button (box with arrow at bottom of screen)
4. Scroll down and tap **"Add to Home Screen"**
5. Name it **CartPath** and tap **Add**

It now appears on your home screen like a real app. Tap it — it opens full screen with no browser bar.

---

### Step 4 — Add your Anthropic API key

The AI features require an Anthropic API key.

1. Go to [console.anthropic.com](https://console.anthropic.com) and create an account
2. Go to **API Keys** and create a new key
3. In your Vercel project, go to **Settings → Environment Variables**
4. Add: `VITE_ANTHROPIC_API_KEY` = your key

> **Note:** For a production app you'd proxy API calls through a backend to keep your key secure. For personal use, this setup works fine.

Then update the fetch calls in `src/utils.js` to include the key:
```js
headers: {
  "Content-Type": "application/json",
  "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-access": "true",
}
```

---

## Project Structure

```
cartpath/
├── index.html              # App entry point + PWA meta tags
├── vite.config.js          # Vite + PWA plugin config
├── package.json            # Dependencies
└── src/
    ├── main.jsx            # React root
    ├── App.jsx             # Onboarding gate + root state
    ├── utils.js            # Store data, storage helpers, AI calls
    └── screens/
        ├── Onboarding.jsx  # Splash → Slides → Store → Account → Welcome
        └── MainApp.jsx     # List → Navigate → Checkout → Exit Pass
```

---

## Features

- ✦ **AI List Builder** — describe a meal, get a sorted grocery list
- ⊡ **Barcode Scanner** — scan products to add them directly
- ◎ **In-Store Navigation** — optimized aisle-by-aisle routing
- ✓ **Scan-and-Go Checkout** — Apple Pay / Google Pay
- 🔒 **QR Exit Pass** — single-use verification code at the door
- 💾 **Saved Lists** — name and reload past lists
- 🕘 **Shopping History** — every trip auto-saved

---

## Adding Your Real Store Data

When you walk your local grocery store, update `STORE_AISLES` in `src/utils.js`:

```js
export const STORE_AISLES = {
  A1: "Produce",
  A2: "Bakery",
  // ... add your store's actual aisles
};
```

Then update `STORE_LAYOUT` with the grid positions to match the physical store layout.

---

Built with React + Vite. Powered by Claude AI.
