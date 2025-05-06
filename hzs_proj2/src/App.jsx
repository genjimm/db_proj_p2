import './App.css';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
// import RegisterPage from './pages/AuthorPage';
// import RegisterPage from './pages/RentalPage';
import HomePage from './pages/HomePage';
import ProtectRoute from './components/ProtectRoute';
import NavBar from '../src/components/NavBar';
import BookPage from './pages/BookPage';

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
              <BookPage />
            </ProtectRoute>
          }
        />
        {/* <Route
          path="/books"
          element={
            <ProtectedRoute>
              <BookPage />
            </ProtectedRoute>
          }
        /> */}
        {/* <Route
          path="/authors"
          element={
            <ProtectedRoute>
              <AuthorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rentals"
          element={
            <ProtectedRoute>
              <RentalPage />
            </ProtectedRoute>
          }
        /> */}
        <Route path="*" element={<Navigate to="/" replace />} />
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
