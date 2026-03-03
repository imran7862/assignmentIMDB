import { MovieInsightsClient } from "./_components/movie-insights-client";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-4 pb-16 pt-12 sm:px-8 lg:px-10">
        <header className="space-y-4">
          <p className="inline-flex items-center rounded-full bg-slate-800/50 px-3 py-1 text-xs font-medium text-slate-300 ring-1 ring-slate-700/80 backdrop-blur">
            <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Movie Insights by IMDb ID
          </p>
          <div className="space-y-2">
            <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Enter an{" "}
              <span className="bg-linear-to-r from-emerald-400 via-sky-400 to-violet-400 bg-clip-text text-transparent">
                IMDb ID
              </span>{" "}
              to unlock audience sentiment.
            </h1>
            <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
              Paste an IMDb movie ID like{" "}
              <code className="rounded bg-slate-900/70 px-1.5 py-0.5">tt27497448</code> and
              we&apos;ll fetch details, scrape audience reviews, and summarize overall sentiment for
              you.
            </p>
          </div>
        </header>

        <section className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-4 shadow-[0_0_60px_rgba(15,23,42,0.85)] backdrop-blur-md sm:p-6 lg:p-8">
          <MovieInsightsClient />
        </section>
      </main>
    </div>
  );
}
