const API_BASE_URL = "https://app.base44.com/api/apps/687bdc4cad0d16673c02fc80/entities/RoastSession"
const API_KEY = "7a77b5d0b41849b1a5eadacf05d266f4"

export interface RoastSession {
  id?: string
  section_type:
    | "fashion_single"
    | "fashion_comparison"
    | "profile_roast"
    | "typing_test"
    | "chat_insult"
    | "battle_game"
    | "personality_quiz"
  input_data?: any
  roast_result: string
  performance_metrics?: any
  created_at?: string
}

export class RoastSessionAPI {
  private static headers = {
    api_key: API_KEY,
    "Content-Type": "application/json",
  }

  static async createRoastSession(session: Omit<RoastSession, "id" | "created_at">): Promise<RoastSession> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({
          ...session,
          created_at: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to create roast session: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error creating roast session:", error)
      throw error
    }
  }

  static async getRoastSessions(filters?: { section_type?: string }): Promise<RoastSession[]> {
    try {
      let url = API_BASE_URL
      if (filters?.section_type) {
        url += `?section_type=${filters.section_type}`
      }

      const response = await fetch(url, {
        headers: this.headers,
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch roast sessions: ${response.statusText}`)
      }

      const data = await response.json()
      return data.entities || data || []
    } catch (error) {
      console.error("Error fetching roast sessions:", error)
      return []
    }
  }

  static async updateRoastSession(entityId: string, updateData: Partial<RoastSession>): Promise<RoastSession> {
    try {
      const response = await fetch(`${API_BASE_URL}/${entityId}`, {
        method: "PUT",
        headers: this.headers,
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error(`Failed to update roast session: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error updating roast session:", error)
      throw error
    }
  }

  static async getRecentRoasts(limit = 10): Promise<RoastSession[]> {
    try {
      const sessions = await this.getRoastSessions()
      return sessions
        .sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime())
        .slice(0, limit)
    } catch (error) {
      console.error("Error fetching recent roasts:", error)
      return []
    }
  }
}
