
import { GoogleGenAI } from "@google/genai";

console.log(
    "GEMINI KEY:",
    process.env.GEMINI_API_KEY ? "LOADED" : "NOT LOADED"
);

export const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});