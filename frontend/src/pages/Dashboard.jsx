import { useEffect, useState } from 'react';
import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading session data:', e);
    }
  }, []);

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <h4>Loading session...</h4>
        <p className="text-muted">If this screen persists, please log in again.</p>
        <a href="/login" className="btn btn-primary btn-sm">Go to Login</a>
      </div>
    );
  }

  const isBorrower =
    user.type === 'borrower' ||
    user.role === 'Student' ||
    user.role === 'Faculty';

  return isBorrower ? <StudentDashboard user={user} /> : <AdminDashboard user={user} />;
};

export default Dashboard;