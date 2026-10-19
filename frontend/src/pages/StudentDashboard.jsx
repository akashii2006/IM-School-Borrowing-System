import { useEffect, useState } from 'react';
import API from '../api/axiosInstance';

const StudentDashboard = ({ user: propUser }) => {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const user = propUser || storedUser;

  const [myLogs, setMyLogs] = useState([]);
  const [equipmentCatalog, setEquipmentCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Borrow Logs and match user session
      try {
        const logsRes = await API.get('/borrow');
        const rawLogs = logsRes?.data?.data || logsRes?.data?.logs || logsRes?.data || [];
        const logsData = Array.isArray(rawLogs) ? rawLogs : [];

        const filtered = logsData.filter((log) => {
          const userIdent = String(
            user.id || user.borrower_id || user.username || user.id_number || ''
          ).toLowerCase();
          const userName = String(user.name || user.full_name || '').toLowerCase();

          return (
            String(log.borrower_id) === String(user.id) ||
            String(log.borrower_id) === String(user.borrower_id) ||
            (log.id_number && String(log.id_number).toLowerCase() === userIdent) ||
            (log.full_name && String(log.full_name).toLowerCase() === userName)
          );
        });

        setMyLogs(filtered);
      } catch (err) {
        console.error('Error fetching borrow logs:', err);
      }

      // 2. Fetch Equipment Catalog
      try {
        const equipRes = await API.get('/equipment');
        const rawEquip = equipRes?.data?.data || equipRes?.data?.equipment || equipRes?.data || [];
        const equipData = Array.isArray(rawEquip) ? rawEquip : [];
        setEquipmentCatalog(equipData);
      } catch (err) {
        console.error('Error fetching equipment catalog:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Direct Borrow Action
  const handleBorrowRequest = async (item) => {
    if (item.status !== 'Available') {
      alert('This item is currently unavailable.');
      return;
    }

    const confirmBorrow = window.confirm(`Request to borrow "${item.item_name}"?`);
    if (!confirmBorrow) return;

    const borrowerId = user.borrower_id || user.id || user.user_id;

    if (!borrowerId) {
      alert('Session expired or invalid user profile. Please log out and sign in again.');
      return;
    }

    try {
      setActionId(`borrow-${item.item_id || item.id}`);

      const returnDate = new Date();
      returnDate.setDate(returnDate.getDate() + 3);

      await API.post('/borrow', {
        borrower_id: borrowerId,
        item_id: item.item_id || item.id,
        expected_return_date: returnDate.toISOString().split('T')[0],
        item_condition_on_borrow: 'Good'
      });

      alert(`Successfully requested ${item.item_name}!`);
      await fetchDashboardData();
    } catch (err) {
      console.error('Borrow request failed:', err);
      const serverError = err.response?.data?.message || 'Failed to process borrow request.';
      alert(serverError);
    } finally {
      setActionId(null);
    }
  };

  // Direct Return Action
  const handleReturnItem = async (log) => {
    const confirmReturn = window.confirm(`Are you sure you want to return "${log.item_name}"?`);
    if (!confirmReturn) return;

    try {
      setActionId(`return-${log.log_id || log.id}`);

      await API.post('/borrow/return', {
        log_id: log.log_id || log.id,
        item_id: log.item_id || log.equipment_id
      });

      alert(`Successfully returned ${log.item_name}!`);
      await fetchDashboardData();
    } catch (err) {
      console.error('Return request failed:', err);
      const serverError = err.response?.data?.message || 'Failed to process item return.';
      alert(serverError);
    } finally {
      setActionId(null);
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

  // Metrics
  const activeLoans = myLogs.filter(
    (log) => (log.overall_status || log.status) === 'Active'
  );
  const overdueLoans = activeLoans.filter((log) =>
    isOverdue(log.expected_return_date, log.overall_status || log.status)
  );
  const returnedCount = myLogs.filter(
    (log) => (log.overall_status || log.status) === 'Returned'
  ).length;

  // Search filter
  const filteredEquipment = equipmentCatalog.filter((item) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;

    const name = String(item.item_name || '').toLowerCase();
    const cat = String(item.category || '').toLowerCase();
    const prop = String(item.property_number || '').toLowerCase();

    return name.includes(query) || cat.includes(query) || prop.includes(query);
  });

  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      {/* Top Navigation Bar */}
      <nav className="navbar navbar-dark bg-dark px-4 shadow-sm">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold d-flex align-items-center">
            <i className="bi bi-box-seam fs-4 me-2 text-info"></i>
            <span>
              SCHOOL BORROW <small className="fs-6 text-white-50 ms-2">| Borrower Portal</small>
            </span>
          </span>
          <button onClick={handleLogout} className="btn btn-outline-light btn-sm rounded-pill px-3">
            <i className="bi bi-box-arrow-right me-1"></i> Sign Out
          </button>
        </div>
      </nav>

      <div className="container py-4">
        {/* Welcome Header */}
        <div
          className="card border-0 shadow-sm mb-4 rounded-3 text-white"
          style={{ background: 'linear-gradient(135deg, #0f4c5c 0%, #1f6f8b 100%)' }}
        >
          <div className="card-body p-4 d-flex justify-content-between align-items-center">
            <div>
              <span className="badge bg-light text-dark fw-bold mb-2 px-3 py-1">
                {user.role || 'Student'} Account
              </span>
              <h2 className="fw-bold mb-1">Welcome back, {user.name || user.full_name || 'Borrower'}!</h2>
              <p className="mb-0 opacity-75">
                ID Number: <strong>{user.username || user.id_number || user.id || 'N/A'}</strong> • Status:{' '}
                <span className="badge bg-success">Active Borrower</span>
              </p>
            </div>
            <div className="d-none d-md-block text-end">
              <i className="bi bi-person-circle display-3 opacity-25"></i>
            </div>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-3 border-start border-primary border-5 p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted fw-normal mb-1">Active Borrows</h6>
                  <h2 className="fw-bold mb-0 text-primary">{activeLoans.length}</h2>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
                  <i className="bi bi-box-seam fs-3"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-3 border-start border-danger border-5 p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted fw-normal mb-1">Overdue Returns</h6>
                  <h2 className="fw-bold mb-0 text-danger">{overdueLoans.length}</h2>
                </div>
                <div className="bg-danger bg-opacity-10 p-3 rounded-circle text-danger">
                  <i className="bi bi-exclamation-triangle fs-3"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-3 border-start border-success border-5 p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted fw-normal mb-1">Total Returned</h6>
                  <h2 className="fw-bold mb-0 text-success">{returnedCount}</h2>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success">
                  <i className="bi bi-check-circle fs-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* My Borrowing History Table */}
        <div className="card border-0 shadow-sm rounded-3 mb-4">
          <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0 text-dark">
              <i className="bi bi-clock-history me-2 text-primary"></i>My Borrowing History
            </h5>
            <span className="badge bg-secondary">{myLogs.length} Records</span>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Log ID</th>
                  <th>Equipment Item</th>
                  <th>Property No.</th>
                  <th>Expected Return Date</th>
                  <th>Status</th>
                  <th className="text-end px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      <div className="spinner-border spinner-border-sm me-2 text-primary" role="status"></div>
                      Loading transaction records...
                    </td>
                  </tr>
                ) : myLogs.length > 0 ? (
                  myLogs.map((log) => {
                    const logId = log.log_id || log.id;
                    const status = log.overall_status || log.status;
                    return (
                      <tr key={logId || Math.random()}>
                        <td className="fw-bold">#{logId}</td>
                        <td className="fw-semibold">{log.item_name}</td>
                        <td><code>{log.property_number}</code></td>
                        <td>
                          {log.expected_return_date
                            ? new Date(log.expected_return_date).toLocaleDateString()
                            : 'N/A'}
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
                        <td className="text-end px-4">
                          {status === 'Active' ? (
                            <button
                              onClick={() => handleReturnItem(log)}
                              disabled={actionId === `return-${logId}`}
                              className="btn btn-outline-success btn-sm rounded-pill px-3"
                            >
                              {actionId === `return-${logId}` ? 'Returning...' : 'Return Item'}
                            </button>
                          ) : (
                            <span className="text-muted small">Completed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      <i className="bi bi-inbox fs-3 d-block mb-2 opacity-50"></i>
                      No borrowing history found. Request an item from the catalog below.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Equipment Catalog */}
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h5 className="fw-bold mb-0 text-dark">
              <i className="bi bi-grid-3x3-gap me-2 text-primary"></i>Available School Equipment
            </h5>
            <div style={{ maxWidth: '300px', width: '100%' }}>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search equipment or property no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="card-body">
            <div className="row g-3">
              {filteredEquipment.length > 0 ? (
                filteredEquipment.map((item) => {
                  const itemId = item.item_id || item.id;
                  return (
                    <div className="col-md-4 col-lg-3" key={itemId || Math.random()}>
                      <div className="card h-100 border shadow-sm rounded-3">
                        <div className="card-body d-flex flex-column justify-content-between">
                          <div>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <span
                                className={`badge ${
                                  item.status === 'Available'
                                    ? 'bg-success'
                                    : item.status === 'Borrowed'
                                    ? 'bg-warning text-dark'
                                    : 'bg-secondary'
                                }`}
                              >
                                {item.status || 'Available'}
                              </span>
                              <small className="text-muted fs-7">
                                <code>{item.property_number}</code>
                              </small>
                            </div>
                            <h6 className="fw-bold mb-1 text-dark">{item.item_name}</h6>
                            <small className="text-muted d-block mb-3">
                              {item.category || 'General'} • {item.brand || 'Standard'}
                            </small>
                          </div>

                          {item.status === 'Available' ? (
                            <button
                              onClick={() => handleBorrowRequest(item)}
                              disabled={actionId === `borrow-${itemId}`}
                              className="btn btn-outline-primary btn-sm w-100 rounded-pill mt-2"
                            >
                              {actionId === `borrow-${itemId}` ? (
                                <span>
                                  <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                  Requesting...
                                </span>
                              ) : (
                                <span>
                                  <i className="bi bi-hand-index-thumb me-1"></i> Request Borrow
                                </span>
                              )}
                            </button>
                          ) : (
                            <button className="btn btn-light btn-sm w-100 rounded-pill text-muted mt-2" disabled>
                              Unavailable
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-12 text-center text-muted py-4">
                  No matching equipment found in inventory.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;