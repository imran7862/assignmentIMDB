import { describe, it, expect } from "vitest";
import { aiSummarizeSentiment } from "./sentiment";

describe("aiSummarizeSentiment (heuristic fallback)", () => {
  it("returns unknown when no reviews", async () => {
    const res = await aiSummarizeSentiment([]);
    expect(res.overall).toBe("unknown");
  });

  it("detects broadly positive sentiment", async () => {
    const res = await aiSummarizeSentiment([
      "This movie was amazing and a brilliant masterpiece. I loved every second.",
    ]);
    expect(res.overall === "positive" || res.overall === "mixed").toBe(true);
  });

  it("detects broadly negative sentiment", async () => {
    const res = await aiSummarizeSentiment([
      "This was the worst, a terrible and boring waste of time.",
    ]);
    expect(res.overall === "negative" || res.overall === "mixed").toBe(true);
  });
});

