import React from 'react';
import { Link } from 'react-router-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/LoginAndRegister.css';
import { login } from '../utils/api';

export default function LoginPage() {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const location = useLocation();
  const from = location.state?.from?.pathname || '/books';
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const data = await login(username, password);
      console.log('Login success:', data);
      
      // Store user's full name
      if (data.f_name && data.l_name) {
        localStorage.setItem('userFullName', `${data.f_name} ${data.l_name}`);
      }
      
      // Navigate to the intended destination or default to books page
      navigate(from);
    } catch (err) {
      console.error('Login error:', err);
      alert(err.message);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
        <h2 className="login-title">Login</h2>

        <div className="form-group">
          <label htmlFor="username">Email</label>
          <input
            id="username"
            name="username"
            type="email"
            placeholder="Enter your email"
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
          Don't have account?{' '}
          <span className="register-link"><Link to="/register" className="register-link">
            <strong>Register</strong>
          </Link></span>
        </p>
      </form>
    </div>
  );
}