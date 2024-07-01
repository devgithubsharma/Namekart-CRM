import React, { createContext, useEffect, useState } from 'react';
export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );

  const [userId, setUserId] = useState(localStorage.getItem('userId'));

  const loginAuth = (id) => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userId', id);
    setIsAuthenticated(true);
    setUserId(id);
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userId'); 
    setIsAuthenticated(false);
    setUserId(null);
  };

  return (
    <GlobalContext.Provider value={{ isAuthenticated, userId, loginAuth, logout }}>
      {children}
    </GlobalContext.Provider>
  );
};
