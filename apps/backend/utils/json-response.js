export function extractTextFromCompletion(completion) {
  return completion?.choices?.[0]?.message?.content?.trim() || "";
}

export function parseJsonResponse(text) {
  if (!text) {
    throw new Error("Empty model response");
  }

  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const sliced = text.slice(start, end + 1);
      return JSON.parse(sliced);
    }
    throw new Error("Model did not return valid JSON");
  }
}
