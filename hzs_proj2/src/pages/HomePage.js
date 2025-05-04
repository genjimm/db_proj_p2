import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: 清除登录状态（token），然后跳转到登录页
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
        {/* 这里放你的业务板块，比如列表、简介、操作入口等 */}
        <p>This is the home page. Your content goes here.</p>
      </main>
    </div>
  );
}