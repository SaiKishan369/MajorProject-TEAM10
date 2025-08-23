import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user data', e);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Replace with actual API call
    const mockUsers = [
      { id: '1', email: 'admin@example.com', name: 'Admin', isAdmin: true },
      { id: '2', email: 'user@example.com', name: 'User', isAdmin: false },
    ];

    const user = mockUsers.find(u => u.email === email);
    
    if (user && password === 'password') { // In a real app, never hardcode passwords
      const userData = { ...user, token: 'mock-jwt-token' };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    }
    
    return { success: false, message: 'Invalid email or password' };
  };

  const register = async (userData) => {
    // In a real app, this would make an API call to register the user
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      isAdmin: false,
    };
    
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
