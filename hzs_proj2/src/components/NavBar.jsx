// src/components/NavBar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/NavBar.css';
import { Link } from 'react-router-dom';
import { Nav } from 'react-bootstrap';

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
<<<<<<< Updated upstream
=======
        {role === 'admin' && (
          <>
            <NavLink to="/authors" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Authors
            </NavLink>
          </>
        )}
        <NavLink to="/rentals" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Rentals
        </NavLink>
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
        <NavLink to="/myinvoice" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          My Invoices
        </NavLink>
        {role === 'admin' && (
          <Nav.Link as={Link} to="/admin">
            Admin Panel
          </Nav.Link>
        )}
        <button onClick={handleLogout} className="nav-link logout-button">
          Logout
        </button>
>>>>>>> Stashed changes
      </div>
    </nav>
  );
}