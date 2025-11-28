// OFFLINE MODE - SECURITY COMPLIANCE
// External AI calls are removed to prevent data exfiltration and ensure functionality in air-gapped clusters.

export const generateCronFromText = async (text: string): Promise<string> => {
  const lower = text.toLowerCase().trim();
  
  // Deterministic Heuristics
  if (lower.includes("midnight")) return "0 0 * * *";
  if (lower.includes("daily") && lower.includes("9")) return "0 9 * * *";
  if (lower.includes("daily")) return "0 0 * * *";
  if (lower.includes("hourly")) return "0 * * * *";
  if (lower.includes("every monday")) return "0 9 * * 1";
  if (lower.includes("every friday")) return "0 9 * * 5";
  if (lower.includes("week")) return "0 0 * * 0";
  if (lower.includes("month")) return "0 0 1 * *";
  
  // No AI fallback possible offline
  return "";
};