import { useState } from 'react';
import { User } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, _password: string) => {
    setIsLoading(true);
    // TODO: call POST /api/auth/login
    setIsLoading(false);
  };

  const logout = () => setUser(null);

  return { user, isLoading, login, logout };
}