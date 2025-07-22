// Configuration file for API keys and settings
export const CONFIG = {
  // Use the provided API key directly
  // You can change your Gemini API key here:
  GEMINI_API_KEY: "AIzaSyBbBcgJVCjDMGdWH455P0EY3ZeQFa7pBbA", // <--- Update this value

  // GitHub API token for enhanced profile fetching (optional)
  // IMPORTANT: Removed NEXT_PUBLIC_ prefix to prevent client-side exposure
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || "",

  // Gemini API settings
  GEMINI_MODELS: {
    TEXT: "gemini-1.5-flash",
    VISION: "gemini-1.5-flash",
  },

  // Generation settings - Made more permissive for roasting
  GENERATION_CONFIG: {
    temperature: 0.9,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
    stopSequences: [],
  },
}
