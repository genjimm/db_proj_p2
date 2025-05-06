// src/components/NavBar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/NavBar.css';

export default function NavBar() {
  const username = localStorage.getItem('username') || 'Guest';

  return (
    <nav className="navbar">
      <div className="navbar-left">
        Welcome, {username}
      </div>
      <div className="navbar-spacer" />
      <div className="navbar-links">
        <NavLink to="/books" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Book
        </NavLink>
        <NavLink to="/authors" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Author
        </NavLink>
        <NavLink to="/rentals" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Rental
        </NavLink>
      </div>
    </nav>
  );
}