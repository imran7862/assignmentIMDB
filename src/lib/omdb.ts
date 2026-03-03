export interface OmdbMovieResponse {
  Title: string;
  Year: string;
  Rated?: string;
  Poster: string;
  Plot: string;
  imdbRating?: string;
  Genre?: string;
  Director?: string;
  Actors?: string;
  Runtime?: string;
  Response: "True" | "False";
  Error?: string;
}

export interface MovieDetails {
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

const OMDB_BASE_URL = "https://www.omdbapi.com/";

export async function fetchMovieDetails(imdbId: string): Promise<MovieDetails> {
  const apiKey = process.env.OMDB_API_KEY;
  if (!apiKey) {
    throw new Error("OMDB_API_KEY is not configured.");
  }

  const url = `${OMDB_BASE_URL}?i=${encodeURIComponent(imdbId)}&apikey=${encodeURIComponent(apiKey)}&plot=full`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to fetch movie details (status ${res.status})`);
  }

  const data = (await res.json()) as OmdbMovieResponse;

  if (data.Response === "False") {
    throw new Error(data.Error || "Movie not found.");
  }

  const imdbRating = data.imdbRating && data.imdbRating !== "N/A" ? Number(data.imdbRating) : null;

  return {
    id: imdbId,
    title: data.Title,
    year: data.Year,
    rated: data.Rated && data.Rated !== "N/A" ? data.Rated : undefined,
    poster: data.Poster && data.Poster !== "N/A" ? data.Poster : null,
    plot: data.Plot,
    imdbRating: Number.isNaN(imdbRating) ? null : imdbRating,
    genre: data.Genre && data.Genre !== "N/A" ? data.Genre : undefined,
    director: data.Director && data.Director !== "N/A" ? data.Director : undefined,
    cast: data.Actors ? data.Actors.split(",").map((a) => a.trim()) : [],
    runtime: data.Runtime && data.Runtime !== "N/A" ? data.Runtime : undefined,
  };
}

