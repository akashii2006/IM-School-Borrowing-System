import { useEffect, useState } from 'react';
import API from '../api/axiosInstance';

const StudentDashboard = ({ user: propUser }) => {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const user = propUser || storedUser;

  const [equipmentList, setEquipmentList] = useState([]);
  const [roomsList, setRoomsList] = useState([]);
  const [myLogs, setMyLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [usageRoomId, setUsageRoomId] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [activeTab, setActiveTab] = useState('catalog');
  const [loading, setLoading] = useState(true);

  // Date constraints for strict school policy
  const todayStr = new Date().toISOString().split('T')[0];
  const maxDateObj = new Date();
  maxDateObj.setDate(new Date().getDate() + 7);
  const maxDateStr = maxDateObj.toISOString().split('T')[0];

  const userRole = (user.role || user.type || '').toLowerCase();

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Equipment Items
      try {
        const itemsRes = await API.get('/items');
        const rawItems = Array.isArray(itemsRes.data)
          ? itemsRes.data
          : itemsRes.data?.data || itemsRes.data?.items || [];
        setEquipmentList(rawItems);
      } catch (err) {
        console.error('Error fetching equipment items:', err);
      }

      // 2. Fetch Rooms & Offices Directory
      try {
        const roomsRes = await API.get('/rooms');
        setRoomsList(Array.isArray(roomsRes.data) ? roomsRes.data : []);
      } catch (err) {
        console.error('Error fetching rooms:', err);
      }

      // 3. Fetch Borrower History
      try {
        const logsRes = await API.get('/borrow');
        const rawLogs = Array.isArray(logsRes.data)
          ? logsRes.data
          : logsRes.data?.data || logsRes.data?.logs || [];

        const studentId = user.id || user.borrower_id || user.id_number || user.user_id || '123';
        const filtered = rawLogs.filter(
          (log) =>
            String(log.borrower_id) === String(studentId) ||
            String(log.id_number) === String(user.id_number || studentId)
        );
        setMyLogs(filtered);
      } catch (err) {
        console.error('Error fetching borrower history:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBorrowSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem || !usageRoomId || !expectedReturnDate) {
      alert('Please select both a usage location and an expected return date.');
      return;
    }

    try {
      const res = await API.post('/borrow', {
        borrower_id: user.id || user.borrower_id || user.user_id || user.id_number || 123,
        item_id: selectedItem.item_id || selectedItem.id,
        usage_room_id: usageRoomId,
        expected_return_date: expectedReturnDate,
        item_condition_on_borrow: 'Good',
        role: userRole
      });

      alert(res.data?.message || `Borrow request for "${selectedItem.name}" submitted successfully!`);
      setSelectedItem(null);
      setUsageRoomId('');
      setExpectedReturnDate('');
      fetchStudentData();
    } catch (err) {
      alert('Borrow request failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const filteredEquipment = equipmentList.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      (item.name || '').toLowerCase().includes(term) ||
      (item.item_code || item.property_number || '').toLowerCase().includes(term)
    );
  });

  const activeLoansCount = myLogs.filter((log) => (log.overall_status || log.status) === 'Active').length;

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#f4f7f6' }}>
      {/* Top Navbar */}
      <nav className="navbar navbar-dark bg-dark px-4 shadow-sm">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold d-flex align-items-center">
            <i className="bi bi-box-seam-fill fs-4 me-2 text-info"></i>
            <span>
              SCHOOL BORROW <small className="fs-6 text-white-50 ms-2">| Borrower Portal</small>
            </span>
          </span>
          <button onClick={handleLogout} className="btn btn-outline-light btn-sm rounded-pill px-3">
            <i className="bi bi-box-arrow-right me-1"></i> Sign Out
          </button>
        </div>
      </nav>

      <div className="d-flex flex-grow-1">
        {/* Sidebar */}
        <div
          className="p-3 text-white d-flex flex-column justify-content-between shadow-sm"
          style={{ width: '260px', minWidth: '260px', backgroundColor: '#0d233a' }}
        >
          <div>
            <div className="px-2 mb-4">
              <small className="text-uppercase text-white-50 fw-bold tracking-wider" style={{ fontSize: '0.7rem' }}>
                Navigation
              </small>
              <h6 className="fw-bold text-white mb-0 mt-1">BORROWER PORTAL</h6>
            </div>

            <div className="nav flex-column nav-pills gap-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`nav-link text-start rounded-3 d-flex align-items-center px-3 py-2 ${
                  activeTab === 'overview' ? 'active bg-primary text-white fw-semibold' : 'text-white-50 hover-light'
                }`}
              >
                <i className="bi bi-speedometer2 me-3 fs-5"></i> Dashboard Overview
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`nav-link text-start rounded-3 d-flex align-items-center px-3 py-2 ${
                  activeTab === 'history' ? 'active bg-primary text-white fw-semibold' : 'text-white-50 hover-light'
                }`}
              >
                <i className="bi bi-clock-history me-3 fs-5"></i> My History
                {activeLoansCount > 0 && <span className="badge bg-info text-dark ms-auto">{activeLoansCount}</span>}
              </button>

              <button
                onClick={() => setActiveTab('catalog')}
                className={`nav-link text-start rounded-3 d-flex align-items-center px-3 py-2 ${
                  activeTab === 'catalog' ? 'active bg-primary text-white fw-semibold' : 'text-white-50 hover-light'
                }`}
              >
                <i className="bi bi-grid-3x3-gap-fill me-3 fs-5"></i> Equipment Catalog
                <span className="badge bg-secondary ms-auto">{equipmentList.length}</span>
              </button>
            </div>
          </div>

          <div className="p-3 rounded-3 mt-auto" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <div className="d-flex align-items-center">
              <i className="bi bi-person-circle fs-2 text-info me-2"></i>
              <div className="text-truncate">
                <div className="fw-bold text-white text-truncate">{user.name || user.full_name || 'Student Borrower'}</div>
                <small className="text-white-50 d-block text-truncate">
                  ID: {user.id_number || user.username || user.id || '123'}
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow-1 p-4" style={{ overflowY: 'auto' }}>
          {/* Welcome Banner */}
          <div
            className="card border-0 shadow-sm mb-4 rounded-3 text-white"
            style={{ background: 'linear-gradient(135deg, #0f4c5c 0%, #1f6f8b 100%)' }}
          >
            <div className="card-body p-4 d-flex justify-content-between align-items-center">
              <div>
                <span className="badge bg-light text-dark fw-bold mb-2 px-3 py-1">
                  {user.role || 'Student Account'}
                </span>
                <h2 className="fw-bold mb-1">Welcome back, {user.name || user.full_name || 'Student Borrower'}!</h2>
                <p className="mb-0 opacity-75">
                  ID Number: <strong>{user.id_number || user.username || '123'}</strong> • Status:{' '}
                  <span className="badge bg-success">Active Borrower</span>
                </p>
              </div>
            </div>
          </div>

          {/* Catalog Tab */}
          {(activeTab === 'catalog' || activeTab === 'overview') && (
            <div className="card border-0 shadow-sm rounded-3 mb-4">
              <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
                <h5 className="fw-bold mb-0 text-dark">
                  <i className="bi bi-grid-3x3-gap me-2 text-primary"></i>Available School Equipment
                </h5>
                <div style={{ maxWidth: '300px', width: '100%' }}>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search equipment or property no..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="card-body p-4">
                {loading ? (
                  <div className="text-center py-5 text-muted">
                    <div className="spinner-border text-primary me-2" role="status"></div>
                    Loading equipment catalog...
                  </div>
                ) : filteredEquipment.length > 0 ? (
                  <div className="row g-3">
                    {filteredEquipment.map((item) => {
                      const status = String(item.status || 'available').toLowerCase();

                      const renderActionButton = () => {
                        if (status === 'available') {
                          return (
                            <button
                              className="btn btn-sm btn-success w-100 rounded-pill fw-semibold shadow-sm"
                              onClick={() => setSelectedItem(item)}
                            >
                              <i className="bi bi-handbag me-1"></i> Request to Borrow
                            </button>
                          );
                        } else if (status === 'borrowed') {
                          return (
                            <button className="btn btn-sm btn-secondary text-white w-100 rounded-pill" disabled>
                              <i className="bi bi-clock-history me-1"></i> Currently Borrowed
                            </button>
                          );
                        } else if (status === 'assigned') {
                          return (
                            <button className="btn btn-sm btn-info text-white w-100 rounded-pill" disabled>
                              <i className="bi bi-building-lock me-1"></i> Assigned to Room
                            </button>
                          );
                        } else {
                          return (
                            <button className="btn btn-sm btn-secondary w-100 rounded-pill" disabled>
                              Unavailable
                            </button>
                          );
                        }
                      };

                      return (
                        <div className="col-md-4" key={item.item_id || item.id}>
                          <div className="card h-100 border-0 shadow-sm rounded-3 p-3">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <span className={`badge ${item.type === 'property' ? 'bg-secondary' : 'bg-info text-dark'}`}>
                                {item.type || 'Equipment'}
                              </span>
                              <span
                                className={`badge ${
                                  status === 'available'
                                    ? 'bg-success'
                                    : status === 'borrowed'
                                    ? 'bg-warning text-dark'
                                    : 'bg-primary'
                                }`}
                              >
                                {item.status || 'available'}
                              </span>
                            </div>
                            <h6 className="fw-bold text-dark mb-1">{item.name}</h6>
                            <small className="text-muted mb-2 d-block">
                              Property Code: <code>{item.item_code || 'N/A'}</code>
                            </small>
                            <p className="text-secondary small flex-grow-1 mb-3">
                              {item.description || 'Standard school asset item.'}
                            </p>

                            {/* Action Button */}
                            {renderActionButton()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-inbox display-4 d-block mb-2 text-secondary opacity-50"></i>
                    No available equipment found in inventory.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* History Tab */}
          {(activeTab === 'history' || activeTab === 'overview') && (
            <div className="card border-0 shadow-sm rounded-3">
              <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mb-0 text-dark">
                  <i className="bi bi-clock-history me-2 text-primary"></i>My Borrow Transaction History
                </h5>
                <span className="badge bg-secondary">{myLogs.length} Records</span>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Log ID</th>
                      <th>Equipment Name</th>
                      <th>Usage Location</th>
                      <th>Date Borrowed</th>
                      <th>Expected Return</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myLogs.length > 0 ? (
                      myLogs.map((log) => (
                        <tr key={log.log_id || Math.random()}>
                          <td className="fw-bold">#{log.log_id}</td>
                          <td className="fw-semibold">{log.item_name || log.name}</td>
                          <td>
                            {log.usage_room_name ? (
                              <span className="badge bg-light text-dark border">
                                {log.usage_room_name} ({log.usage_building || 'Main'})
                              </span>
                            ) : (
                              <span className="text-muted small">Unspecified</span>
                            )}
                          </td>
                          <td>{new Date(log.date_borrowed).toLocaleDateString()}</td>
                          <td>{log.expected_return_date ? new Date(log.expected_return_date).toLocaleDateString() : 'N/A'}</td>
                          <td>
                            <span className={`badge ${(log.overall_status || log.status) === 'Active' ? 'bg-primary' : 'bg-success'}`}>
                              {log.overall_status || log.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-muted">
                          You have no past or active borrow transactions.
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

      {/* Updated Inline Borrow Request Modal */}
      {selectedItem && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-3 border-0 shadow-lg">
              <form onSubmit={handleBorrowSubmit}>
                <div className="modal-header bg-dark text-white">
                  <h5 className="modal-title fw-bold">
                    <i className="bi bi-box-seam me-2 text-info"></i>Request to Borrow Equipment
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedItem(null)}></button>
                </div>
                <div className="modal-body p-4">
                  {/* Selected Item (Read-Only) */}
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">Selected Item</label>
                    <input type="text" className="form-control bg-light" value={selectedItem.name} readOnly />
                  </div>

                  {/* Property Code (Read-Only) */}
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">Property Code</label>
                    <input type="text" className="form-control bg-light font-monospace" value={selectedItem.item_code || 'N/A'} readOnly />
                  </div>

                  {/* Mandatory Room Dropdown */}
                  <div className="mb-3">
                    <label className="form-label text-dark small fw-bold">
                      Where will you use this equipment? <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      required
                      value={usageRoomId}
                      onChange={(e) => setUsageRoomId(e.target.value)}
                    >
                      <option value="">-- Select Room / Office --</option>
                      {roomsList.map((room) => (
                        <option key={room.room_id} value={room.room_id}>
                          {room.room_name} ({room.building || 'Main Building'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Mandatory Expected Return Date with Min/Max Constraints */}
                  <div className="mb-3">
                    <label className="form-label text-dark small fw-bold">
                      Expected Return Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      required
                      min={todayStr}
                      max={maxDateStr}
                      value={expectedReturnDate}
                      onChange={(e) => setExpectedReturnDate(e.target.value)}
                    />
                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                      Maximum borrow duration is 7 days per school policy.
                    </small>
                  </div>
                </div>

                <div className="modal-footer d-flex flex-column align-items-stretch">
                  <div className="d-flex justify-content-end gap-2 w-100">
                    <button type="button" className="btn btn-light" onClick={() => setSelectedItem(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary px-4">
                      Submit Request
                    </button>
                  </div>

                  {/* Staff Note */}
                  {userRole === 'staff' && (
                    <small className="text-muted d-block text-center mt-2" style={{ fontSize: '0.8rem' }}>
                      <i className="bi bi-info-circle me-1 text-primary"></i>
                      Note: Faculty requests are automatically approved.
                    </small>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;