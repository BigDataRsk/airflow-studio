import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateCronFromText = async (text: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const prompt = `
      You are a helper for an Airflow engineer. 
      Convert the following natural language schedule description into a valid CRON expression.
      
      User request: "${text}"
      
      Rules:
      1. Only return the CRON expression string.
      2. Do not add markdown or explanations.
      3. If the request is vague, assume standard Airflow format (Minute Hour Day Month DayOfWeek).
      
      Example: "Every Monday at 9am" -> "0 9 * * 1"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "";
  }
};