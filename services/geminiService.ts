
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeResult = async (
  patientName: string,
  examName: string,
  value: number,
  range: string,
  unit: string,
  observations?: string
) => {
  try {
    const prompt = `Actúa como un médico experto en patología clínica. 
    Analiza el siguiente resultado de laboratorio:
    Paciente: ${patientName}
    Examen: ${examName}
    Valor: ${value} ${unit}
    Rango de Referencia: ${range} ${unit}
    Observaciones: ${observations || 'Ninguna'}

    Proporciona una interpretación profesional, indicando si está fuera de rango, 
    posibles implicaciones clínicas (sin dar un diagnóstico definitivo) y 
    recomendaciones para el paciente de manera empática pero técnica.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "No se pudo generar la interpretación de IA en este momento.";
  }
};
