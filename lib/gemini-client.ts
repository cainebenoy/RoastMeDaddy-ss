import { CONFIG } from "./config"

export interface GeminiRequest {
  prompt: string
  file_urls?: string[]
  add_context_from_internet?: boolean
}

export class GeminiClient {
  private static apiKey = CONFIG.GEMINI_API_KEY
  private static maxRetries = 3 // Maximum number of retries for 429 errors
  private static initialDelayMs = 1000 // Initial delay for retry in milliseconds

  static async generateContent({ prompt, file_urls, add_context_from_internet }: GeminiRequest): Promise<string> {
    // Check if API key is configured
    if (!this.apiKey || this.apiKey.trim() === "") {
      throw new Error("Gemini API key not configured. Please update the API key in lib/config.ts")
    }

    console.log("Making Gemini API request...")

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        let requestBody: any

        if (file_urls && file_urls.length > 0) {
          // Handle image analysis with Gemini Vision
          const parts = [{ text: prompt }]

          // Add images to the request
          for (const url of file_urls) {
            try {
              // Fetch image and convert to base64
              const response = await fetch(url, {
                mode: "cors",
                headers: {
                  Accept: "image/*",
                },
              })

              if (!response.ok) {
                console.warn(`Failed to fetch image from ${url}:`, response.statusText)
                continue
              }

              const blob = await response.blob()
              const base64 = await this.blobToBase64(blob)

              parts.push({
                inline_data: {
                  mime_type: blob.type || "image/jpeg",
                  data: base64,
                },
              })
            } catch (imageError) {
              console.error("Error processing image:", imageError)
              // Continue with other images if one fails
            }
          }

          requestBody = {
            contents: [
              {
                parts: parts,
              },
            ],
            generationConfig: CONFIG.GENERATION_CONFIG,
          }
        } else {
          // Handle text-only requests
          requestBody = {
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: CONFIG.GENERATION_CONFIG,
          }
        }

        const model = file_urls && file_urls.length > 0 ? CONFIG.GEMINI_MODELS.VISION : CONFIG.GEMINI_MODELS.TEXT
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`

        console.log(`Attempt ${attempt + 1}: API URL: ${apiUrl.replace(this.apiKey, "***")}`)
        console.log(`Attempt ${attempt + 1}: Request body:`, JSON.stringify(requestBody, null, 2))

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        })

        console.log(`Attempt ${attempt + 1}: Response status: ${response.status}`)

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`Attempt ${attempt + 1}: Gemini API Error Response:`, errorText)

          let errorData
          try {
            errorData = JSON.parse(errorText)
          } catch {
            errorData = { message: errorText }
          }

          if (response.status === 429) {
            const retryAfter = response.headers.get("Retry-After")
            const delay = retryAfter ? Number.parseInt(retryAfter) * 1000 : this.initialDelayMs * Math.pow(2, attempt)
            console.warn(`Rate limit hit (429). Retrying in ${delay / 1000}s...`)
            await new Promise((resolve) => setTimeout(resolve, delay))
            continue // Retry the request
          } else if (response.status === 400) {
            throw new Error(`Bad request to Gemini API: ${errorData.error?.message || errorText}`)
          } else if (response.status === 403) {
            throw new Error(`Gemini API access forbidden - check API key: ${errorData.error?.message || errorText}`)
          } else {
            throw new Error(`Gemini API error (${response.status}): ${errorData.error?.message || errorText}`)
          }
        }

        const data = await response.json()
        console.log(`Attempt ${attempt + 1}: Gemini API Response:`, JSON.stringify(data, null, 2))

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          const generatedText = data.candidates[0].content.parts[0].text
          console.log("Generated text:", generatedText)
          return generatedText.trim()
        } else {
          console.error("Unexpected Gemini response structure:", data)

          // Check for safety filters or other blocks
          if (data.candidates && data.candidates[0] && data.candidates[0].finishReason) {
            const finishReason = data.candidates[0].finishReason
            if (finishReason === "SAFETY") {
              throw new Error("Content was blocked by Gemini's safety filters")
            } else if (finishReason === "RECITATION") {
              throw new Error("Content was blocked due to recitation concerns")
            } else {
              throw new Error(`Generation stopped: ${finishReason}`)
            }
          }

          throw new Error("Invalid response from Gemini API - no content generated")
        }
      } catch (error) {
        console.error(`Detailed Gemini API Error on attempt ${attempt + 1}:`, error)
        if (attempt === this.maxRetries) {
          throw error // Re-throw if all retries are exhausted
        }
        // For non-429 errors, re-throw immediately
        if (!(error instanceof Error && error.message.includes("Rate limit hit (429)"))) {
          throw error
        }
      }
    }
    throw new Error("Failed to generate content after multiple retries due to rate limiting.")
  }

  private static blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(",")[1]
        resolve(base64String)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  static getContextualFallback(prompt: string): string {
    if (prompt.includes("fashion") || prompt.includes("outfit")) {
      return "Your fashion sense is so questionable, even our AI had to look away. That's an achievement in itself."
    } else if (prompt.includes("typing") || prompt.includes("WPM")) {
      return "Your typing skills are so bad, even our roast generator gave up trying to find appropriate words."
    } else if (prompt.includes("GitHub") || prompt.includes("LinkedIn") || prompt.includes("Instagram")) {
      return "Your online presence is so cringe, it broke our AI. Congratulations on that unique achievement."
    } else {
      return "Something went so wrong that even our AI couldn't process it. That's... actually impressive."
    }
  }
}
