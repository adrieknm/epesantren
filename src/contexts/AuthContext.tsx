import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'admin' | 'pengelola';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for testing
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'admin@epesantren.com': {
    password: 'admin123',
    user: {
      id: '1',
      name: 'Administrator',
      email: 'admin@epesantren.com',
      role: 'admin',
      avatar: 'https://ui-avatars.com/api/?name=Administrator&background=059669&color=fff'
    }
  },
  'pengelola@epesantren.com': {
    password: 'pengelola123',
    user: {
      id: '2',
      name: 'Pengelola Kelas',
      email: 'pengelola@epesantren.com',
      role: 'pengelola',
      avatar: 'https://ui-avatars.com/api/?name=Pengelola&background=059669&color=fff'
    }
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check localStorage for existing session
    const savedUser = localStorage.getItem('epesantren_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const userCredentials = DEMO_USERS[email];
    
    if (userCredentials && userCredentials.password === password) {
      setUser(userCredentials.user);
      localStorage.setItem('epesantren_user', JSON.stringify(userCredentials.user));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('epesantren_user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
