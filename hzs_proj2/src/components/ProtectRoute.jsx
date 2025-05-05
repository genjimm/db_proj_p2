import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * 如果没有检测到token，就导航到loginpage
 */
export default function ProtectRoute({ children }) {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    // 记录当前，并且回到loginpage
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}