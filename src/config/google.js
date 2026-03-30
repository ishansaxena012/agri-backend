import { GoogleGenerativeAI } from "@google/generative-ai";
import { OAuth2Client } from "google-auth-library";
import { env } from "./env.js";
import ApiError from "../utils/ApiError.js";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
}, { apiVersion: 'v1' }); 


export const googleAuthClient = env.GOOGLE_CLIENT_ID 
  ? new OAuth2Client(env.GOOGLE_CLIENT_ID) 
  : null;


export const callGemini = async (payload) => {
  try {
    const contents = payload.contents ? payload.contents[0].parts : payload;

    const result = await model.generateContent(contents);
    const response = await result.response;

    return response; 
  } catch (error) {
    console.error("❌ Gemini SDK Error:", error.message);
    
    if (error.message.includes("404")) {
        throw new ApiError(404, "AI Model not found. Check your API Key region or model name.");
    }
    
    throw new ApiError(500, `AI Service Error: ${error.message}`);
  }
};