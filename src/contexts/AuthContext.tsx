import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
  name: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const VALID_USERS = [
  { email: 'ai@guschall.net', password: 'Pompernikel1401.', name: 'Admin', role: 'admin' as const },
  { email: 'konrad@guschall.net', password: 'Pompernikel1401.', name: 'Konrad', role: 'user' as const },
  { email: 'krzysztof@guschall.net', password: 'Pompernikel1401.', name: 'Krzysztof', role: 'user' as const },
  { email: 'juri@guschall.net', password: 'Pompernikel1401.', name: 'Juri', role: 'user' as const },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('guschall_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const foundUser = VALID_USERS.find(u => u.email === email && u.password === password);
    if (foundUser) {
      const userData = { email: foundUser.email, name: foundUser.name, role: foundUser.role };
      setUser(userData);
      localStorage.setItem('guschall_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('guschall_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
