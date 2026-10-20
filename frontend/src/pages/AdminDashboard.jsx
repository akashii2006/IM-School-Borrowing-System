import { useEffect, useState } from 'react';
import API from '../api/axiosInstance';

const AdminDashboard = ({ user: propUser }) => {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const user = propUser || storedUser;

  const [allLogs, setAllLogs] = useState([]);
  const [itemsCatalog, setItemsCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Borrow Logs
      try {
        const logsRes = await API.get('/borrow');
        const rawLogs = logsRes?.data?.data || logsRes?.data?.logs || logsRes?.data || [];
        setAllLogs(Array.isArray(rawLogs) ? rawLogs : []);
      } catch (err) {
        console.error('Error fetching admin borrow logs:', err);
      }

      // 2. Fetch Unified Items
      try {
        const itemsRes = await API.get('/items');
        const rawItems = itemsRes?.data?.data || itemsRes?.data || [];
        setItemsCatalog(Array.isArray(rawItems) ? rawItems : []);
      } catch (err) {
        console.error('Error fetching inventory items:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (logId) => {
    try {
      await API.put(`/borrow/approve/${logId}`);
      alert('Borrow request approved!');
      fetchAdminData();
    } catch (err) {
      alert('Approval failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (logId) => {
    if (!window.confirm('Are you sure you want to reject this request?')) return;
    try {
      await API.put(`/borrow/reject/${logId}`);
      alert('Borrow request rejected.');
      fetchAdminData();
    } catch (err) {
      alert('Rejection failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const isOverdue = (expectedDate, status) => {
    const s = (status || '').toLowerCase();
    if (!expectedDate || s !== 'active') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(expectedDate) < today;
  };

  const pendingRequests = allLogs.filter((log) => (log.overall_status || log.status || '').toLowerCase() === 'pending');
  const activeLoans = allLogs.filter((log) => (log.overall_status || log.status || '').toLowerCase() === 'active');
  const overdueLoans = activeLoans.filter((log) =>
    isOverdue(log.expected_return_date, log.overall_status || log.status)
  );
  const totalReturned = allLogs.filter((log) => {
    const s = (log.overall_status || log.status || '').toLowerCase();
    return s === 'returned' || s === 'completed';
  }).length;

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#f4f7f6' }}>
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

      <div className="d-flex flex-grow-1">
        {/* Left Sidebar Navigation */}
        <div
          className="p-3 text-white d-flex flex-column justify-content-between shadow-sm"
          style={{ width: '260px', minWidth: '260px', backgroundColor: '#0d233a' }}
        >
          <div>
            <div className="px-2 mb-4">
              <small className="text-uppercase text-white-50 fw-bold tracking-wider" style={{ fontSize: '0.7rem' }}>
                Navigation
              </small>
              <h6 className="fw-bold text-white mb-0 mt-1">ADMINISTRATOR</h6>
            </div>

            <div className="nav flex-column nav-pills gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`nav-link text-start rounded-3 d-flex align-items-center px-3 py-2 ${
                  activeTab === 'all' ? 'active bg-primary text-white fw-semibold' : 'text-white-50 hover-light'
                }`}
              >
                <i className="bi bi-speedometer2 me-3 fs-5"></i>
                Dashboard Overview
              </button>

              <button
                onClick={() => window.location.href = '/borrow-logs'}
                className="nav-link text-start rounded-3 d-flex align-items-center px-3 py-2 text-white-50 hover-light w-100 border-0 bg-transparent"
              >
                <i className="bi bi-journal-text me-3 fs-5"></i>
                Borrow Logs & Returns
                {pendingRequests.length > 0 && (
                  <span className="badge bg-warning text-dark ms-auto">{pendingRequests.length}</span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className={`nav-link text-start rounded-3 d-flex align-items-center px-3 py-2 ${
                  activeTab === 'inventory' ? 'active bg-primary text-white fw-semibold' : 'text-white-50 hover-light'
                }`}
              >
                <i className="bi bi-box-seam me-3 fs-5"></i>
                Inventory Assets
                <span className="badge bg-secondary ms-auto">{itemsCatalog.length}</span>
              </button>

              <button
                onClick={() => window.location.href = '/rooms'}
                className="nav-link text-start rounded-3 d-flex align-items-center px-3 py-2 text-white-50 hover-light w-100 border-0 bg-transparent"
              >
                <i className="bi bi-building me-3 fs-5"></i>
                Rooms & Offices
              </button>

              <button
                onClick={() => window.location.href = '/property-assignments'}
                className="nav-link text-start rounded-3 d-flex align-items-center px-3 py-2 text-white-50 hover-light w-100 border-0 bg-transparent"
              >
                <i className="bi bi-person-workspace me-3 fs-5"></i>
                Property Assignments
              </button>
            </div>
          </div>

          <div className="p-3 rounded-3 mt-auto" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <div className="d-flex align-items-center">
              <i className="bi bi-person-badge-fill fs-2 text-info me-2"></i>
              <div className="text-truncate">
                <div className="fw-bold text-white text-truncate">{user.name || user.full_name || 'Admin User'}</div>
                <small className="text-white-50 d-block text-truncate">
                  Role: {user.role || 'System Admin'}
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow-1 p-4" style={{ overflowY: 'auto' }}>
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
                <h2 className="fw-bold mb-1">Welcome back, {user.name || user.full_name || 'System Administrator'}!</h2>
                <p className="mb-0 opacity-75">
                  Role: <span className="badge bg-light text-dark me-2">{user.role || 'Admin'}</span> • System Status:{' '}
                  <span className="badge bg-success">Online</span>
                </p>
              </div>
            </div>
          </div>

          {/* Metrics Row */}
          {(activeTab === 'all' || activeTab === 'overview') && (
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <div className="card border-0 shadow-sm rounded-3 border-start border-warning border-5 p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted fw-normal mb-1">Pending Requests</h6>
                      <h2 className="fw-bold mb-0 text-warning">{pendingRequests.length}</h2>
                    </div>
                    <div className="bg-warning bg-opacity-10 p-3 rounded-circle text-warning">
                      <i className="bi bi-clock-history fs-3"></i>
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
          )}

          {/* Active & Recent Loans Table */}
          {(activeTab === 'all' || activeTab === 'loans') && (
            <div className="card border-0 shadow-sm rounded-3 mb-4">
              <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mb-0 text-dark">
                  <i className="bi bi-journal-text me-2 text-primary"></i>All Active & Pending Requests
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
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="8" className="text-center py-4 text-muted">
                          <div className="spinner-border spinner-border-sm me-2 text-primary" role="status"></div>
                          Loading system logs...
                        </td>
                      </tr>
                    ) : allLogs.length > 0 ? (
                      allLogs.map((log) => {
                        const logId = log.log_id || log.id;
                        const statusStr = (log.overall_status || log.status || 'Pending').toLowerCase();
                        const overdue = isOverdue(log.expected_return_date, log.overall_status || log.status);

                        return (
                          <tr key={logId || Math.random()}>
                            <td className="fw-bold">#{logId}</td>
                            <td className="fw-semibold">{log.item_name || log.name || 'Unknown Item'}</td>
                            <td><code>{log.item_code || log.property_number || 'N/A'}</code></td>
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
                              {statusStr === 'pending' ? (
                                <span className="badge bg-warning text-dark">Pending Request</span>
                              ) : statusStr === 'active' || statusStr === 'approved' ? (
                                overdue ? (
                                  <span className="badge bg-danger">Overdue</span>
                                ) : (
                                  <span className="badge bg-primary">Active Loan</span>
                                )
                              ) : statusStr === 'rejected' ? (
                                <span className="badge bg-secondary">Rejected</span>
                              ) : (
                                <span className="badge bg-success">Returned</span>
                              )}
                            </td>
                            <td className="text-end">
                              {statusStr === 'pending' && (
                                <div className="d-flex justify-content-end gap-1">
                                  <button
                                    className="btn btn-sm btn-success rounded-pill px-3"
                                    onClick={() => handleApprove(logId)}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger rounded-pill px-3"
                                    onClick={() => handleReject(logId)}
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center py-4 text-muted">
                          No system borrow logs found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* System Inventory Overview Table */}
          {(activeTab === 'all' || activeTab === 'inventory') && (
            <div className="card border-0 shadow-sm rounded-3">
              <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mb-0 text-dark">
                  <i className="bi bi-box-seam me-2 text-info"></i>System Inventory Overview
                </h5>
                <span className="badge bg-info text-dark">{itemsCatalog.length} Items Listed</span>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Item ID</th>
                      <th>Asset Name</th>
                      <th>Item Code / Property No.</th>
                      <th>Classification</th>
                      <th>Category</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsCatalog.length > 0 ? (
                      itemsCatalog.map((item) => (
                        <tr key={item.item_id || item.id || Math.random()}>
                          <td className="fw-bold">#{item.item_id || item.id}</td>
                          <td className="fw-semibold">{item.name || item.item_name}</td>
                          <td><code>{item.item_code || item.property_number}</code></td>
                          <td>
                            <span className={`badge ${item.type === 'equipment' ? 'bg-info text-dark' : 'bg-secondary'}`}>
                              {item.type || 'equipment'}
                            </span>
                          </td>
                          <td>{item.category_name || 'General'}</td>
                          <td>
                            <span
                              className={`badge ${
                                (item.status || 'available') === 'available'
                                  ? 'bg-success'
                                  : 'bg-primary'
                              }`}
                            >
                              {item.status || 'available'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-3 text-muted">
                          No inventory records found in database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;