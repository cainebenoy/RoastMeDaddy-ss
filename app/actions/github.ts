"use server"

import { GitHubProfileFetcher } from "@/lib/github-profile-fetcher"

// This server action fetches GitHub profile data.
// It runs only on the server, ensuring the GITHUB_TOKEN is never exposed to the client.
export async function fetchGitHubProfileData(username: string) {
  try {
    const profile = await GitHubProfileFetcher.fetchUserProfile(username)
    return profile
  } catch (error) {
    console.error("Error in server action fetchGitHubProfileData:", error)
    return { error: `Failed to fetch GitHub profile: ${error.message}` }
  }
}
