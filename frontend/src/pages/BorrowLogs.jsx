import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axiosInstance';

const BorrowLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [inspectingLog, setInspectingLog] = useState(null);

  const [returnForm, setReturnForm] = useState({
    return_condition: 'excellent',
    fine_amount: '0.00',
    remarks: ''
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await API.get('/borrow');
      const rawLogs = res?.data?.data || res?.data?.logs || res?.data || [];
      setLogs(Array.isArray(rawLogs) ? rawLogs : []);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInspectionModal = (log) => {
    setInspectingLog(log);
    setReturnForm({
      return_condition: 'excellent',
      fine_amount: '0.00',
      remarks: ''
    });
  };

  const handleConfirmReturn = async (e) => {
    e.preventDefault();
    if (!inspectingLog) return;

    const logId = inspectingLog.log_id || inspectingLog.request_id || inspectingLog.id;

    try {
      const res = await API.post(`/borrow/requests/${logId}/return`, returnForm);
      alert(res.data?.message || 'Item return processed successfully!');
      setInspectingLog(null);
      fetchLogs();
    } catch (err) {
      alert('Return processing failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    const status = (log.overall_status || log.status || '').toLowerCase();
    
    const matchesSearch =
      (log.item_name || '').toLowerCase().includes(term) ||
      (log.item_code || log.property_number || '').toLowerCase().includes(term) ||
      (log.full_name || log.borrower_id || '').toString().toLowerCase().includes(term) ||
      (log.usage_room_name || '').toLowerCase().includes(term);

    if (filterStatus === 'return_requested') return matchesSearch && status === 'return_requested';
    if (filterStatus === 'Active') return matchesSearch && (status === 'active' || status === 'approved');
    if (filterStatus === 'completed') return matchesSearch && (status === 'completed' || status === 'returned');
    return matchesSearch;
  });

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#f4f7f6' }}>
      {/* Top Navbar Header */}
      <nav className="navbar navbar-dark bg-dark px-4 shadow-sm mb-4">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold d-flex align-items-center">
            <i className="bi bi-journal-check fs-4 me-2 text-info"></i>
            <span>
              SCHOOL BORROW <small className="fs-6 text-white-50 ms-2">| Physical Inspection & Return Verification</small>
            </span>
          </span>
          <button onClick={() => navigate('/dashboard')} className="btn btn-outline-light btn-sm rounded-pill px-3">
            <i className="bi bi-arrow-left me-1"></i> Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="container pb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-1 text-dark">Return Inspection & Verification</h4>
            <p className="text-muted small mb-0">Physically inspect returned items before restoring equipment availability.</p>
          </div>
          <button className="btn btn-outline-secondary rounded-pill px-3" onClick={() => navigate('/dashboard')}>
            <i className="bi bi-arrow-left me-1"></i> Back
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="card border-0 shadow-sm p-3 mb-4 rounded-3">
          <div className="row g-2 align-items-center">
            <div className="col-md-5">
              <input
                type="text"
                className="form-control"
                placeholder="Search by equipment, code, borrower, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <select className="form-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="return_requested">Return Requested</option>
                <option value="Active">Active / Borrowed</option>
                <option value="completed">Completed / Returned</option>
              </select>
            </div>
            <div className="col-md-3 text-md-end text-muted small">
              Displaying: <strong>{filteredLogs.length}</strong> records
            </div>
          </div>
        </div>

        {/* Borrow Logs Table */}
        <div className="card border-0 shadow-sm rounded-3">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Equipment Name</th>
                  <th>Property Code</th>
                  <th>Borrower</th>
                  <th>Location</th>
                  <th>Expected Return</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      <div className="spinner-border spinner-border-sm me-2 text-primary" role="status"></div>
                      Loading inventory records...
                    </td>
                  </tr>
                ) : filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => {
                    const logId = log.log_id || log.request_id || log.id;
                    const status = (log.overall_status || log.status || 'Active').toLowerCase();
                    const isReturnPending = status === 'return_requested' || status === 'active' || status === 'approved';

                    return (
                      <tr key={logId}>
                        <td className="fw-bold">#{logId}</td>
                        <td className="fw-semibold text-dark">{log.item_name || 'N/A'}</td>
                        <td><code>{log.item_code || log.property_number || 'N/A'}</code></td>
                        <td>{log.full_name || log.id_number || log.borrower_id}</td>
                        <td>
                          {log.usage_room_name ? (
                            <span className="badge bg-light text-dark border">
                              {log.usage_room_name}
                            </span>
                          ) : (
                            <span className="text-muted small">Unspecified</span>
                          )}
                        </td>
                        <td>{log.expected_return_date ? new Date(log.expected_return_date).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          {status === 'return_requested' ? (
                            <span className="badge bg-warning text-dark">Return Requested</span>
                          ) : status === 'completed' || status === 'returned' ? (
                            <span className="badge bg-success">Completed</span>
                          ) : (
                            <span className="badge bg-primary">Borrowed</span>
                          )}
                        </td>
                        <td className="text-end">
                          {isReturnPending ? (
                            <button
                              className="btn btn-sm btn-warning fw-semibold rounded-pill px-3 shadow-sm"
                              onClick={() => handleOpenInspectionModal(log)}
                            >
                              <i className="bi bi-search me-1"></i> Inspect & Process Return
                            </button>
                          ) : (
                            <span className="text-muted small">Processed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      No matching records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Physical Inspection & Return Modal */}
        {inspectingLog && (
          <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-3 border-0 shadow-lg">
                <form onSubmit={handleConfirmReturn}>
                  <div className="modal-header bg-dark text-white">
                    <h5 className="modal-title fw-bold">
                      <i className="bi bi-shield-check me-2 text-warning"></i>Equipment Physical Inspection
                    </h5>
                    <button type="button" className="btn-close btn-close-white" onClick={() => setInspectingLog(null)}></button>
                  </div>

                  <div className="modal-body p-4">
                    {/* Read-Only Item Name */}
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-bold">Item Name</label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        value={inspectingLog.item_name || 'N/A'}
                        readOnly
                      />
                    </div>

                    {/* Read-Only Borrower Name */}
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-bold">Borrower Name</label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        value={inspectingLog.full_name || inspectingLog.id_number || inspectingLog.borrower_id || 'N/A'}
                        readOnly
                      />
                    </div>

                    {/* Return Condition Dropdown (Required) */}
                    <div className="mb-3">
                      <label className="form-label text-dark small fw-bold">
                        Return Condition <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        required
                        value={returnForm.return_condition}
                        onChange={(e) => setReturnForm({ ...returnForm, return_condition: e.target.value })}
                      >
                        <option value="excellent">Excellent (Like New)</option>
                        <option value="good">Good (Normal Wear)</option>
                        <option value="fair">Fair (Minor Wear / Functional)</option>
                        <option value="damaged">Damaged (Requires Maintenance / Repair)</option>
                      </select>
                    </div>

                    {/* Late Fine Amount Input */}
                    <div className="mb-3">
                      <label className="form-label text-dark small fw-bold">Late Fine Amount (₱)</label>
                      <div className="input-group">
                        <span className="input-group-text">₱</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control"
                          value={returnForm.fine_amount}
                          onChange={(e) => setReturnForm({ ...returnForm, fine_amount: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Admin Remarks Textarea */}
                    <div className="mb-3">
                      <label className="form-label text-dark small fw-bold">Admin Remarks</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="e.g., Missing HDMI cable, scratches on body, or inspected by custodian."
                        value={returnForm.remarks}
                        onChange={(e) => setReturnForm({ ...returnForm, remarks: e.target.value })}
                      ></textarea>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="btn btn-light" onClick={() => setInspectingLog(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-success px-4 fw-bold">
                      Verify & Confirm Return
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BorrowLogs;