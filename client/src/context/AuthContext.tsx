import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, refresh: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    if (storedUser && token) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Sync across tabs if needed, but initial state is already set
  }, []);

  const login = (token: string, refresh: string, userData: User) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refresh);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    // Redirect from login/signup to dashboard, or back to where they were going (like checkout)
    if (location.pathname === '/login' || location.pathname === '/signup') {
      navigate('/dashboard');
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
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
