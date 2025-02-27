interface UserData {
  name: string;
  email: string;
  password?: string;
  displayName?: string;
  avatar?: string;
  github?: string;
  linkedin?: string;
  personalWebsite?: string;
  company?: string;
  role?: string;
  education?: {
    university?: string;
    graduationYear?: number;
  };
}

export function validateUserData(data: UserData): boolean {
  // Check required fields
  if (!data.name || !data.email) {
    return false;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return false;
  }

  // Validate name length
  if (data.name.length < 2 || data.name.length > 50) {
    return false;
  }

  // If password is provided, validate it
  if (data.password) {
    if (data.password.length < 8) {
      return false;
    }
  }

  return true;
} 