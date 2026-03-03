import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchMovieDetails } from "@/lib/omdb";
import { fetchImdbReviews } from "@/lib/imdb";
import { aiSummarizeSentiment } from "@/lib/sentiment";

const querySchema = z.object({
  imdbId: z
    .string()
    .trim()
    .regex(/^tt\d+$/, "IMDb ID must look like tt1234567"),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imdbId = searchParams.get("imdbId") || "";

  const parseResult = querySchema.safeParse({ imdbId });
  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.issues[0]?.message ?? "Invalid IMDb ID." },
      { status: 400 },
    );
  }

  try {
    const [movie, reviews] = await Promise.all([
      fetchMovieDetails(imdbId),
      fetchImdbReviews(imdbId, 25),
    ]);

    let reviewTexts = reviews.map((r) => r.text);

    // If we failed to scrape any reviews (e.g. IMDb markup / anti-bot changes),
    // fall back to using movie metadata so we can still provide a useful summary.
    if (reviewTexts.length === 0) {
      const metaPieces: string[] = [];
      if (movie.imdbRating != null) {
        metaPieces.push(`IMDb rating: ${movie.imdbRating.toFixed(1)} / 10.`);
      }
      if (movie.genre) {
        metaPieces.push(`Genres: ${movie.genre}.`);
      }
      if (movie.plot) {
        metaPieces.push(`Plot: ${movie.plot}`);
      }

      if (metaPieces.length > 0) {
        reviewTexts = [metaPieces.join(" ")];
      }
    }

    const sentiment = await aiSummarizeSentiment(reviewTexts);

    return NextResponse.json({
      movie,
      reviews,
      sentiment,
    });
  } catch (error: unknown) {
    console.error(error);
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Unexpected error while fetching movie insights.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

