import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  // If no user is logged in, redirect to the login page
  // The `replace` prop ensures that after logging in, the user cannot go back to the private route directly by using the back button.
  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;