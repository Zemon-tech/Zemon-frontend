const GITHUB_API_BASE = "https://api.github.com";

interface GitHubApiOptions {
  headers?: HeadersInit;
}

interface GitHubRepo {
  name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  html_url: string;
  private: boolean;
  updated_at: string;
}

interface GitHubOrg {
  login: string;
  avatar_url: string;
}

interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

async function githubFetch(endpoint: string, options: GitHubApiOptions = {}) {
  const headers = {
    "Accept": "application/vnd.github.v3+json",
    "Authorization": `token ${process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN}`,
    ...options.headers,
  };

  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, { headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`GitHub API error: ${error.message || response.statusText}`);
  }
  return response.json();
}

interface GitHubRepoData {
  readme: string;
  name: string;
  description: string;
  default_branch: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  watchers_count: number;
  created_at: string;
  updated_at: string;
  homepage?: string;
  language?: string;
  license?: {
    key: string;
    name: string;
    url: string;
  };
  visibility: string;
  topics: string[];
}

export interface GitHubResponse {
  repoData: GitHubRepoData;
  languages: Array<{
    name: string;
    value: number;
    color: string;
    bytes: number;
  }>;
  commits: Array<{
    date: string;
    message: string;
    author: string;
    sha: string;
    url: string;
  }>;
  pullRequests: Array<{
    title: string;
    author: string;
    status: string;
    createdAt: string;
    number: number;
    url: string;
  }>;
  contributors: Array<{
    login: string;
    avatar_url: string;
    contributions: number;
    profile: string;
  }>;
  activityData: Array<{
    date: string;
    commits: number;
    pullRequests: number;
  }>;
  branches: Array<{
    name: string;
    lastCommit: string;
    protected: boolean;
  }>;
  repoInfo: {
    owner: string;
    name: string;
    defaultBranch: string;
  };
}

interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      date: string;
    };
    message: string;
  };
}

interface GitHubPullRequest {
  number: number;
  title: string;
  state: string;
  created_at: string;
  html_url: string;
  user: {
    login: string;
    avatar_url: string;
  };
}

interface GitHubContributor {
  login: string;
  avatar_url: string;
  contributions: number;
}

interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
  };
}

export async function getRepoDetails(owner: string, repo: string): Promise<GitHubResponse> {
  try {
    const [repoData, languages, commits, pullRequests, contributors, branches] = await Promise.all([
      githubFetch(`/repos/${owner}/${repo}`),
      githubFetch(`/repos/${owner}/${repo}/languages`),
      githubFetch(`/repos/${owner}/${repo}/commits?per_page=30`),
      githubFetch(`/repos/${owner}/${repo}/pulls?state=all&per_page=10`),
      githubFetch(`/repos/${owner}/${repo}/contributors?per_page=10`),
      githubFetch(`/repos/${owner}/${repo}/branches`),
    ]);

    // Get default branch
    const defaultBranch = repoData.default_branch;

    // Fetch README content directly from the API
    let readme = "";
    try {
      const readmeData = await githubFetch(`/repos/${owner}/${repo}/readme`);
      readme = Buffer.from(readmeData.content, 'base64').toString('utf-8');
    } catch (error) {
      console.warn('Failed to fetch README:', error);
      readme = "No README available";
    }

    // Transform languages data with type safety
    const totalBytes = Object.values(languages as Record<string, number>).reduce((a, b) => a + b, 0);
    const languagesData = Object.entries(languages as Record<string, number>)
      .map(([name, bytes]) => ({
        name,
        value: Number(((bytes / totalBytes) * 100).toFixed(1)),
        color: getLanguageColor(name),
        bytes,
      }))
      .sort((a, b) => b.value - a.value);

    // Transform commits data with proper typing
    const commitsByDate = commits.reduce((acc: Record<string, number>, commit: GitHubCommit) => {
      const date = new Date(commit.commit.author.date).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const activityData = Object.entries(commitsByDate).map(([date, count]) => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      return {
        date,
        commits: count as number,
        pullRequests: pullRequests.filter((pr: GitHubPullRequest) =>
          new Date(pr.created_at) >= thirtyDaysAgo
        ).length
      };
    });

    return {
      repoData: {
        ...repoData,
        readme,
      },
      repoInfo: {
        owner,
        name: repo,
        defaultBranch,
      },
      languages: languagesData,
      commits: commits.map((commit: GitHubCommit) => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author.name,
        date: commit.commit.author.date,
      })),
      pullRequests: pullRequests.map((pr: GitHubPullRequest) => ({
        number: pr.number,
        title: pr.title,
        state: pr.state,
        url: pr.html_url,
        author: pr.user.login,
        avatar: pr.user.avatar_url,
      })),
      contributors: contributors.map((contributor: GitHubContributor) => ({
        username: contributor.login,
        avatar: contributor.avatar_url,
        contributions: contributor.contributions,
      })),
      activityData,
      branches: branches.map((branch: GitHubBranch) => ({
        name: branch.name,
        sha: branch.commit.sha,
      })),
    };
  } catch (error) {
    console.error('Error fetching repository details:', error);
    throw error;
  }
}

// Helper function to get language colors (you can expand this)
function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    JavaScript: "#f1e05a",
    TypeScript: "#2b7489",
    Python: "#3572A5",
    Java: "#b07219",
    Go: "#00ADD8",
    Rust: "#dea584",
    PHP: "#4F5D95",
    Ruby: "#701516",
    C: "#555555",
    "C++": "#f34b7d",
    "C#": "#178600",
    Swift: "#ffac45",
    Kotlin: "#F18E33",
    Dart: "#00B4AB",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Vue: "#41b883",
    Shell: "#89e051",
    Scala: "#c22d40",
    Lua: "#000080",
    Perl: "#0298c3",
    Haskell: "#5e5086",
    R: "#198CE7",
    Elixir: "#6e4a7e",
    Clojure: "#db5855",
    Elm: "#60B5CC",
    MATLAB: "#e16737",
    Assembly: "#6E4C13",
    PowerShell: "#012456",
    Groovy: "#e69f56",
    SQL: "#e38c00",
    SCSS: "#c6538c",
    Dockerfile: "#384d54",
    Markdown: "#083fa1",
    Jupyter: "#DA5B0B",
  };
  return colors[language] || "#6e7681"; // Default color for unknown languages
}

interface GitHubUserData {
  username: string;
  avatar_url: string;
  name: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  total_stars: number;
  organizations: Array<{
    login: string;
    avatar_url: string;
  }>;
  repositories: Array<{
    name: string;
    description: string;
    stars: number;
    forks: number;
    language: string;
    html_url: string;
    isPrivate: boolean;
    updatedAt: string;
  }>;
}

export async function fetchGitHubProfile(username: string): Promise<GitHubUserData> {
  try {
    // Fetch basic user data
    const userData = await githubFetch(`/users/${username}`) as GitHubUser;
    
    // Fetch user's repositories
    const reposData = await githubFetch(`/users/${username}/repos?sort=updated&per_page=10`) as GitHubRepo[];
    
    // Fetch user's organizations
    const orgsData = await githubFetch(`/users/${username}/orgs`) as GitHubOrg[];

    // Calculate total stars from repositories
    const totalStars = reposData.reduce((acc, repo) => acc + repo.stargazers_count, 0);

    // Transform repositories data
    const repos = reposData.map((repo) => ({
      name: repo.name,
      description: repo.description || '',
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language || 'Unknown',
      html_url: repo.html_url,
      isPrivate: repo.private,
      updatedAt: repo.updated_at
    }));

    return {
      username: userData.login,
      avatar_url: userData.avatar_url,
      name: userData.name || userData.login,
      bio: userData.bio || '',
      public_repos: userData.public_repos,
      followers: userData.followers,
      following: userData.following,
      total_stars: totalStars,
      organizations: orgsData.map((org) => ({
        login: org.login,
        avatar_url: org.avatar_url,
      })),
      repositories: repos
    };
  } catch (error) {
    console.error('Error fetching GitHub profile:', error);
    throw error;
  }
} 