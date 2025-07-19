import { CONFIG } from "./config"

interface GitHubUser {
  username: string
  name: string
  bio: string
  location: string
  avatar_url: string
  profile_url: string
  followers: number
  following: number
  public_repos: number
  pull_requests_merged: number | string
  issues_closed: number | string
  achievements: {
    total_contributions: number
    repositories_contributed_to: number
  }
  social_accounts: Array<{
    provider: string
    url: string
  }>
  readme_content: string
  repositories?: Array<{
    name: string
    description: string
    stargazerCount: number
    primaryLanguage?: {
      name: string
    }
    url: string
    updatedAt: string
  }>
}

export class GitHubProfileFetcher {
  private static validateUsernamePattern(username: string): boolean {
    if (!username || typeof username !== "string") return false

    const pattern = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/
    return pattern.test(username)
  }

  private static getGitHubHeaders(): Record<string, string> {
    const token = CONFIG.GITHUB_TOKEN
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "RoastMeDaddy/1.0",
    }

    if (token && token.trim()) {
      headers.Authorization = `token ${token}`
    }

    return headers
  }

  private static hasValidToken(): boolean {
    return !!(CONFIG.GITHUB_TOKEN && CONFIG.GITHUB_TOKEN.trim())
  }

  static async validateGitHubUsername(username: string): Promise<boolean> {
    if (!this.validateUsernamePattern(username)) return false

    try {
      const response = await fetch(`https://api.github.com/users/${username}`, {
        headers: this.getGitHubHeaders(),
      })

      if (!response.ok) return false

      const data = await response.json()
      return data.type === "User"
    } catch (error) {
      console.warn("GitHub API validation failed, falling back to pattern validation:", error)
      return true // Fallback to pattern validation
    }
  }

  static extractUsernameFromUrl(url: string): string | null {
    try {
      // Handle various GitHub URL formats
      const patterns = [
        /github\.com\/([a-zA-Z0-9_-]+)\/?$/,
        /github\.com\/([a-zA-Z0-9_-]+)\/[^/]*$/,
        /^([a-zA-Z0-9_-]+)$/, // Just username
      ]

      for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match && this.validateUsernamePattern(match[1])) {
          return match[1]
        }
      }
      return null
    } catch {
      return null
    }
  }

  // Fallback method using only REST API (works without token for public data)
  static async fetchBasicProfile(username: string): Promise<GitHubUser | { error: string }> {
    try {
      // Basic user info (works without token)
      const userResponse = await fetch(`https://api.github.com/users/${username}`, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "RoastMeDaddy/1.0",
        },
      })

      if (!userResponse.ok) {
        throw new Error(`User not found: ${userResponse.status}`)
      }

      const userData = await userResponse.json()

      // Try to get repositories (works without token for public repos)
      let repositories = []
      try {
        const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, {
          headers: {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "RoastMeDaddy/1.0",
          },
        })

        if (reposResponse.ok) {
          repositories = await reposResponse.json()
        }
      } catch (error) {
        console.warn("Failed to fetch repositories:", error)
      }

      return {
        username,
        name: userData.name || username,
        bio: userData.bio || "",
        location: userData.location || "",
        avatar_url: userData.avatar_url || "",
        profile_url: userData.html_url || `https://github.com/${username}`,
        followers: userData.followers || 0,
        following: userData.following || 0,
        public_repos: userData.public_repos || 0,
        pull_requests_merged: "Unknown",
        issues_closed: "Unknown",
        achievements: {
          total_contributions: 0, // Can't get without token
          repositories_contributed_to: 0, // Can't get without token
        },
        social_accounts: [],
        readme_content: "",
        repositories: repositories.map((repo: any) => ({
          name: repo.name,
          description: repo.description || "",
          stargazerCount: repo.stargazers_count || 0,
          primaryLanguage: repo.language ? { name: repo.language } : undefined,
          url: repo.html_url,
          updatedAt: repo.updated_at,
        })),
      }
    } catch (error) {
      console.error("Basic profile fetch error:", error)
      return {
        error: `Failed to fetch basic GitHub profile: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  }

  static async fetchUserProfile(username: string): Promise<GitHubUser | { error: string }> {
    try {
      if (!this.validateUsernamePattern(username)) {
        throw new Error(`Invalid GitHub username: '${username}'`)
      }

      // If no token, use basic profile fetching
      if (!this.hasValidToken()) {
        console.log("No GitHub token found, using basic profile fetching")
        return await this.fetchBasicProfile(username)
      }

      // Enhanced fetching with token
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      const oneYearAgoISO = oneYearAgo.toISOString()

      const graphqlQuery = {
        query: `
          query {
            user(login: "${username}") {
              name
              bio
              location
              avatarUrl
              url
              followers {
                totalCount
              }
              following {
                totalCount
              }
              repository(name: "${username}") {
                object(expression: "HEAD:README.md") {
                  ... on Blob {
                    text
                  }
                }
              }
              repositories(first: 100, orderBy: {field: UPDATED_AT, direction: DESC}) {
                totalCount
                nodes {
                  name
                  description
                  stargazerCount
                  primaryLanguage {
                    name
                  }
                  url
                  updatedAt
                }
              }
              contributionsCollection(from: "${oneYearAgoISO}") {
                contributionCalendar {
                  totalContributions
                }
              }
              pullRequests(first: 100, states: MERGED, orderBy: {field: UPDATED_AT, direction: DESC}) {
                nodes {
                  createdAt
                }
                totalCount
              }
              issues(last: 100, states: CLOSED) {
                totalCount
                nodes {
                  createdAt
                }
              }
              repositoriesContributedTo(first: 100, contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]) {
                totalCount
              }
            }
          }
        `,
      }

      const response = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: this.getGitHubHeaders(),
        body: JSON.stringify(graphqlQuery),
      })

      if (!response.ok) {
        console.warn(`GraphQL API failed (${response.status}), falling back to basic profile`)
        return await this.fetchBasicProfile(username)
      }

      const result = await response.json()

      if (result.errors) {
        console.warn("GraphQL errors:", result.errors)
        return await this.fetchBasicProfile(username)
      }

      const userData = result.data?.user

      if (!userData) {
        throw new Error(`User '${username}' not found or query returned no data`)
      }

      // Calculate recent activity
      const now = new Date()
      const oneYearAgoDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())

      const recentPRs = userData.pullRequests.nodes.filter((pr: any) => new Date(pr.createdAt) > oneYearAgoDate).length

      const recentIssues = userData.issues.nodes.filter(
        (issue: any) => new Date(issue.createdAt) > oneYearAgoDate,
      ).length

      // Get social accounts
      const socialAccounts = await this.fetchSocialAccounts(username)

      return {
        username,
        name: userData.name || username,
        bio: userData.bio || "",
        location: userData.location || "",
        avatar_url: userData.avatarUrl || "",
        profile_url: userData.url || `https://github.com/${username}`,
        followers: userData.followers.totalCount,
        following: userData.following.totalCount,
        public_repos: userData.repositories.totalCount,
        pull_requests_merged: recentPRs < 100 ? recentPRs : "100+",
        issues_closed: recentIssues < 100 ? recentIssues : "100+",
        achievements: {
          total_contributions: userData.contributionsCollection.contributionCalendar.totalContributions,
          repositories_contributed_to: userData.repositoriesContributedTo.totalCount,
        },
        social_accounts: socialAccounts,
        readme_content: userData.repository?.object?.text || "",
        repositories: userData.repositories.nodes,
      }
    } catch (error) {
      console.error("Enhanced profile fetch error:", error)
      console.log("Falling back to basic profile fetching")
      return await this.fetchBasicProfile(username)
    }
  }

  private static async fetchSocialAccounts(username: string): Promise<Array<{ provider: string; url: string }>> {
    if (!this.hasValidToken()) {
      return [] // Skip social accounts if no token
    }

    try {
      // Try GitHub's social accounts API first
      const response = await fetch(`https://api.github.com/users/${username}/social_accounts`, {
        headers: this.getGitHubHeaders(),
      })

      if (response.ok) {
        const accounts = await response.json()
        return accounts.map((account: any) => ({
          provider: account.provider,
          url: account.url,
        }))
      }

      // Fallback to README parsing
      return await this.extractSocialFromReadme(username)
    } catch (error) {
      console.warn("Failed to fetch social accounts:", error)
      return []
    }
  }

  private static async extractSocialFromReadme(username: string): Promise<Array<{ provider: string; url: string }>> {
    if (!this.hasValidToken()) {
      return [] // Skip README parsing if no token
    }

    try {
      const response = await fetch(`https://api.github.com/repos/${username}/${username}/readme`, {
        headers: this.getGitHubHeaders(),
      })

      if (!response.ok) return []

      const data = await response.json()
      const content = atob(data.content)

      const socialLinks: Array<{ provider: string; url: string }> = []

      // LinkedIn patterns
      const linkedinMatches = content.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)\/?/gi)
      if (linkedinMatches) {
        socialLinks.push({
          provider: "linkedin",
          url: linkedinMatches[0],
        })
      }

      // Medium patterns
      const mediumMatches =
        content.match(/https?:\/\/(?:www\.)?medium\.com\/@?([a-zA-Z0-9_-]+)\/?/gi) ||
        content.match(/https?:\/\/([a-zA-Z0-9_-]+)\.medium\.com\/?/gi)
      if (mediumMatches) {
        socialLinks.push({
          provider: "medium",
          url: mediumMatches[0],
        })
      }

      // Twitter patterns
      const twitterMatches = content.match(/https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/?/gi)
      if (twitterMatches) {
        socialLinks.push({
          provider: "twitter",
          url: twitterMatches[0],
        })
      }

      return socialLinks
    } catch (error) {
      console.warn("Failed to extract social links from README:", error)
      return []
    }
  }

  static generateRoastingPrompt(profile: GitHubUser): string {
    const insights = []

    // Profile completeness
    if (!profile.bio) insights.push("has no bio (can't even describe themselves)")
    if (!profile.location) insights.push("too ashamed to share their location")
    if (!profile.name || profile.name === profile.username) insights.push("couldn't even set a proper name")

    // Social metrics
    const followerRatio = profile.followers / Math.max(profile.following, 1)
    if (followerRatio < 0.1) insights.push("follows way more people than follow them back (desperate for attention)")
    if (profile.followers < 10) insights.push("has almost no followers (nobody cares about their code)")
    if (profile.following > 1000) insights.push("follows everyone hoping for follow-backs (social media desperation)")

    // Repository analysis
    if (profile.repositories) {
      const totalStars = profile.repositories.reduce((sum, repo) => sum + repo.stargazerCount, 0)
      const avgStars = totalStars / Math.max(profile.repositories.length, 1)

      if (avgStars < 1) insights.push("repositories have almost no stars (code nobody wants)")
      if (profile.repositories.length < 5) insights.push("barely has any repositories (not actually coding)")

      const languages = profile.repositories.map((repo) => repo.primaryLanguage?.name).filter(Boolean)
      const uniqueLanguages = new Set(languages)

      if (uniqueLanguages.size === 1) {
        insights.push(`only codes in ${Array.from(uniqueLanguages)[0]} (one-trick pony)`)
      }

      const recentRepos = profile.repositories.filter(
        (repo) => new Date(repo.updatedAt) > new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000),
      )

      if (recentRepos.length === 0) insights.push("hasn't updated any repositories in months (gave up coding)")
    }

    // Activity analysis (only if we have the data)
    if (profile.achievements.total_contributions < 100) {
      insights.push("barely contributes to anything (lazy developer)")
    }
    if (profile.achievements.repositories_contributed_to < 5) {
      insights.push("doesn't contribute to other projects (antisocial coder)")
    }

    // Bio analysis
    if (profile.bio) {
      const bioLower = profile.bio.toLowerCase()
      if (bioLower.includes("full stack") && profile.repositories && profile.repositories.length < 10) {
        insights.push("claims to be 'full stack' but has no projects to prove it")
      }
      if (bioLower.includes("passionate") || bioLower.includes("love coding")) {
        insights.push("uses cliché buzzwords in bio (unoriginal personality)")
      }
      if (bioLower.includes("learning") || bioLower.includes("student")) {
        insights.push("still learning basics (amateur hour)")
      }
    }

    // README analysis
    if (!profile.readme_content) {
      insights.push("doesn't even have a profile README (can't market themselves)")
    } else if (profile.readme_content.length < 100) {
      insights.push("profile README is pathetically short (no effort)")
    }

    // Social presence
    if (profile.social_accounts.length === 0) {
      insights.push("has no social media links (antisocial or ashamed)")
    }

    return `You are roasting a GitHub profile. Here's the devastating data about this developer:

Username: ${profile.username}
Name: ${profile.name}
Bio: "${profile.bio || "No bio (can't even describe themselves)"}"
Location: ${profile.location || "Unknown (hiding in shame)"}
Followers: ${profile.followers} | Following: ${profile.following}
Public Repos: ${profile.public_repos}
Total Contributions (last year): ${profile.achievements.total_contributions || "Unknown"}
Pull Requests Merged: ${profile.pull_requests_merged}
Issues Closed: ${profile.issues_closed}

DEVASTATING INSIGHTS: ${insights.join(", ")}

${
  profile.repositories && profile.repositories.length > 0
    ? `
TOP REPOSITORIES ANALYSIS:
${profile.repositories
  .slice(0, 5)
  .map(
    (repo) =>
      `- "${repo.name}": ${repo.stargazerCount} stars, ${repo.primaryLanguage?.name || "No language"} ${repo.description ? `- "${repo.description}"` : "(no description)"}`,
  )
  .join("\n")}
`
    : ""
}

Based on this pathetic GitHub profile data, deliver a new, unique, and absolutely savage roast. Use the specific metrics, repository names, bio content, and social patterns to create a personalized destruction. Be brutal about their coding skills, project quality, social presence, and developer credibility. Make it cutting, specific, and devastatingly accurate. 2-3 sentences maximum.`
  }

  static generateBasicRoastingPrompt(username: string, profileUrl: string): string {
    return `You are roasting a GitHub profile. Based on this URL: ${profileUrl} for user ${username}, roast their coding skills, commit messages, repository names, or lack thereof. Focus on typical GitHub fails like empty repos, terrible commit messages, copying tutorials, or having no meaningful projects. Be savage about their developer credibility and coding abilities. Deliver a new, unique, and brutal roast. Do not repeat previous roasts. Be witty, cutting, and creative. 2-3 sentences maximum.`
  }
}
