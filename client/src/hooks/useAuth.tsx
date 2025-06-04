import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { login } from '../services/api';
import type { User } from '../services/api';

interface AuthContextType {
  user: User | null;
  loginUser: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loginUser: async () => {},
  logout: () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  async function loginUser(username: string, password: string) {
    const u = await login(username, password);
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('user');
  }

  return (
    <AuthContext.Provider value={{ user, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
