import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HeaderSection from './components/HeaderSection';
import ResetPassword from './components/auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import VerifyEmail from './components/auth/VerifyEmail';
import ForgotPassword from './components/auth/ForgotPassword';
import PrivateRoute from './components/PrivateRoute'; // Import the PrivateRoute component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HeaderSection />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
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