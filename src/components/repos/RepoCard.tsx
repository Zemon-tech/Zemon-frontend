"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface RepoCardProps {
  id: string;
  name: string;
  description: string;
  language: string;
  updatedAt: string;
  creator: {
    name: string;
    id: string;
  };
  currentUserId?: string | null;
  onDelete?: () => void;
  onGitHubClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function RepoCard({
  id,
  name,
  description,
  language,
  updatedAt,
  creator,
  currentUserId,
  onDelete,
  onGitHubClick
}: RepoCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to delete the repository');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/repos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete repository');
      }

      toast({
        title: "Success",
        description: "Repository deleted successfully",
      });

      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Error deleting repository:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete repository",
        variant: "destructive",
      });
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <div className="group relative rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        {(currentUserId === creator.id) && (
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <Button
              onClick={handleDeleteClick}
              variant="destructive"
              size="icon"
              className="w-8 h-8"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                {name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Badge variant="secondary">{language}</Badge>
            <span>Updated {new Date(updatedAt).toLocaleDateString()}</span>
          </div>

          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onGitHubClick}
              className="w-full"
            >
              View on GitHub
            </Button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Repository"
          message="Are you sure you want to delete this repository? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
} 