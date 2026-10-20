import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import StudentDashboard from './pages/StudentDashboard';
import RoomsOffices from './pages/RoomsOffices';
import PropertyAssignments from './pages/PropertyAssignments';
import BorrowLogs from './pages/BorrowLogs';

// Helper component for Admin-only access
const AdminRoute = ({ children, user }) => {
  const role = (user.role || user.type || '').toLowerCase();
  return role === 'admin' ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = (user.role || user.type || '').toLowerCase();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Unified Dashboard Entry Point */}
        <Route
          path="/dashboard"
          element={
            userRole === 'admin' ? (
              <AdminDashboard user={user} />
            ) : userRole === 'staff' ? (
              <StaffDashboard user={user} />
            ) : (
              <StudentDashboard user={user} />
            )
          }
        />

        {/* Explicit Role Dashboards */}
        <Route path="/admin-dashboard" element={<AdminRoute user={user}><AdminDashboard user={user} /></AdminRoute>} />
        <Route path="/staff-dashboard" element={<StaffDashboard user={user} />} />
        <Route path="/student-dashboard" element={<StudentDashboard user={user} />} />

        {/* Admin-Only Management Features */}
        <Route path="/rooms" element={<AdminRoute user={user}><RoomsOffices /></AdminRoute>} />
        <Route path="/property-assignments" element={<AdminRoute user={user}><PropertyAssignments /></AdminRoute>} />
        <Route path="/borrow-logs" element={<AdminRoute user={user}><BorrowLogs /></AdminRoute>} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;