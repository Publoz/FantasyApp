import React, { createContext, useContext, useState, useEffect } from 'react';
import hasAuth from '../utils/useAuthentication';
import AuthStack from './authStack';
import MenuStack from './menuStack';

// Create a context for authentication
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(hasAuth());

  useEffect(() => {
    // Here you can add logic to listen for authentication changes
    // For example, you can use an event listener or a subscription to an auth service
    const checkAuth = () => {
      setIsAuthenticated(hasAuth());
    };

    // Example: Check authentication status on mount
    checkAuth();

    // Cleanup function if needed
    return () => {
      // Remove event listeners or subscriptions here
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default function RootNavigation() {
  const { isAuthenticated } = useAuth();
  console.log("User is logged in? " + isAuthenticated);
  return isAuthenticated ? <MenuStack /> : <AuthStack />;
}