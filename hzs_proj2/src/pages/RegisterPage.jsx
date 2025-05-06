import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/LoginAndRegister.css';
import { register } from '../utils/api';

const allowedIdTypes = ['Passport', 'SSN', 'DriverLicense'];
const emailRegex    = /@/;
const nameRegex     = /^[^\d]+$/;  // 不含数字
const phoneRegex    = /^\+?\d{7,15}$/; //7到15

export default function RegisterPage() {
  const [lName, setLName] = useState('');
  const [fName, setFName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [idType, setIdType] = useState(allowedIdTypes[0]);
  const [idNum, setIdNum] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!nameRegex.test(lName) || !nameRegex.test(fName)) {
      alert('姓和名不能包含数字');
      return;
    }
    if (!emailRegex.test(email)) {
      alert('邮箱格式不正确');
      return;
    }
    if (!phoneRegex.test(phone)) {
      alert('手机号格式不正确');
      return;
    }
    try {
        await register({
          l_name: lName,
          f_name: fName,
          phone,
          email,
          id_type: idType,
          id_num: idNum,
          password
        });
        alert('注册成功，请登录');
        navigate('/login');
    } catch (err) {
      console.error('Register error:', err);
      alert('注册失败：' + err.message);
    }
  };
  
  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleRegister}>
        <h2 className="login-title">Register</h2>
        <div className="form-group">
          <label>Last Name</label>
          <input
            type="text" value={lName}
            onChange={e => setLName(e.target.value)} required
          />
        </div>
        <div className="form-group">
          <label>First Name</label>
          <input
            type="text" value={fName}
            onChange={e => setFName(e.target.value)} required
          />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel" value={phone}
            onChange={e => setPhone(e.target.value)} required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email" value={email}
            onChange={e => setEmail(e.target.value)} required
          />
        </div>
        <div className="form-group">
          <label>ID Type</label>
          <select value={idType} onChange={e => setIdType(e.target.value)}>
            {allowedIdTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>ID Number</label>
          <input
            type="text" value={idNum}
            onChange={e => setIdNum(e.target.value)} required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password" value={password}
            onChange={e => setPassword(e.target.value)} required
          />
        </div>
        <button type="submit" className="login-button">
          Register
        </button>
      
        <p className="login-footer">
          Already have account?{' '}
          <span className="register-link"><Link to="/login" className="register-link">
            <strong>Login</strong>
          </Link></span>
        </p>
      </form>
    </div>
  );
}