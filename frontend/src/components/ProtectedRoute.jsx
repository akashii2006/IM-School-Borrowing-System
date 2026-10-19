import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  // If no user/token is saved in session, redirect to login
  if (!token && !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;