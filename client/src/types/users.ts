/**
 * User type for user accounts
 */
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
} 