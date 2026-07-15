import { createContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage.js';
import { login as apiLogin, setClientAuthToken } from '../api/client.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from storage on mount
  useEffect(() => {
    const savedToken = storage.getToken();
    const savedUser = storage.getUser();

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
      setClientAuthToken(savedToken);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await apiLogin(credentials);
      if (response && response.success && response.data) {
        const { token: receivedToken, user: receivedUser } = response.data;

        // Save to state
        setToken(receivedToken);
        setUser(receivedUser);

        // Save to storage
        storage.setToken(receivedToken);
        storage.setUser(receivedUser);

        // Sync token with API client
        setClientAuthToken(receivedToken);

        return receivedUser;
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      // Clear credentials just in case
      logout();
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    storage.clear();
    setClientAuthToken(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
