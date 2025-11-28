// OFFLINE MODE COMPLIANCE
// This file has been neutralized to prevent external calls to Google Gemini API
// in an air-gapped cluster environment.

export const generateCronFromText = async (text: string): Promise<string> => {
  console.warn("AI Generation is disabled in Offline Mode.");
  
  // Simple heuristic fallback for basic requests
  const lower = text.toLowerCase();
  
  if (lower.includes("daily") && lower.includes("9")) return "0 9 * * *";
  if (lower.includes("hourly")) return "0 * * * *";
  if (lower.includes("midnight")) return "0 0 * * *";
  if (lower.includes("monday")) return "0 9 * * 1";
  
  // Return empty string to force manual entry if heuristic fails
  return "";
};