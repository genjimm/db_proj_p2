// src/components/NavBar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/NavBar.css';

export default function NavBar() {
  const userFullName = localStorage.getItem('userFullName') || 'Guest';

  return (
    <nav className="navbar">
      <div className="navbar-left">
        Welcome, {userFullName}
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
      </div>
    </nav>
  );
}