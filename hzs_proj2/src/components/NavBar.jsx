// src/components/NavBar.jsx
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/NavBar.css';
import { Link } from 'react-router-dom';
import { Nav } from 'react-bootstrap';

export default function NavBar() {
  const [userFullName, setUserFullName] = useState('Guest');
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Get user info from localStorage
    const name = localStorage.getItem('userFullName');
    const userRole = localStorage.getItem('role');
    
    if (name) {
      setUserFullName(name);
    }
    if (userRole) {
      setRole(userRole);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userFullName');
    setUserFullName('Guest');
    setRole('');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        Welcome, {userFullName} {role && `(${role})`}
      </div>
      <div className="navbar-spacer" />
      <div className="navbar-links">
        <NavLink to="/books" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Books
        </NavLink>
        {role === 'admin' && (
          <>
            <NavLink to="/authors" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Authors
            </NavLink>
            <NavLink to="/rentals" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Rentals
            </NavLink>
          </>
        )}
        <NavLink to="/exhibitions" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Exhibitions
        </NavLink>
        <NavLink to="/seminars" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Seminars
        </NavLink>
        <NavLink to="/my-registrations" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          My Registrations
        </NavLink>
        <NavLink to="/my-invitations" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          My Invitations
        </NavLink>
        <NavLink to="/myinvoice" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          My Invoices
        </NavLink>
        <NavLink to="/study-room" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Study Room
        </NavLink>
        {role === 'admin' && (
          <Nav.Link as={Link} to="/admin">Admin Panel</Nav.Link>
        )}
        <button onClick={handleLogout} className="nav-link logout-button">
          Logout
        </button>
      </div>
    </nav>
  );
}