const GITHUB_API = "https://api.github.com"
const README_MAX_CHARS = 600

export class GitHubNotFoundError extends Error {
  constructor(username: string) {
    super(`GitHub user "${username}" not found.`)
    this.name = "GitHubNotFoundError"
  }
}

interface GitHubUser {
  login: string
  bio: string | null
  location: string | null
  followers: number
  public_repos: number
}

interface GitHubRepo {
  name: string
  description: string | null
  language: string | null
  topics: string[]
  stargazers_count: number
  fork: boolean
  html_url: string
}

async function ghFetch(path: string): Promise<Response> {
  return fetch(`${GITHUB_API}${path}`, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "CareerBrain/1.0",
    },
    next: { revalidate: 3600 }, // cache for 1 hour
  })
}

async function fetchReadme(
  username: string,
  repo: string
): Promise<string | null> {
  try {
    const res = await ghFetch(`/repos/${username}/${repo}/readme`)
    if (!res.ok) return null
    const data = (await res.json()) as { content?: string; encoding?: string }
    if (!data.content || data.encoding !== "base64") return null
    const decoded = Buffer.from(data.content, "base64").toString("utf-8")
    return decoded.slice(0, README_MAX_CHARS)
  } catch {
    return null
  }
}

/**
 * Fetches public GitHub data for a username and returns it as a
 * structured text block ready for AI ingestion.
 *
 * Throws GitHubNotFoundError if the username does not exist.
 */
export async function fetchGitHubData(username: string): Promise<string> {
  // Fetch user profile
  const userRes = await ghFetch(`/users/${username}`)
  if (userRes.status === 404) {
    throw new GitHubNotFoundError(username)
  }
  if (!userRes.ok) {
    throw new Error(`GitHub API error: ${userRes.status} ${userRes.statusText}`)
  }
  const user = (await userRes.json()) as GitHubUser

  // Fetch repos
  const reposRes = await ghFetch(
    `/users/${username}/repos?sort=updated&per_page=30`
  )
  const allRepos = reposRes.ok ? ((await reposRes.json()) as GitHubRepo[]) : []

  // Filter forks, take top 10 non-fork repos
  const repos = allRepos
    .filter((r) => !r.fork)
    .slice(0, 10)

  // Fetch READMEs in parallel
  const readmes = await Promise.all(
    repos.map((r) => fetchReadme(username, r.name))
  )

  // Build text block
  const lines: string[] = [
    `GitHub Profile: ${user.login}`,
    `Bio: ${user.bio ?? "N/A"}`,
    `Location: ${user.location ?? "N/A"}`,
    `Followers: ${user.followers}`,
    `Public Repos: ${user.public_repos}`,
    "---",
  ]

  repos.forEach((repo, i) => {
    lines.push(`Repository: ${repo.name}`)
    lines.push(`Language: ${repo.language ?? "N/A"}`)
    lines.push(`Description: ${repo.description ?? "N/A"}`)
    if (repo.topics?.length > 0) {
      lines.push(`Topics: ${repo.topics.join(", ")}`)
    }
    lines.push(`Stars: ${repo.stargazers_count}`)
    if (readmes[i]) {
      lines.push(`README excerpt: ${readmes[i]}`)
    }
    lines.push("---")
  })

  return lines.join("\n")
}
