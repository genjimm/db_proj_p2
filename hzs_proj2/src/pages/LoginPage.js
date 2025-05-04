import React from 'react';
import './LoginPage.css';
import { Link } from 'react-router-dom';
import { login } from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
const [username, setUsername] = React.useState('');
const [password, setPassword] = React.useState('');
const navigate = useNavigate();
const handleLogin = async () => {
  try {
    const data = await login(username, password);
    console.log('Login success:', data);
    navigate('/main');  // 登录成功后跳转
  } catch (err) {
    console.error('Login error:', err.message);
    alert(err.message.includes('<!DOCTYPE') 
    ? 'Server error. Please try again later.' 
    : 'Login failed: ' + err.message);
  }
};

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
        <h2 className="login-title">Login</h2>

        <div className="form-group">
          <label htmlFor="username">Your name</label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Enter your name"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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