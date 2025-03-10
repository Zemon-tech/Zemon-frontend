"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Star, GitFork, AlertCircle, GitPullRequest } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import PageContainer from "@/components/layout/PageContainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import Image from "next/image";
import OverviewTab from "@/components/repos/tabs/OverviewTab";
import ActivityTab from "@/components/repos/tabs/ActivityTab";
import ContributorsTab from "@/components/repos/tabs/ContributorsTab";
import DependenciesTab from "@/components/repos/tabs/DependenciesTab";
import { getRepoDetails, type GitHubResponse } from "@/lib/github";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

interface Repository {
  _id: string;
  name: string;
  description: string;
  github_url: string;
  stars: number;
  forks: number;
  branches: number;
  contributors: Array<{
    login: string;
    avatar_url: string;
    contributions: number;
  }>;
  thumbnail_url: string;
  owner: string;
  readme_url: string;
  likes: string[];
  comments: Array<{
    user: string;
    content: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  openIssues: number;
  pullRequests: number;
  readme?: string;
  languages?: string[];
  lastCommits?: Array<{
    date: string;
    commits: number;
  }>;
  activityData?: Array<{
    date: string;
    commits: number;
    pullRequests: number;
  }>;
  pullRequestsData?: Array<{
    title: string;
    author: string;
    status: "open" | "merged" | "closed";
    createdAt: string;
    number: number;
    url: string;
  }>;
  dependencies?: Array<{
    name: string;
    version: string;
    latest: string;
    type: "production" | "development";
    hasVulnerabilities: boolean;
    isOutdated: boolean;
  }>;
}

interface PullRequestData {
  title: string;
  author: string;
  status: string;
  createdAt: string;
  number: number;
  url: string;
}

interface TransformedPullRequest {
  title: string;
  author: string;
  status: "open" | "merged" | "closed";
  createdAt: string;
  number: number;
  url: string;
}

interface GitHubResponseWithTransformed extends Omit<GitHubResponse, 'pullRequests'> {
  pullRequests: TransformedPullRequest[];
}

export default function RepoDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const [repo, setRepo] = useState<Repository | null>(null);
  const [loading, setLoading] = useState(true);
  const [githubData, setGithubData] = useState<GitHubResponseWithTransformed | null>(null);

  // Transform GitHub pull request status to our expected type
  const transformPullRequests = (prs: PullRequestData[]): TransformedPullRequest[] => {
    return prs.map(pr => {
      // Ensure status is one of our expected values
      let status: "open" | "merged" | "closed" = "open";
      const rawStatus = pr.status?.toLowerCase() || "open";
      if (rawStatus === "merged" || rawStatus === "closed") {
        status = rawStatus;
      }

      return {
        title: pr.title,
        author: pr.author,
        status,
        createdAt: pr.createdAt,
        number: pr.number,
        url: pr.url
      };
    });
  };

  // Transform GitHub branches to match expected type
  const transformBranches = (branches: Array<{ name: string; lastCommit: string; protected: boolean; }>) => {
    return branches.map(branch => ({
      name: branch.name,
      commit: {
        sha: branch.lastCommit,
        url: `${repo?.github_url}/commit/${branch.lastCommit}`
      }
    }));
  };

  // Transform commits to match expected type
  const transformCommits = (commits: Array<{ date: string; message: string; author: string; sha: string; url: string; }>) => {
    return commits.map(commit => ({
      sha: commit.sha,
      message: commit.message,
      date: commit.date,
      author: {
        name: commit.author,
        email: `${commit.author}@github.com` // Using a placeholder email since it's not provided
      }
    }));
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Fetch repo data from your API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/repos/${params.id}`);
        const data = await response.json();
        
        if (data.success) {
          setRepo(data.data);
          
          // Extract owner and repo name from github_url
          const githubUrlParts = data.data.github_url.split('/');
          const owner = githubUrlParts[githubUrlParts.length - 2];
          const repoName = githubUrlParts[githubUrlParts.length - 1];
          
          // Fetch GitHub data
          const githubData = await getRepoDetails(owner, repoName);
          // Transform pull requests to ensure correct typing
          const transformedGithubData: GitHubResponseWithTransformed = {
            ...githubData,
            pullRequests: transformPullRequests(githubData.pullRequests || [])
          };
          setGithubData(transformedGithubData);
        } else {
          throw new Error(data.message || 'Failed to fetch repository details');
        }
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "Failed to load repository details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchAllData();
    }
  }, [params.id, toast]);

  if (loading) {
    return (
      <PageContainer>
        <div className="animate-pulse space-y-4 py-8">
          <div className="h-8 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-96 bg-muted rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!repo) {
    return (
      <PageContainer>
        <div className="py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Repository not found</h1>
          <Link href="/repos" className="text-primary hover:underline">
            Back to Repositories
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-8">
      {/* Header Section */}
      <div className="flex flex-col gap-6 mb-8">
        <Link
          href="/repos"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={20} />
          Back to Repositories
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center relative">
              <Image
                src={repo.avatar || "/Z.jpg"}
                alt={repo.name}
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{repo.name}</h1>
              <p className="text-muted-foreground">{repo.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <a href={repo.github_url} target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 mr-2" />
                View on GitHub
              </a>
            </Button>
            <Button size="sm">
              <Star className="w-4 h-4 mr-2" />
              Star
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            title="Stars"
            value={repo.stars}
            icon={<Star className="w-4 h-4 text-yellow-500" />}
          />
          <StatCard
            title="Forks"
            value={repo.forks}
            icon={<GitFork className="w-4 h-4" />}
          />
          <StatCard
            title="Open Issues"
            value={repo.openIssues}
            icon={<AlertCircle className="w-4 h-4" />}
          />
          <StatCard
            title="Pull Requests"
            value={repo.pullRequests}
            icon={<GitPullRequest className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="contributors">Contributors</TabsTrigger>
          <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewTab
            readme={githubData?.repoData?.readme || ""}
            languages={githubData?.languages || []}
            branches={transformBranches(githubData?.branches || [])}
            lastCommits={transformCommits(githubData?.commits || [])}
            repoInfo={githubData?.repoInfo || {
              owner: repo?.owner || '',
              name: repo?.name || '',
              defaultBranch: 'main'
            }}
          />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <ActivityTab
            activityData={githubData?.activityData || []}
            pullRequests={githubData?.pullRequests || []}
          />
        </TabsContent>

        <TabsContent value="contributors" className="space-y-4">
          <ContributorsTab
            contributors={repo.contributors?.map(c => ({
              ...c,
              pullRequests: 0,
              reviews: 0
            })) || []}
            totalContributions={repo.contributors?.reduce((acc, curr) => acc + curr.contributions, 0) || 0}
          />
        </TabsContent>

        <TabsContent value="dependencies" className="space-y-4">
          <DependenciesTab
            dependencies={repo.dependencies || []}
          />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
} 