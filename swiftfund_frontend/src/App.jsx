import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HeaderSection from './components/HeaderSection';
import ResetPassword from './components/auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile'; 
import Settings from './pages/settings';
import DefaultDashboardContent from './pages/DefaultDashboardContent'; // Import Default Dashboard Content
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import VerifyEmail from './components/auth/VerifyEmail';
import ForgotPassword from './components/auth/ForgotPassword';
import PrivateRoute from './components/PrivateRoute'; // Import PrivateRoute

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HeaderSection />} />
        {/* Dashboard Routes with Nested Routing */}
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          {/* Child Routes of Dashboard */}
          <Route index element={<DefaultDashboardContent />} /> {/* Default Content */}
          <Route path="profile" element={<Profile />} /> {/* Profile Page */}
          <Route path="settings" element={<Settings />} /> {/* Settings Page */}
        </Route>

        {/* Auth Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </Router>
  );
}

export default App;