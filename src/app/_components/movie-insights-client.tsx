"use client";

import { useState } from "react";

type OverallSentiment = "positive" | "mixed" | "negative" | "unknown";

interface MovieDetails {
  id: string;
  title: string;
  year: string;
  rated?: string;
  poster: string | null;
  plot: string;
  imdbRating?: number | null;
  genre?: string;
  director?: string;
  cast: string[];
  runtime?: string;
}

interface ImdbReview {
  title: string;
  author: string;
  rating: number | null;
  date: string | null;
  text: string;
}

interface SentimentSummary {
  summary: string;
  overall: OverallSentiment;
}

interface MovieInsightsResponse {
  movie: MovieDetails;
  reviews: ImdbReview[];
  sentiment: SentimentSummary;
}

const sentimentColors: Record<OverallSentiment, string> = {
  positive: "from-emerald-400 to-emerald-500",
  mixed: "from-amber-300 to-amber-400",
  negative: "from-rose-400 to-rose-500",
  unknown: "from-slate-400 to-slate-500",
};

const sentimentLabel: Record<OverallSentiment, string> = {
  positive: "Overall Positive",
  mixed: "Overall Mixed",
  negative: "Overall Negative",
  unknown: "Sentiment Inconclusive",
};

export function MovieInsightsClient() {
  const [imdbId, setImdbId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MovieInsightsResponse | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = imdbId.trim();
    if (!/^tt\d+$/.test(trimmed)) {
      setError("Please enter a valid IMDb ID like tt27497448.");
      setData(null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/movie-insights?imdbId=${encodeURIComponent(trimmed)}`);
      const body = await res.json();

      if (!res.ok) {
        setError(body.error ?? "Failed to fetch movie insights.");
        setData(null);
        return;
      }

      setData(body as MovieInsightsResponse);
    } catch (err) {
      console.error(err);
      setError("Unexpected error while contacting the server. Please try again.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="group flex flex-col gap-3 rounded-2xl border border-slate-700/70 bg-slate-900/60 p-4 shadow-inner shadow-slate-950/60 ring-1 ring-slate-900/80 sm:flex-row sm:items-end sm:gap-4 sm:p-5"
      >
        <div className="flex-1 space-y-2">
          <label
            htmlFor="imdbId"
            className="block text-xs font-medium uppercase tracking-[0.16em] text-slate-400"
          >
            IMDb Movie ID
          </label>
          <input
            id="imdbId"
            name="imdbId"
            value={imdbId}
            onChange={(e) => setImdbId(e.target.value)}
            placeholder="e.g. tt27497448"
            className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2.5 text-sm text-slate-50 shadow-[0_0_0_1px_rgba(15,23,42,0.6)] outline-none transition-all placeholder:text-slate-500 focus:border-emerald-400/70 focus:shadow-[0_0_0_1px_rgba(52,211,153,0.6)] focus:ring-2 focus:ring-emerald-500/30"
          />
          <p className="text-xs text-slate-400">
            Only the ID is needed, not the full URL. We&apos;ll fetch metadata, reviews, and sentiment.
          </p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_18px_45px_rgba(15,23,42,0.9)] transition-transform duration-150 ease-out hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(15,23,42,1)] disabled:cursor-not-allowed disabled:opacity-60 sm:px-6"
        >
          {loading ? "Analyzing…" : "Analyze Movie"}
        </button>
      </form>

      {error && (
        <div className="overflow-hidden rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-500/10 via-rose-500/10 to-transparent px-4 py-3 text-sm text-rose-100 shadow-[0_0_40px_rgba(248,113,113,0.25)]">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-6 animate-[fadeIn_0.45s_ease-out]">
          <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/70">
                <div className="flex flex-col gap-4 sm:flex-row">
                  {data.movie.poster ? (
                    <div className="relative h-40 w-28 overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900/80 shadow-md shadow-slate-950/80">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={data.movie.poster}
                        alt={data.movie.title}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex h-40 w-28 items-center justify-center rounded-xl border border-dashed border-slate-700/80 bg-slate-900/80 text-xs text-slate-500">
                      No poster
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
                        {data.movie.title}{" "}
                        <span className="text-slate-400">({data.movie.year})</span>
                      </h2>
                      {data.movie.genre && (
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                          {data.movie.genre}
                        </p>
                      )}
                    </div>
                    <dl className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                      {data.movie.imdbRating != null && (
                        <div>
                          <dt className="text-slate-400">IMDb Rating</dt>
                          <dd className="font-semibold">
                            {data.movie.imdbRating.toFixed(1)}
                            <span className="text-slate-400"> / 10</span>
                          </dd>
                        </div>
                      )}
                      {data.movie.rated && (
                        <div>
                          <dt className="text-slate-400">Rated</dt>
                          <dd className="font-medium">{data.movie.rated}</dd>
                        </div>
                      )}
                      {data.movie.runtime && (
                        <div>
                          <dt className="text-slate-400">Runtime</dt>
                          <dd className="font-medium">{data.movie.runtime}</dd>
                        </div>
                      )}
                      {data.movie.director && (
                        <div>
                          <dt className="text-slate-400">Director</dt>
                          <dd className="font-medium">{data.movie.director}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>
                <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-slate-200">
                  {data.movie.plot}
                </p>
              </div>

              {data.movie.cast.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/60 p-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Main Cast
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.movie.cast.slice(0, 12).map((actor) => (
                      <span
                        key={actor}
                        className="rounded-full bg-slate-800/80 px-3 py-1 text-xs text-slate-100 ring-1 ring-slate-700/80"
                      >
                        {actor}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/80 p-4 shadow-lg shadow-slate-950/80">
                <div
                  className={`pointer-events-none absolute inset-x-[-40%] top-[-40%] h-32 bg-gradient-to-r ${sentimentColors[data.sentiment.overall]} opacity-20 blur-3xl`}
                />
                <div className="relative space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Audience Sentiment
                  </p>
                  <p className="inline-flex items-center gap-2 rounded-full bg-slate-900/90 px-3 py-1 text-xs font-semibold text-slate-100 ring-1 ring-slate-600/60">
                    <span
                      className={`inline-block h-2.5 w-2.5 rounded-full bg-gradient-to-r ${sentimentColors[data.sentiment.overall]}`}
                    />
                    {sentimentLabel[data.sentiment.overall]}
                  </p>
                  <p className="text-sm leading-relaxed text-slate-100">
                    {data.sentiment.summary}
                  </p>
                  {data.reviews.length > 0 ? (
                    <p className="text-xs text-slate-400">
                      Based on{" "}
                      <span className="font-semibold text-slate-100">
                        {data.reviews.length}
                      </span>{" "}
                      scraped audience reviews from IMDb.
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400">
                      Estimated from movie metadata (IMDb rating, genres, and plot) because IMDb
                      reviews could not be retrieved at this time.
                    </p>
                  )}
                </div>
              </div>

              {data.reviews.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/70">
                  <div className="border-b border-slate-700/80 px-4 py-3">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Sample Audience Reviews
                    </h3>
                  </div>
                  <div className="max-h-72 space-y-3 overflow-y-auto px-4 py-3 pr-3 text-sm [scrollbar-color:rgba(148,163,184,0.9)_transparent] [scrollbar-width:thin]">
                    {data.reviews.slice(0, 6).map((review, idx) => (
                      <article
                        key={`${review.author}-${idx}`}
                        className="rounded-xl border border-slate-700/70 bg-slate-900/80 p-3"
                      >
                        <header className="mb-1 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="truncate text-xs font-semibold text-slate-100">
                              {review.title || "Untitled review"}
                            </h4>
                            <p className="truncate text-[11px] text-slate-400">
                              {review.author || "Anonymous"}
                              {review.date ? ` • ${review.date}` : ""}
                            </p>
                          </div>
                          {review.rating != null && (
                            <span className="shrink-0 rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-amber-300 ring-1 ring-amber-400/40">
                              {review.rating}
                              <span className="text-slate-400"> / 10</span>
                            </span>
                          )}
                        </header>
                        <p className="line-clamp-4 text-xs leading-relaxed text-slate-200">
                          {review.text}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

