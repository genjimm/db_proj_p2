import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function RoleBasedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/home" replace />;
  }

  return children;
} 