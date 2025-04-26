import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Docs from './pages/Docs';
import HeaderSection from './pages/HeaderSection';
import ResetPassword from './components/auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/settings';
import DefaultDashboardContent from './pages/DefaultDashboardContent';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import VerifyEmail from './components/auth/VerifyEmail';
import ForgotPassword from './components/auth/ForgotPassword';
import PrivateRoute from './components/PrivateRoute';
import About from './pages/About';
import Contact from './pages/Contact';

const Layout = () => {
  const location = useLocation();
  const showNavbarFooter = ["/", "/about", "/contact"].includes(location.pathname);

  return (
    <>
      {showNavbarFooter && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HeaderSection />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/docs" element={<Docs />} />

        {/* Auth Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Dashboard with nested routes */}
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          <Route index element={<DefaultDashboardContent />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>

      {showNavbarFooter && <Footer />}
    </>
  );
};

function App() {
  return <Layout />;
}

export default App;
