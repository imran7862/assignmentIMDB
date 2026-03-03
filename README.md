## Movie Sentiment Insights – IMDb ID Tool

This app lets you enter an IMDb movie ID (e.g. `tt27497448`) and get:

- **Movie title, poster & metadata**
- **Cast list**
- **Release year & IMDb rating**
- **Short plot summary**
- **AI-powered summary of audience sentiment**
- **Overall sentiment classification** (positive / mixed / negative)

It is built with **Next.js (App Router)** and deployed-ready for **Vercel**.

---

## Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```bash
OMDB_API_KEY=YOUR_OMDB_API_KEY_HERE
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
```

- **`OMDB_API_KEY`** (required): Used to fetch movie details, poster, cast, and metadata via the [OMDb API](https://www.omdbapi.com/).
- **`OPENAI_API_KEY`** (optional but recommended): Used to generate a richer natural-language sentiment summary via OpenAI.  
  - If this key is **not** provided, the app falls back to a **heuristic rule-based sentiment analyzer** over the scraped review text.

### 3. Run the development server

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

### 4. Run tests

Basic unit tests are provided for the sentiment logic:

```bash
npm test
```

---

## How It Works

- **Input**: User enters an IMDb ID like `tt27497448`.
- **Backend (API route)**: `/api/movie-insights`
  - Validates the ID with `zod`.
  - **Movie metadata**: Fetched from OMDb (title, year, rating, poster, plot, cast, etc.).
  - **Audience reviews**: IMDb user reviews are scraped from the official reviews page, parsed with `cheerio`, and the top N reviews are extracted.
  - **Sentiment analysis**:
    - If `OPENAI_API_KEY` is available, the reviews are summarized and classified using OpenAI (JSON-only response with `summary` and `overall` sentiment).
    - Otherwise, a **lightweight heuristic** counts positive/negative words and classifies sentiment as positive / mixed / negative / unknown.
- **Frontend (UI)**:
  - Beautiful, responsive layout using **Tailwind CSS**.
  - Form with validation for IMDb ID (must match `tt\\d+`).
  - Displays movie card (poster, rating, runtime, director, genres).
  - Shows a **pill-style cast list**.
  - Shows **AI/heuristic sentiment summary** and overall classification with color-coded chips.
  - Lists a scrollable set of **sample audience reviews** (title, author, date, rating, truncated text).

---

## Tech Stack Rationale

- **Next.js (App Router, TypeScript)**:
  - Single, cohesive framework for **frontend + backend**.
  - Server-side API route keeps **API keys secure** and avoids CORS issues when scraping IMDb.
  - Great fit for **Vercel deployment** with minimal configuration.
- **Tailwind CSS**:
  - Fast iteration on a **modern, premium UI** with good defaults for responsiveness.
  - Utility-first approach keeps styles close to components and easy to maintain.
- **TypeScript**:
  - Strong typing for API responses, movie/review models, and sentiment data.
  - Helps catch issues early and improve refactors.
- **cheerio**:
  - Lightweight HTML parsing to extract review text from IMDb review pages.
- **zod**:
  - Simple, declarative validation for API inputs (IMDb ID).
- **Vitest**:
  - Quick, minimal setup unit testing compatible with the modern JS ecosystem.

This stack fits the **JavaScript/TypeScript constraint** and is aligned with **scalable web app** practices used in production.

---

## Assumptions

- **IMDb reviews scraping**:
  - For the purposes of this assignment, scraping the IMDb reviews page is acceptable.
  - In a real production environment, we would:
    - Reassess this against IMDb&apos;s terms of service.
    - Potentially rely on an approved data provider instead of direct scraping.
- **Coverage of sentiment analysis**:
  - OpenAI provides **high-quality summaries** when the key is configured.
  - The heuristic fallback focuses on clarity and simplicity, not on full NLP correctness, but it is:
    - Deterministic
    - Easy to test
    - Good enough to classify movies as positive / mixed / negative / unknown.
- **Scale**:
  - The tool is intended for **single-movie, on-demand queries**, not high-volume batch processing.
  - Concurrency and rate limiting could be added if this became a public-facing product.

---

## Deployment (Vercel)

This app is ready to deploy on **Vercel**:

1. **Push the project to GitHub** (or another Git provider).
2. Go to Vercel and choose **“New Project” → Import from GitHub”**.
3. Select this repository.
4. In the Vercel project settings, add environment variables:
   - `OMDB_API_KEY`
   - `OPENAI_API_KEY` (optional, but recommended)
5. Click **Deploy**.

Vercel will:

- Detect Next.js automatically.
- Build with `npm run build`.
- Host the app with serverless API routes for `/api/movie-insights`.

After deployment, you&apos;ll get a public URL that can be shared with reviewers to test the app live.

---

## Notes on Best Practices

- **Code quality**:
  - Modular separation: `lib/omdb`, `lib/imdb`, `lib/sentiment`, `app/api`, and React client components.
  - Typed data models for movie and sentiment.
  - Error handling for network/API issues with user-friendly messages.
- **Testing**:
  - Unit tests included for sentiment logic (especially the heuristic fallback).
  - Additional tests (e.g. for API route and UI) can be added with the same test stack.
- **UX & Design**:
  - Responsive layout that adapts from mobile to desktop.
  - Gradients, blur, and subtle shadows to create a **premium feel**.
  - Clear hierarchy: input → movie card → sentiment summary → reviews.
  - Handles loading and error states gracefully.

