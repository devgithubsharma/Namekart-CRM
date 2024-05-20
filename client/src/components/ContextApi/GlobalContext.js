import React, { createContext, useEffect, useState } from 'react';
export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );

  const loginAuth = () => {
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };

  return (
    <GlobalContext.Provider value={{ isAuthenticated, loginAuth, logout }}>
      {children}
    </GlobalContext.Provider>
  );
};
