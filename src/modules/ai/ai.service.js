import axios from "axios";
import Equipment from "../equipment/equipment.model.js";
import { callGemini } from "../../config/google.js";
import ApiError from "../../utils/ApiError.js";
import { buildEquipmentSuggestionPrompt } from "./ai.prompts.js";
import { parseGeminiResponse } from "./ai.parser.js";

const CLOUDINARY_DOMAIN = "res.cloudinary.com";

const fetchImageAsBase64 = async (url) => {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    const mimeType = response.headers['content-type'] || 'image/jpeg';
    return { base64, mimeType };
  } catch (error) {
    throw new ApiError(500, "Failed to process image from Cloudinary for AI analysis");
  }
};


export const getEquipmentSuggestionsService = async (data) => {
  const { message, imageUrl } = data;

  // 1. SECURITY: Validate Cloudinary source if image exists
  if (imageUrl && !imageUrl.includes(CLOUDINARY_DOMAIN)) {
    throw new ApiError(400, "Invalid image source. Only Cloudinary URLs are allowed.");
  }

  // 2. RAG: Fetch real equipment from your MongoDB to give Gemini context
  const dbEquipment = await Equipment.find({ isActive: true })
    .select("name category price description")
    .limit(10)
    .lean();

  const inventoryContext = dbEquipment.length > 0 
    ? dbEquipment.map(e => `[ID: ${e._id}] ${e.name} (${e.category}): ${e.description} - ₹${e.price}/day`).join("\n")
    : "No equipment currently available in our marketplace.";

  // 3. BUILD PROMPT
  const promptText = buildEquipmentSuggestionPrompt({
    ...data,
    inventoryContext,
    hasImage: !!imageUrl
  });

  const parts = [{ text: promptText }];

  // 4. MULTIMODAL
  if (imageUrl) {
    const { base64, mimeType } = await fetchImageAsBase64(imageUrl);
    parts.push({
      inline_data: {
        mime_type: mimeType,
        data: base64,
      },
    });
  }

  // 5. CALL GEMINI
  const response = await callGemini({
    contents: [{ parts }],
  });

  const rawText = response?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new ApiError(500, "AgriAI is currently over capacity. Please try again in a moment.");
  }

  const result = parseGeminiResponse(rawText);
  return result;
};