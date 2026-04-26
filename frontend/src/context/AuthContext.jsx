import React, { createContext, useState, useContext } from 'react';

// 1. Context Create karo
const AuthContext = createContext();

// 2. Custom Hook
export const useAuth = () => {
  return useContext(AuthContext);
};

// 3. Provider Component
export const AuthProvider = ({ children }) => {
  
  // 🟢 FIX 1: Synchronous Initialization (No Delay)
  // Page load hote hi bina kisi delay ke seedha storage se data uthayega
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      // Agar 'undefined' string save ho gaya galti se, toh crash nahi hoga
      return storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  // 🟢 Login Function
  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);
  };

  // 🔴 Logout Function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // 🔵 Update User Function (Upgraded to merge data safely)
  const updateUser = (newUserData) => {
    setUser((prevUser) => {
      // Purane data aur naye data ko mix kar dega, taaki koi field delete na ho
      const updatedUser = { ...prevUser, ...newUserData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const value = {
    user,
    token,
    login,
    logout,
    updateUser,
    isAuthenticated: !!token // Agar token hai matlab user login hai
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Ab loading lagane ki zarurat nahi kyunki data instant load ho raha hai */}
      {children}
    </AuthContext.Provider>
  );
};