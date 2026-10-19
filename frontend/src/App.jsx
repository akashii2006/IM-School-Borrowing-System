import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Equipment from './pages/Equipment';
import Borrowers from './pages/Borrowers';
import BorrowLogs from './pages/BorrowLogs';
import Maintenance from './pages/Maintenance';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes (Admin & Staff) */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/equipment" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
                <Equipment />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/borrow" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
                <BorrowLogs />
              </ProtectedRoute>
            } 
          />

          {/* Admin-Only Protected Routes */}
          <Route 
            path="/borrowers" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Borrowers />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/maintenance" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Maintenance />
              </ProtectedRoute>
            } 
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;