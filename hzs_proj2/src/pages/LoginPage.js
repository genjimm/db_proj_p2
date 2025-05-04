import React from 'react';
import './LoginPage.css';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  return (
    <div className="login-container">
      <form className="login-form">
        <h2 className="login-title">Login</h2>

        <div className="form-group">
          <label htmlFor="username">Your name</label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Enter your name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            required
          />
        </div>

        <button type="submit" className="login-button">
          Login
        </button>

        <p className="login-footer">
          Don’t have account?{' '}
          <span className="register-link"><Link to="/register" className="register-link">
  <strong>Register</strong>
</Link></span>
        </p>
      </form>
    </div>
  );
}