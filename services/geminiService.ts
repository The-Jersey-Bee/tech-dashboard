
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getTechSummary = async (projectsCount: number) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a brief, professional technical summary for the Jersey Bee Tech Dashboard. 
      Context: We currently have ${projectsCount} technical projects listed. 
      Theme: Local journalism tech, community resilience, and system stability.
      The summary should be 1-2 sentences.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Welcome back to the Jersey Bee tech hub. All systems monitored and ready for local impact.";
  }
};
