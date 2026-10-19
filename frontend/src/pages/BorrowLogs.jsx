import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../api/axiosInstance';

const BorrowLogs = () => {
  const [logs, setLogs] = useState([]);
  const [borrowers, setBorrowers] = useState([]);
  const [availableEquipment, setAvailableEquipment] = useState([]);

  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  const [borrowData, setBorrowData] = useState({
    borrower_id: '',
    item_id: '',
    expected_return_date: '',
    condition: 'Good condition'
  });

  const [returnData, setReturnData] = useState({
    log_id: '',
    item_id: '',
    return_condition: 'Returned intact'
  });

  const fetchLogs = async () => {
    try {
      const res = await API.get('/borrow');
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to load borrow logs:', err);
    }
  };

  const fetchBorrowers = async () => {
    try {
      const res = await API.get('/borrowers');
      setBorrowers(res.data);
    } catch (err) {
      console.error('Failed to load borrowers:', err);
    }
  };

  const fetchAvailableEquipment = async () => {
    try {
      const res = await API.get('/equipment');
      setAvailableEquipment(res.data.filter(item => item.status === 'Available'));
    } catch (err) {
      console.error('Failed to load available equipment:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchBorrowers();
    fetchAvailableEquipment();
  }, []);

  const handleBorrowSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/borrow', borrowData);
      setShowBorrowModal(false);
      setBorrowData({ borrower_id: '', item_id: '', expected_return_date: '', condition: 'Good condition' });
      fetchLogs();
      fetchAvailableEquipment();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete borrow transaction.');
    }
  };

  const handleOpenReturnModal = (log) => {
    setReturnData({
      log_id: log.log_id,
      item_id: log.item_id,
      return_condition: 'Returned intact'
    });
    setShowReturnModal(true);
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/borrow/return', returnData);
      setShowReturnModal(false);
      fetchLogs();
      fetchAvailableEquipment();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to return equipment.');
    }
  };

  const isOverdue = (expectedDate, status) => {
    if (status !== 'Active') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const returnDate = new Date(expectedDate);
    return returnDate < today;
  };

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0" style={{ color: '#102a43' }}>Borrowing Records</h2>
          <small className="text-muted">Track active loans and equipment return history</small>
        </div>
        <button className="btn btn-primary" onClick={() => { fetchAvailableEquipment(); setShowBorrowModal(true); }}>
          <i className="bi bi-journal-plus me-1"></i> New Borrow Record
        </button>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Borrower</th>
                <th>Equipment Name</th>
                <th>Borrow Condition</th>
                <th>Expected Return</th>
                <th>Actual Return</th>
                <th>Status</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map(log => (
                  <tr key={log.log_id}>
                    <td>#{log.log_id}</td>
                    <td className="fw-semibold">{log.borrower_name} <br/><small className="text-muted">({log.id_number})</small></td>
                    <td>{log.item_name} <br/><small className="text-muted">{log.property_number}</small></td>
                    <td>{log.item_condition_on_borrow}</td>
                    <td>{new Date(log.expected_return_date).toLocaleDateString()}</td>
                    <td>{log.actual_return_date ? new Date(log.actual_return_date).toLocaleDateString() : '-'}</td>
                    <td>
                      {log.overall_status === 'Active' ? (
                        isOverdue(log.expected_return_date, log.overall_status) ? (
                          <span className="badge bg-danger">Overdue</span>
                        ) : (
                          <span className="badge bg-primary">Active</span>
                        )
                      ) : (
                        <span className="badge bg-success">Returned</span>
                      )}
                    </td>
                    <td className="text-end">
                      {log.overall_status === 'Active' && (
                        <button className="btn btn-sm btn-outline-success" onClick={() => handleOpenReturnModal(log)}>
                          <i className="bi bi-box-arrow-in-left me-1"></i> Return
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">No borrowing transactions recorded.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showBorrowModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Create Borrow Transaction</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowBorrowModal(false)}></button>
              </div>
              <form onSubmit={handleBorrowSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Select Borrower</label>
                    <select
                      className="form-select"
                      required
                      value={borrowData.borrower_id}
                      onChange={(e) => setBorrowData({ ...borrowData, borrower_id: e.target.value })}
                    >
                      <option value="">Choose Borrower</option>
                      {borrowers.map(b => (
                        <option key={b.borrower_id} value={b.borrower_id}>{b.full_name} ({b.id_number})</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Select Available Equipment</label>
                    <select
                      className="form-select"
                      required
                      value={borrowData.item_id}
                      onChange={(e) => setBorrowData({ ...borrowData, item_id: e.target.value })}
                    >
                      <option value="">Choose Equipment</option>
                      {availableEquipment.map(e => (
                        <option key={e.item_id} value={e.item_id}>{e.item_name} - {e.property_number}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Expected Return Date</label>
                    <input
                      type="date"
                      className="form-control"
                      required
                      value={borrowData.expected_return_date}
                      onChange={(e) => setBorrowData({ ...borrowData, expected_return_date: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Condition On Borrow</label>
                    <input
                      type="text"
                      className="form-control"
                      value={borrowData.condition}
                      onChange={(e) => setBorrowData({ ...borrowData, condition: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowBorrowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Process Loan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showReturnModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">Return Equipment</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowReturnModal(false)}></button>
              </div>
              <form onSubmit={handleReturnSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Return Condition Notes</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      required
                      value={returnData.return_condition}
                      onChange={(e) => setReturnData({ ...returnData, return_condition: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowReturnModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-success">Confirm Return</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default BorrowLogs;