"use client";

import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";

interface AvatarUploadProps {
  currentAvatar?: string;
  onUpload: (url: string) => void;
}

export default function AvatarUpload({ currentAvatar, onUpload }: AvatarUploadProps) {
  const { toast } = useToast();
  const previewUrl = currentAvatar;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      // Simulate file upload - replace with actual upload logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock response - replace with actual upload response
      const uploadedUrl = URL.createObjectURL(file);
      onUpload(uploadedUrl);
      
      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to upload profile picture";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        id="avatar-upload"
      />
      
      <div className="relative w-32 h-32 rounded-full overflow-hidden bg-primary/10">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Avatar preview"
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <Upload className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
      </div>

      <label
        htmlFor="avatar-upload"
        className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-primary text-primary-foreground cursor-pointer shadow-lg"
      >
        <Upload className="w-4 h-4" />
      </label>
    </div>
  );
} 