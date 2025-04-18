import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  // If no user is logged in, redirect to the login page
  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;