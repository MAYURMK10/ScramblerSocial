import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const analyzeBikeImage = async (imageFile) => {
  console.log("🔍 AI Service: Starting analysis for file:", imageFile.name);
  
  if (!API_KEY) {
    console.error("❌ AI Service: Gemini API key is missing.");
    return null;
  }

  // List of models to try in order of preference
  const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro-vision"];
  
  // Convert file to base64 once
  console.log("🔍 AI Service: Converting image to base64...");
  const base64Data = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
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

  for (const modelName of modelsToTry) {
    try {
      console.log(`🔍 AI Service: Attempting with model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });

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
      console.log(`✅ AI Service: Success with ${modelName}! Raw response:`, text);
      
      const jsonString = text.replace(/```json|```/g, "").trim();
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn(`⚠️ AI Service: Model ${modelName} failed or not found.`, error.message);
      // If it's the last model, throw the error
      if (modelName === modelsToTry[modelsToTry.length - 1]) {
        console.error("❌ AI Service: All models failed.");
        throw error;
      }
      // Otherwise, continue to the next model in the list
    }
  }
  return null;
};

