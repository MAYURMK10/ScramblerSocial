import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const analyzeBikeImage = async (imageFile) => {
  if (!API_KEY) {
    console.warn("Gemini API key not found. Skipping AI analysis.");
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert file to base64
    const base64Data = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(imageFile);
    });

    const prompt = `
      Analyze this motorcycle image. 
      1. Identify the base make and model (e.g., Honda CB750).
      2. List all visible custom modifications (e.g., custom exhaust, brat seat, knobby tires, clip-on handlebars).
      
      Return the result ONLY as a JSON object with this structure:
      {
        "baseBike": "string",
        "modifications": ["string", "string"],
        "suggestedTitle": "string",
        "suggestedDescription": "string"
      }
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: imageFile.type
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Clean the response text (remove markdown code blocks if present)
    const jsonString = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return null;
  }
};
