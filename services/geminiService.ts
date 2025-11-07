import { GoogleGenAI } from "@google/genai";
import { Technician } from '../types';

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64,
      mimeType
    },
  };
};

export const diagnoseAppliance = async (
  applianceName: string,
  description: string,
  image?: { base64: string; mimeType: string }
): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
  
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are an expert home appliance technician. Your goal is to diagnose a problem with a customer's appliance based on their description and an optional photo.
    
    Instructions:
    1.  Start with a "Likely Problem" section summarizing the most probable issue.
    2.  Create a "Possible Causes" section listing potential reasons for the problem in a numbered list.
    3.  Provide a "Simple Troubleshooting Steps" section with clear, safe, step-by-step instructions the user can try at home. Use a numbered list.
    4.  End with a "Safety Disclaimer" section. This must warn the user to unplug the appliance before attempting any repairs and to call a professional technician for any complex issues or if they are unsure about any step.
    
    Format your entire response using Markdown for clarity.`;

    const textPart = `My ${applianceName} is having an issue. Here is the description: ${description}`;

    let parts: any[] = [{ text: textPart }];

    if (image) {
        const imagePart = fileToGenerativePart(image.base64, image.mimeType);
        parts.unshift(imagePart);
    }

    try {
        const result = await ai.models.generateContent({
            model,
            contents: { parts },
            config: {
                systemInstruction,
            },
        });
        return result.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get diagnosis. Please try again.");
    }
};


export const findNearbyTechnicians = async (
  applianceName: string,
  location: { latitude: number; longitude: number }
): Promise<Technician[]> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-2.5-flash';

    const prompt = `Find appliance repair shops near the provided location that can service a ${applianceName}.
    
    Return your response as a valid JSON array of objects. Each object should represent a single business and have the following properties: "name", "address", and "phone".
    
    Example format:
    [
      {
        "name": "Example Appliance Repair",
        "address": "123 Main St, Anytown, USA",
        "phone": "555-123-4567"
      }
    ]
    
    Only return the raw JSON array, with no other text, explanations, or markdown formatting.`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                    retrievalConfig: {
                        latLng: location
                    }
                }
            },
        });
        
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const placeDetails = groundingChunks
            .filter(chunk => chunk.maps)
            .map(chunk => ({
                title: chunk.maps.title,
                uri: chunk.maps.uri,
            }));

        const jsonText = response.text.trim().replace(/^```json|```$/g, '');
        let technicians: Technician[] = JSON.parse(jsonText);

        technicians = technicians.map(tech => {
            const matchingPlace = placeDetails.find(place => tech.name.includes(place.title) || place.title.includes(tech.name));
            return {
                ...tech,
                mapsUrl: matchingPlace?.uri,
            };
        });

        return technicians;

    } catch (error) {
        console.error("Error finding technicians with Gemini:", error);
        throw new Error("Failed to find nearby technicians. The service might be unavailable in your area.");
    }
};