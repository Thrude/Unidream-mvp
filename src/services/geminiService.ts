import { GoogleGenAI, Type } from "@google/genai";
import { AdmissionStats, AdmissionBlueprint } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeAdmissionChances(stats: AdmissionStats): Promise<AdmissionBlueprint> {
  const prompt = `
    Analyze the following university admission profile and provide scores (1-100) for 5 axes, 
    a detailed recommendation, and university matches (Safety, Target, Reach).
    
    Profile:
    - GPA: ${stats.gpa}
    - SAT Score: ${stats.sat}
    - Number of AP/IB Classes: ${stats.apClasses}
    - Extracurriculars/Activities: ${stats.extracurriculars}
    
    Please be realistic but encouraging. The scores should reflect the strength of the profile 
    relative to top-tier global universities.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: "You are a senior university admissions consultant. You provide data-driven insights for students applying to top universities.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scores: {
            type: Type.OBJECT,
            properties: {
              academics: { type: Type.NUMBER },
              leadership: { type: Type.NUMBER },
              impact: { type: Type.NUMBER },
              innovation: { type: Type.NUMBER },
              softSkills: { type: Type.NUMBER },
            },
            required: ["academics", "leadership", "impact", "innovation", "softSkills"],
          },
          recommendation: { type: Type.STRING },
          matches: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                tier: { type: Type.STRING, enum: ["Safety", "Target", "Reach"] },
                universities: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["tier", "universities"]
            }
          }
        },
        required: ["scores", "recommendation", "matches"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  return JSON.parse(text) as AdmissionBlueprint;
}
