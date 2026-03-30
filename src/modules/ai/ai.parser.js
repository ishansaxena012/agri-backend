import ApiError from "../../utils/ApiError.js";

export const parseGeminiResponse = (rawText) => {
  if (!rawText || typeof rawText !== "string") {
    throw new ApiError(500, "Empty or invalid AI response");
  }

  // 1. Locate the JSON boundaries
  const jsonStart = rawText.indexOf("{");
  const jsonEnd = rawText.lastIndexOf("}");

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new ApiError(500, "AI failed to return a valid data block");
  }

  const jsonString = rawText.substring(jsonStart, jsonEnd + 1).trim();

  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (error) {
    console.error("❌ JSON Parse Error:", jsonString.slice(0, 200));
    throw new ApiError(500, "AI returned malformed JSON structure");
  }

  // 2. DOMAIN GUARDRAIL CHECK
  if (parsed.error) {
    throw new ApiError(400, parsed.error);
  }

  // 3. FLEXIBLE VALIDATION
  if (!parsed.answer && (!parsed.recommended_equipment || !Array.isArray(parsed.recommended_equipment))) {
    throw new ApiError(500, "AI response missing both 'answer' and 'recommendations'");
  }

  // 4. Return the full object
  return parsed;
};