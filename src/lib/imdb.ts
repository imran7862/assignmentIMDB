import { load } from "cheerio";

export interface ImdbReview {
  title: string;
  author: string;
  rating: number | null;
  date: string | null;
  text: string;
}

export async function fetchImdbReviews(imdbId: string, limit = 20): Promise<ImdbReview[]> {
  const url = `https://www.imdb.com/title/${encodeURIComponent(imdbId)}/reviews`;

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch IMDb reviews (status ${res.status})`);
  }

  const html = await res.text();
  const $ = load(html);

  const reviews: ImdbReview[] = [];

  // IMDb occasionally tweaks markup; support multiple variants for robustness.
  $(".lister-list .review-container, .lister-list .imdb-user-review, .review-container").each(
    (_, el) => {
      if (reviews.length >= limit) return false;

      const title = $(el).find(".title").text().trim();
      const author = $(el).find(".display-name-link a").text().trim();
      const date = $(el).find(".review-date").text().trim() || null;
      const ratingText = $(el).find(".rating-other-user-rating span").first().text().trim();
      const rating = ratingText ? Number(ratingText) : null;
      const text =
        $(el).find(".text.show-more__control").text().trim() ||
        $(el).find(".content .text").text().trim();

      if (!text) return;

      reviews.push({
        title,
        author,
        rating: Number.isNaN(rating) ? null : rating,
        date,
        text,
      });
    },
  );

  return reviews;
}

