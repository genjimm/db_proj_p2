import './App.css';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProtectRoute from './components/ProtectRoute';
import NavBar from './components/NavBar';
import BookPage from './pages/BookPage';
import AuthorPage from './pages/AuthorPage';
import RentalPage from './pages/RentalPage';

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
            <ProtectRoute>
              <AuthorPage />
            </ProtectRoute>
          }
        />
        
        <Route
          path="/rentals"
          element={
            <ProtectRoute>
              <RentalPage />
            </ProtectRoute>
          }
        />
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <Main />
    </BrowserRouter>
  );
}
