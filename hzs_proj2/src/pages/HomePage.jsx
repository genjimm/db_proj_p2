import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 清除本地的token 重定向login
    localStorage.removeItem('token');
    localStorage.clear();

    navigate('/login');
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Welcome to Your Dashboard</h1>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </header>
      <main className="home-main">
        {/* 内容*/}
        <p>请付费阅览ovo</p>
      </main>
    </div>
  );
}