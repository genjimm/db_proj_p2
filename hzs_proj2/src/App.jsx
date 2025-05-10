import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProtectRoute from './components/ProtectRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import NavBar from './components/NavBar';
import BookPage from './pages/BookPage';
import AuthorPage from './pages/AuthorPage';
import RentalPage from './pages/RentalPage';
import Exhibitions from './pages/Exhibitions';
import ExhibitionDetail from './pages/ExhibitionDetail';
import Seminars from './pages/Seminars';
import SeminarDetail from './pages/SeminarDetail';
import MyRegistrations from './pages/MyRegistrations';
import MyInvitations from './pages/MyInvitations';

function Main() {
  const { pathname } = useLocation();
  // 定义哪些路由下不显示 NavBar
  const noNav = ['/', '/login', '/register'];
  const hideNav = noNav.includes(pathname);
  return (
    <>
      { !hideNav && <NavBar /> }
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route
          path="/home"
          element={
            <ProtectRoute>
              <HomePage />
            </ProtectRoute>
          }
        />
        
        <Route
          path="/books"
          element={
            <ProtectRoute>
              <BookPage />
            </ProtectRoute>
          }
        />
        
        <Route
          path="/authors"
          element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <AuthorPage />
            </RoleBasedRoute>
          }
        />
        
        <Route
          path="/rentals"
          element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <RentalPage />
            </RoleBasedRoute>
          }
        />
        
        <Route
          path="/exhibitions"
          element={
            <ProtectRoute>
              <Exhibitions />
            </ProtectRoute>
          }
        />
        
        <Route
          path="/exhibitions/:event_id"
          element={
            <ProtectRoute>
              <ExhibitionDetail />
            </ProtectRoute>
          }
        />
        
        <Route
          path="/seminars"
          element={
            <ProtectRoute>
              <Seminars />
            </ProtectRoute>
          }
        />
        
        <Route
          path="/seminars/:event_id"
          element={
            <ProtectRoute>
              <SeminarDetail />
            </ProtectRoute>
          }
        />
        
        <Route
          path="/my-registrations"
          element={
            <ProtectRoute>
              <MyRegistrations />
            </ProtectRoute>
          }
        />
        
        <Route
          path="/my-invitations"
          element={
            <ProtectRoute>
              <MyInvitations />
            </ProtectRoute>
          }
        />
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Main />
      </div>
    </Router>
  );
}

export default App;
