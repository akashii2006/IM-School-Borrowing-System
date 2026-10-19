import { useEffect, useState } from 'react';
import API from '../api/axiosInstance';

const AdminDashboard = ({ user: propUser }) => {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const user = propUser || storedUser;

  const [allLogs, setAllLogs] = useState([]);
  const [equipmentCatalog, setEquipmentCatalog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // 1. Fetch All Borrow Logs
      try {
        const logsRes = await API.get('/borrow');
        const rawLogs = logsRes?.data?.data || logsRes?.data?.logs || logsRes?.data || [];
        setAllLogs(Array.isArray(rawLogs) ? rawLogs : []);
      } catch (err) {
        console.error('Error fetching admin borrow logs:', err);
      }

      // 2. Fetch Equipment Catalog
      try {
        const equipRes = await API.get('/equipment');
        const rawEquip = equipRes?.data?.data || equipRes?.data?.equipment || equipRes?.data || [];
        setEquipmentCatalog(Array.isArray(rawEquip) ? rawEquip : []);
      } catch (err) {
        console.error('Error fetching equipment catalog:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const isOverdue = (expectedDate, status) => {
    if (!expectedDate || (status !== 'Active' && status !== 'active')) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(expectedDate) < today;
  };

  // System Metrics
  const activeLoans = allLogs.filter((log) => (log.overall_status || log.status) === 'Active');
  const overdueLoans = activeLoans.filter((log) =>
    isOverdue(log.expected_return_date, log.overall_status || log.status)
  );
  const totalReturned = allLogs.filter((log) => (log.overall_status || log.status) === 'Returned').length;

  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      {/* Top Navigation Bar */}
      <nav className="navbar navbar-dark bg-dark px-4 shadow-sm">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold d-flex align-items-center">
            <i className="bi bi-shield-lock-fill fs-4 me-2 text-info"></i>
            <span>
              SCHOOL BORROW <small className="fs-6 text-white-50 ms-2">| Administrator Portal</small>
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
          style={{ background: 'linear-gradient(135deg, #0f4c5c 0%, #1f6f8b 100%)' }}
        >
          <div className="card-body p-4 d-flex justify-content-between align-items-center">
            <div>
              <span className="badge bg-light text-dark fw-bold mb-2 px-3 py-1">
                System Administrator
              </span>
              <h2 className="fw-bold mb-1">Welcome back, {user.name || user.full_name || 'admin'}!</h2>
              <p className="mb-0 opacity-75">
                Role: <span className="badge bg-light text-dark me-2">{user.role || 'Admin'}</span> • System Status:{' '}
                <span className="badge bg-success">Online</span>
              </p>
            </div>
            <div className="d-none d-md-block text-end">
              <i className="bi bi-shield-check display-3 opacity-25"></i>
            </div>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-3 border-start border-info border-5 p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted fw-normal mb-1">Total Inventory</h6>
                  <h2 className="fw-bold mb-0 text-info">{equipmentCatalog.length}</h2>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded-circle text-info">
                  <i className="bi bi-hdd-stack fs-3"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-3 border-start border-primary border-5 p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted fw-normal mb-1">Active Loans</h6>
                  <h2 className="fw-bold mb-0 text-primary">{activeLoans.length}</h2>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
                  <i className="bi bi-box-seam fs-3"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-3 border-start border-danger border-5 p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted fw-normal mb-1">Overdue Items</h6>
                  <h2 className="fw-bold mb-0 text-danger">{overdueLoans.length}</h2>
                </div>
                <div className="bg-danger bg-opacity-10 p-3 rounded-circle text-danger">
                  <i className="bi bi-exclamation-triangle fs-3"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-3 border-start border-success border-5 p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted fw-normal mb-1">Total Returned</h6>
                  <h2 className="fw-bold mb-0 text-success">{totalReturned}</h2>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success">
                  <i className="bi bi-check-circle fs-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active & Recent Loans Table */}
        <div className="card border-0 shadow-sm rounded-3 mb-4">
          <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0 text-dark">
              <i className="bi bi-journal-text me-2 text-primary"></i>All Active & Recent Loans
            </h5>
            <span className="badge bg-secondary">{allLogs.length} Total Logs</span>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Log ID</th>
                  <th>Equipment Name</th>
                  <th>Property No.</th>
                  <th>Borrower Name</th>
                  <th>Expected Return Date</th>
                  <th>Condition</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      <div className="spinner-border spinner-border-sm me-2 text-primary" role="status"></div>
                      Loading system logs...
                    </td>
                  </tr>
                ) : allLogs.length > 0 ? (
                  allLogs.map((log) => {
                    const logId = log.log_id || log.id;
                    const status = log.overall_status || log.status;
                    return (
                      <tr key={logId || Math.random()}>
                        <td className="fw-bold">#{logId}</td>
                        <td className="fw-semibold">{log.item_name || 'Unknown Equipment'}</td>
                        <td><code>{log.property_number || 'N/A'}</code></td>
                        <td>{log.full_name || log.id_number || 'Borrower'}</td>
                        <td>
                          {log.expected_return_date
                            ? new Date(log.expected_return_date).toLocaleDateString()
                            : 'N/A'}
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {log.item_condition_on_borrow || 'Good'}
                          </span>
                        </td>
                        <td>
                          {status === 'Active' ? (
                            isOverdue(log.expected_return_date, status) ? (
                              <span className="badge bg-danger">Overdue</span>
                            ) : (
                              <span className="badge bg-primary">Active Loan</span>
                            )
                          ) : (
                            <span className="badge bg-success">Returned</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      No system borrow logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Equipment Inventory Summary */}
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0 text-dark">
              <i className="bi bi-box-seam me-2 text-info"></i>System Equipment Overview
            </h5>
            <span className="badge bg-info text-dark">{equipmentCatalog.length} Items Listed</span>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Item ID</th>
                  <th>Equipment Name</th>
                  <th>Property No.</th>
                  <th>Category</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {equipmentCatalog.length > 0 ? (
                  equipmentCatalog.map((item) => (
                    <tr key={item.item_id || item.id || Math.random()}>
                      <td className="fw-bold">#{item.item_id || item.id}</td>
                      <td className="fw-semibold">{item.item_name}</td>
                      <td><code>{item.property_number}</code></td>
                      <td>{item.category || 'General'}</td>
                      <td>
                        <span
                          className={`badge ${
                            (item.status || 'Available') === 'Available'
                              ? 'bg-success'
                              : 'bg-warning text-dark'
                          }`}
                        >
                          {item.status || 'Available'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-3 text-muted">
                      No equipment items recorded in system inventory.
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

export default AdminDashboard;