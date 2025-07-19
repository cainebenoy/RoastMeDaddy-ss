import { GeminiClient } from "@/lib/gemini-client"

export async function UploadFile({ file }) {
  // This is a placeholder implementation. Replace with actual upload logic.
  console.log("Uploading file:", file)
  await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate upload delay

  // Create a temporary URL for the file
  const file_url = URL.createObjectURL(file)
  return { file_url }
}

export async function InvokeLLM({ prompt, file_urls, add_context_from_internet }) {
  try {
    console.log("InvokeLLM called with:", {
      prompt: prompt.substring(0, 100) + "...",
      file_urls,
      add_context_from_internet,
    })

    const response = await GeminiClient.generateContent({
      prompt,
      file_urls,
      add_context_from_internet,
    })

    console.log("InvokeLLM successful response:", response.substring(0, 100) + "...")
    return response
  } catch (error) {
    console.error("InvokeLLM Error Details:", {
      message: error.message,
      stack: error.stack,
      prompt: prompt.substring(0, 200) + "...",
      file_urls,
    })

    // Return more specific error messages instead of generic fallback
    if (error.message.includes("safety filters")) {
      return "Your request was too spicy even for our roast bot. Try toning it down a notch, you absolute savage."
    } else if (
      error.message.includes("rate limit") ||
      error.message.includes("Failed to generate content after multiple retries due to rate limiting.")
    ) {
      return "Whoa there, speed demon! You've hit the API rate limit. Please wait a bit and try again, or consider upgrading your Gemini API plan for more requests."
    } else if (error.message.includes("API key")) {
      return "Our roast engine is having technical difficulties. The irony is not lost on us. Please check your Gemini API key configuration."
    } else if (error.message.includes("Bad request")) {
      return "Your request was so bad it confused our AI. That's... actually kind of impressive in a sad way."
    } else {
      // Only use contextual fallback as last resort
      return GeminiClient.getContextualFallback(prompt)
    }
  }
}
