import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Simple check for access token in localStorage for routing gate simulation
  const isAuthenticated = localStorage.getItem("insightflow_auth_token") !== null;

  // For starter dev purposes, if token is not set, we can auto-set one or redirect.
  // Let's default to allowing access if in local development mode, otherwise redirect to login.
  const isDev = import.meta.env.DEV;
  
  if (!isAuthenticated && !isDev) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
