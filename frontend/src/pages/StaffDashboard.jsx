import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axiosInstance';

const StaffDashboard = ({ user: propUser }) => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const user = propUser || storedUser;

  const [myLoans, setMyLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaffLoans();
  }, []);

  const fetchStaffLoans = async () => {
    try {
      setLoading(true);
      const res = await API.get('/borrow');
      const rawLogs = Array.isArray(res.data)
        ? res.data
        : res.data?.data || res.data?.logs || [];

      const staffId = user.id || user.borrower_id || user.id_number || user.user_id;
      
      const filtered = rawLogs.filter(
        (log) =>
          String(log.borrower_id) === String(staffId) ||
          String(log.id_number) === String(user.id_number || staffId)
      );

      setMyLoans(filtered);
    } catch (err) {
      console.error('Error fetching staff loans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isOverdue = (expectedDate, status) => {
    if (!expectedDate || (status !== 'Active' && status !== 'active')) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(expectedDate) < today;
  };

  const activeLoans = myLoans.filter((log) => (log.overall_status || log.status) === 'Active');
  const overdueLoans = activeLoans.filter((log) =>
    isOverdue(log.expected_return_date, log.overall_status || log.status)
  );

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#f4f7f6' }}>
      {/* Top Navbar */}
      <nav className="navbar navbar-dark bg-dark px-4 shadow-sm">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold d-flex align-items-center">
            <i className="bi bi-person-badge-fill fs-4 me-2 text-info"></i>
            <span>
              SCHOOL BORROW <small className="fs-6 text-white-50 ms-2">| Faculty & Staff Portal</small>
            </span>
          </span>
          <button onClick={handleLogout} className="btn btn-outline-light btn-sm rounded-pill px-3">
            <i className="bi bi-box-arrow-right me-1"></i> Sign Out
          </button>
        </div>
      </nav>

      <div className="container py-4">
        {/* Header Banner */}
        <div
          className="card border-0 shadow-sm mb-4 rounded-3 text-white"
          style={{ background: 'linear-gradient(135deg, #1d3557 0%, #457b9d 100%)' }}
        >
          <div className="card-body p-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <span className="badge bg-light text-dark fw-bold mb-2 px-3 py-1">Faculty Account</span>
              <h2 className="fw-bold mb-1">
                Welcome back, {user.name || user.full_name || 'Staff Member'}! (Faculty Portal)
              </h2>
              <p className="mb-0 opacity-75">
                Staff ID: <strong>{user.id_number || user.username || 'N/A'}</strong> • Role: Staff
              </p>
            </div>
            <div>
              <button
                className="btn btn-light btn-lg rounded-pill fw-bold shadow-sm px-4"
                onClick={() => navigate('/dashboard')}
              >
                <i className="bi bi-grid-3x3-gap-fill me-2 text-primary"></i> Browse Equipment Catalog
              </button>
            </div>
          </div>
        </div>

        {/* Overdue Items Alert Badge */}
        {overdueLoans.length > 0 && (
          <div className="alert alert-danger d-flex align-items-center rounded-3 shadow-sm mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill fs-3 me-3"></i>
            <div>
              <h6 className="fw-bold mb-1">Overdue Equipment Warning</h6>
              You have <strong>{overdueLoans.length}</strong> equipment item(s) past the return deadline. Please return them to the equipment custodian as soon as possible.
            </div>
          </div>
        )}

        {/* My Active Loans Table */}
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0 text-dark">
              <i className="bi bi-journal-bookmark me-2 text-primary"></i>My Active Loans
            </h5>
            <span className="badge bg-primary fs-6">{activeLoans.length} Items Currently Borrowed</span>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Log ID</th>
                  <th>Item Name</th>
                  <th>Property Code</th>
                  <th>Date Borrowed</th>
                  <th>Due Date</th>
                  <th>Location / Room</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      <div className="spinner-border spinner-border-sm me-2 text-primary" role="status"></div>
                      Loading loan records...
                    </td>
                  </tr>
                ) : activeLoans.length > 0 ? (
                  activeLoans.map((log) => {
                    const status = log.overall_status || log.status;
                    const overdue = isOverdue(log.expected_return_date, status);
                    return (
                      <tr key={log.log_id || Math.random()}>
                        <td className="fw-bold">#{log.log_id}</td>
                        <td className="fw-semibold text-dark">{log.item_name || log.name || 'Unknown Item'}</td>
                        <td><code>{log.property_number || log.item_code || 'N/A'}</code></td>
                        <td>{new Date(log.date_borrowed).toLocaleDateString()}</td>
                        <td className={overdue ? 'text-danger fw-bold' : ''}>
                          {log.expected_return_date ? new Date(log.expected_return_date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td>
                          {log.usage_room_name ? (
                            <span className="badge bg-light text-dark border">
                              {log.usage_room_name} ({log.usage_building || 'Main'})
                            </span>
                          ) : (
                            <span className="text-muted small">Unspecified</span>
                          )}
                        </td>
                        <td>
                          {overdue ? (
                            <span className="badge bg-danger">Overdue</span>
                          ) : (
                            <span className="badge bg-primary">Active Loan</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <i className="bi bi-check-circle display-4 d-block mb-2 text-success opacity-50"></i>
                      You have no active or overdue borrowed items.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;