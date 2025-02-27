"use client";

import { useState } from "react";
import { GitBranch, GitCommit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ReactMarkdown from "react-markdown";

interface OverviewTabProps {
  readme: string;
  languages: Array<{
    name: string;
    value: number;
    color: string;
    bytes: number;
  }>;
  branches: Array<{
    name: string;
    commit: {
      sha: string;
      url: string;
    };
  }>;
  lastCommits: Array<{
    sha: string;
    message: string;
    date: string;
    author: {
      name: string;
      email: string;
    };
  }>;
  repoInfo: {
    owner: string;
    name: string;
    defaultBranch: string;
  };
}

export default function OverviewTab({
  readme,
  languages,
  branches,
  lastCommits,
  repoInfo
}: OverviewTabProps) {
  const [selectedBranch, setSelectedBranch] = useState(repoInfo.defaultBranch);

  // Calculate total bytes for languages
  const totalBytes = languages.reduce((acc, lang) => acc + lang.bytes, 0);

  // Convert bytes to percentages
  const languagesWithPercentages = languages.map(lang => ({
    ...lang,
    percentage: Math.round((lang.bytes / totalBytes) * 100)
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* README Section */}
        <Card>
          <CardHeader>
            <CardTitle>README.md</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{readme}</ReactMarkdown>
          </CardContent>
        </Card>

        {/* Recent Commits */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Recent Commits</CardTitle>
            <GitCommit className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lastCommits.map((commit) => (
                <div
                  key={commit.sha}
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50"
                >
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{commit.message}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{commit.author.name}</span>
                      <span>•</span>
                      <time dateTime={commit.date}>
                        {new Date(commit.date).toLocaleDateString()}
                      </time>
                    </div>
                  </div>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {commit.sha.slice(0, 7)}
                  </code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Languages */}
        <Card>
          <CardHeader>
            <CardTitle>Languages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {languagesWithPercentages.map((lang) => (
              <div key={lang.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{lang.name}</span>
                  <span className="text-muted-foreground">{lang.percentage}%</span>
                </div>
                <Progress
                  value={lang.percentage}
                  className="h-2"
                  style={{
                    backgroundColor: `${lang.color}20`,
                    '--progress-foreground': lang.color
                  } as React.CSSProperties}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Branches */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Branches</CardTitle>
            <GitBranch className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {branches.map((branch) => (
                <div
                  key={branch.name}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-muted/50 ${
                    selectedBranch === branch.name ? "bg-muted" : ""
                  }`}
                  onClick={() => setSelectedBranch(branch.name)}
                >
                  <span className="text-sm font-medium">{branch.name}</span>
                  {branch.name === repoInfo.defaultBranch && (
                    <Badge variant="outline" className="text-xs">
                      Default
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 