import { Navigate } from "react-router-dom";
import React, { useContext } from 'react';
//import { useAuth } from "../hooks/useAuth";
import { GlobalContext } from './ContextApi/GlobalContext'; // Adjust the path as necessary

export default function AuthenticatedRoute({ children }){
    const { isAuthenticated } = useContext(GlobalContext);
  if (!isAuthenticated) {
    // user is not authenticated
    return <Navigate to="/login" />;
  }
  return children;
};