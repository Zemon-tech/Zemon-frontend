"use client";

import { ChevronDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

interface UserAvatarProps {
  user: {
    name: string;
    displayName?: string;
    email: string;
    avatar?: string;
  };
  onLogout: () => void;
  showDashboard?: boolean;
}

export default function UserAvatar({ user, onLogout, showDashboard }: UserAvatarProps) {
  const { toast } = useToast();
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    // Set the username for the dashboard link
    setUsername(user.name);
  }, [user]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    try {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Call parent's logout handler
      onLogout();

      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative group">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium overflow-hidden">
              {user.avatar ? (
                <div className="relative w-full h-full">
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    fill
                    className="object-cover"
                    onError={() => {
                      const element = document.getElementById(`avatar-${user.name}`);
                      if (element) {
                        element.textContent = getInitials(user.name);
                      }
                    }}
                  />
                </div>
              ) : (
                <span id={`avatar-${user.name}`}>{getInitials(user.name)}</span>
              )}
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName || user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">@{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground mt-1">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {showDashboard && (
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/${username}`}>Dashboard</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 