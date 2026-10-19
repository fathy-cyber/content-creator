export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  metadata?: Record<string, any>;
}

export interface AuthSession {
  user: User;
  access_token: string;
}
