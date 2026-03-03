export type OverallSentiment = "positive" | "mixed" | "negative" | "unknown";

export interface SentimentSummary {
  summary: string;
  overall: OverallSentiment;
}

const positiveWords = [
  "amazing",
  "great",
  "excellent",
  "fantastic",
  "superb",
  "wonderful",
  "love",
  "loved",
  "brilliant",
  "masterpiece",
];

const negativeWords = [
  "terrible",
  "awful",
  "boring",
  "bad",
  "worst",
  "disappointing",
  "waste",
  "hate",
  "hated",
  "poor",
];

function heuristicSentiment(reviews: string[]): SentimentSummary {
  const text = reviews.join(" ").toLowerCase();
  let pos = 0;
  let neg = 0;

  for (const w of positiveWords) {
    const matches = text.match(new RegExp(`\\b${w}\\b`, "g"));
    if (matches) pos += matches.length;
  }

  for (const w of negativeWords) {
    const matches = text.match(new RegExp(`\\b${w}\\b`, "g"));
    if (matches) neg += matches.length;
  }

  let overall: OverallSentiment = "unknown";

  if (pos === 0 && neg === 0) {
    overall = "unknown";
  } else if (pos > neg * 1.3) {
    overall = "positive";
  } else if (neg > pos * 1.3) {
    overall = "negative";
  } else {
    overall = "mixed";
  }

  const summary =
    overall === "positive"
      ? "Most audience reviews are broadly positive, praising different aspects of the movie."
      : overall === "negative"
      ? "Audience sentiment skews negative, with frequent complaints across reviews."
      : overall === "mixed"
      ? "Audience sentiment is mixed, with a blend of praise and criticism."
      : "Audience sentiment is inconclusive based on the available reviews.";

  return { summary, overall };
}

export async function aiSummarizeSentiment(reviews: string[]): Promise<SentimentSummary> {
  if (!reviews.length) {
    return {
      summary:
        "Audience reviews could not be retrieved; sentiment is inconclusive based on the available data.",
      overall: "unknown",
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return heuristicSentiment(reviews);
  }

  try {
    const { OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey });

    const prompt = [
      "You are an analyst summarizing audience sentiment for a movie based on user reviews.",
      "Given the raw review texts, do two things:",
      "1) Provide a concise 2–3 sentence summary of what audiences liked and disliked.",
      "2) Classify the overall sentiment as exactly one of: positive, mixed, negative.",
      "",
      "Respond in JSON with the shape:",
      '{ "summary": string, "overall": "positive" | "mixed" | "negative" }',
      "",
      "Reviews:",
      reviews.slice(0, 30).join("\n---\n"),
    ].join("\n");

    const completion = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      response_format: { type: "json_object" },
    });

    const content = completion.output[0].content[0];
    if (content?.type === "output_text") {
      const parsed = JSON.parse(content.text) as SentimentSummary;
      if (!parsed.summary || !parsed.overall) {
        return heuristicSentiment(reviews);
      }
      return parsed;
    }

    return heuristicSentiment(reviews);
  } catch {
    return heuristicSentiment(reviews);
  }
}

