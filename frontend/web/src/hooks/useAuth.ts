import { useState } from 'react';
import { User } from '@/types';

const MOCK_USERS: (User & { password: string })[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'user@jobswipe.com',
    password: 'user123',
    role: 'user',
  },
  {
    id: '2',
    name: 'Accenture HR',
    email: 'company@jobswipe.com',
    password: 'company123',
    role: 'company',
  },
  {
    id: '3',
    name: 'Admin',
    email: 'admin@jobswipe.com',
    password: 'admin123',
    role: 'admin',
  },
];

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    await new Promise(r => setTimeout(r, 800)); // simulate API delay

    const found = MOCK_USERS.find(
      u => u.email === email && u.password === password
    );

    if (found) {
      const { password: _, ...userData } = found;
      setUser(userData);
      setIsLoading(false);
      return userData; // ← caller uses role to redirect
    } else {
      setError('Invalid email or password');
      setIsLoading(false);
      return null;
    }
  };

  const logout = () => setUser(null);

  return { user, isLoading, error, login, logout };
}