"use client";

import { useState, useEffect } from "react";
import { 
  Github, Star, GitFork,
  Share2, Edit, Globe, Linkedin, ExternalLink
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import PageContainer from "@/components/layout/PageContainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { validateUserData } from '@/utils/auth';
import GitHubStats from "@/components/dashboard/GitHubStats";

interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  avatar?: string;
  github_username?: string;
  github?: string;
  phone?: string;
  role?: string;
  linkedin?: string;
  personalWebsite?: string;
  displayName?: string;
  education?: {
    university?: string;
    graduationYear?: string;
  };
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function UserDashboardPage() {
  const params = useParams();
  const username = params.username as string;
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [isCurrentUserProfile, setIsCurrentUserProfile] = useState(false);

  // Fetch the profile user data
  useEffect(() => {
    const fetchProfileUser = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/users/${username}`);
        
        if (!response.ok) {
          const errorMsg = response.status === 404 ? "User not found" : "Failed to fetch user profile";
          setError(errorMsg);
          toast({
            title: "Error",
            description: errorMsg,
            variant: "destructive",
          });
          return;
        }

        const data = await response.json();
        if (data.success) {
          setUser(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch user profile');
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "An error occurred while fetching the profile";
        setError(errorMsg);
        console.error('Error fetching user profile:', error);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchProfileUser();
    }
  }, [username, router, toast]);

  // Check if the current user is viewing their own profile
  useEffect(() => {
    const checkCurrentUser = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!storedUser || !token) {
          setIsCurrentUserProfile(false);
          return;
        }
        
        const userData = JSON.parse(storedUser);
        if (!validateUserData(userData)) {
          setIsCurrentUserProfile(false);
          return;
        }
        
        setUser(userData);
        
        // Check if the profile being viewed belongs to the current user
        const isOwnProfile = userData.displayName === username || userData.name === username;
        setIsCurrentUserProfile(isOwnProfile);
      } catch (error) {
        console.error('Error checking current user:', error);
        setIsCurrentUserProfile(false);
      }
    };
    
    checkCurrentUser();
  }, [username]);

  const handleShareProfile = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied",
        description: "Profile link copied to clipboard",
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
          {/* Profile Header Skeleton */}
          <div className="mb-8">
            <div className="bg-card rounded-xl shadow-sm overflow-hidden">
              <div className="h-32 bg-muted animate-pulse relative">
                <div className="absolute top-4 right-4 flex gap-2">
                  <div className="h-8 bg-background/30 rounded w-28 animate-pulse" />
                  <div className="h-8 bg-background/30 rounded w-20 animate-pulse" />
                </div>
              </div>
              <div className="p-6 pt-0 relative">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0 -mt-16">
                    <div className="w-32 h-32 rounded-full bg-muted animate-pulse border-4 border-background" />
                  </div>
                  
                  <div className="flex-1 pt-4 md:pt-0">
                    <div className="flex flex-col justify-between gap-4 mb-6">
                      <div>
                        <div className="h-8 bg-muted rounded w-48 animate-pulse mb-2" />
                        <div className="h-5 bg-muted rounded w-32 animate-pulse mb-2" />
                        <div className="h-4 bg-muted rounded w-40 animate-pulse" />
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mb-4">
                      <div className="h-9 bg-muted rounded w-24 animate-pulse" />
                      <div className="h-9 bg-muted rounded w-28 animate-pulse" />
                      <div className="h-9 bg-muted rounded w-24 animate-pulse" />
                    </div>
                    
                    <div className="h-4 bg-muted rounded w-56 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* GitHub Stats Skeleton */}
          <div className="mb-8">
            <div className="bg-card rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 pb-2">
                <div className="h-7 bg-muted rounded w-40 animate-pulse" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-6 pt-0">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-muted rounded-lg p-5 animate-pulse">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-4 bg-background/50 rounded w-24" />
                      <div className="h-5 w-5 rounded-full bg-background/50" />
                    </div>
                    <div className="h-8 bg-background/50 rounded w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Tabs Skeleton */}
          <div className="bg-card rounded-xl shadow-sm p-6 mb-8">
            <div className="border-b pb-2 mb-6">
              <div className="grid grid-cols-3 gap-2 h-10">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 bg-muted rounded animate-pulse" />
                ))}
              </div>
            </div>
            
            <div className="h-7 bg-muted rounded w-48 animate-pulse mb-6" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-muted rounded-xl h-48 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error || !user) {
    return (
      <PageContainer>
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
          <div className="bg-card rounded-xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">User not found</h1>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              The user you&apos;re looking for doesn&apos;t exist or there was an error loading their profile.
            </p>
            <Button onClick={() => router.push('/')} variant="outline">
              Return to Home
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
        {/* Profile Header - Redesigned with modern UI */}
        <div className="mb-8">
          <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-muted/40">
            <div className="h-32 bg-gradient-to-r from-primary/10 via-primary/15 to-primary/30 dark:from-primary/5 dark:to-primary/20 relative">
              <div className="absolute inset-0 bg-gradient-to-l from-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-card to-transparent"></div>
              <div className="absolute top-4 right-4 flex gap-2">
                {isCurrentUserProfile && (
                  <Button variant="outline" size="sm" className="gap-2 bg-background/80 backdrop-blur-sm hover:bg-background/90 border-muted/50" onClick={() => router.push('/settings')}>
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </Button>
                )}
                <Button variant="outline" size="sm" className="gap-2 bg-background/80 backdrop-blur-sm hover:bg-background/90 border-muted/50" onClick={handleShareProfile}>
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>
            
            <div className="px-6 pb-6 relative">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-shrink-0 -mt-12 z-10">
                  <div className="rounded-full p-1 bg-card ring-2 ring-background shadow-md border border-muted/40">
                    <Avatar className="w-24 h-24 border border-muted/50">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-xl bg-primary/10">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                
                <div className="flex-1 pt-1 md:pt-0 md:mt-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                    <div className="p-3 bg-muted/5 rounded-lg border border-muted/30">
                      <h1 className="text-2xl font-bold tracking-tight">{user.displayName || user.name}</h1>
                      <p className="text-base text-muted-foreground flex items-center gap-2">
                        <span className="text-primary font-medium">@{user.name}</span>
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                      {user.github && (
                        <a 
                          href={user.github.startsWith('http') ? user.github : `https://github.com/${user.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:no-underline"
                        >
                          <Button variant="outline" size="sm" className="gap-1.5 h-9 rounded-full px-4 border-muted/50">
                            <Github className="w-4 h-4" />
                            GitHub
                          </Button>
                        </a>
                      )}
                      {user.linkedin && (
                        <a 
                          href={user.linkedin.startsWith('http') ? user.linkedin : `https://linkedin.com/in/${user.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:no-underline"
                        >
                          <Button variant="outline" size="sm" className="gap-1.5 h-9 rounded-full px-4 border-muted/50">
                            <Linkedin className="w-4 h-4" />
                            LinkedIn
                          </Button>
                        </a>
                      )}
                      {user.personalWebsite && (
                        <a 
                          href={user.personalWebsite.startsWith('http') ? user.personalWebsite : `https://${user.personalWebsite}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:no-underline"
                        >
                          <Button variant="outline" size="sm" className="gap-1.5 h-9 rounded-full px-4 border-muted/50">
                            <Globe className="w-4 h-4" />
                            Portfolio
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {user.education?.university && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-graduation-cap">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                        <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
                      </svg>
                      {user.education.university}
                      {user.education.graduationYear && (
                        <span className="inline-flex items-center">
                          <span className="mx-1">•</span> Class of {user.education.graduationYear}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* GitHub Stats - Redesigned */}
        <div className="mb-8">
          <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-muted/40">
            <div className="p-6 pb-0 border-b border-muted/40">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Github className="w-6 h-6 text-primary" />
                GitHub Stats
              </h2>
            </div>
            
            <GitHubStats data={null} />
          </div>
        </div>
        
        {/* Tabs - Redesigned */}
        <div className="mb-8">
          <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-muted/40">
            <Tabs defaultValue="repositories" className="w-full">
              <div className="border-b border-muted/40">
                <div className="px-6 pt-6">
                  <TabsList className="w-full flex justify-start space-x-2 bg-transparent p-0">
                    <TabsTrigger 
                      value="repositories" 
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent px-4 py-2 rounded-none transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <GitFork className="w-4 h-4" />
                        <span>Zemon Repos</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="tools" 
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent px-4 py-2 rounded-none transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        <span>Zemon Tools</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="activity" 
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent px-4 py-2 rounded-none transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        <span>Activity</span>
                      </div>
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>
              
              {/* Repositories Tab Content */}
              <TabsContent value="repositories" className="p-6 focus-visible:outline-none focus-visible:ring-0">
                <div className="text-center py-12 bg-muted/10 rounded-lg border border-dashed border-muted/50">
                  <h3 className="text-lg font-medium mb-2">No repositories yet</h3>
                  <p className="text-muted-foreground">This user hasn&apos;t published any repositories.</p>
                </div>
              </TabsContent>
              
              {/* Tools Tab Content */}
              <TabsContent value="tools" className="p-6 focus-visible:outline-none focus-visible:ring-0">
                <div className="text-center py-12 bg-muted/10 rounded-lg border border-dashed border-muted/50">
                  <h3 className="text-lg font-medium mb-2">No tools yet</h3>
                  <p className="text-muted-foreground">This user hasn&apos;t published any tools.</p>
                </div>
              </TabsContent>
              
              {/* Activity Tab Content */}
              <TabsContent value="activity" className="p-6 focus-visible:outline-none focus-visible:ring-0">
                <div className="text-center py-12 bg-muted/10 rounded-lg border border-dashed border-muted/50">
                  <h3 className="text-lg font-medium mb-2">Coming soon</h3>
                  <p className="text-muted-foreground">Activity tracking will be available soon.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </PageContainer>
  );
} 