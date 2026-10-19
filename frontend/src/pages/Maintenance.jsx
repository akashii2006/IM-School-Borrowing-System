import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../api/axiosInstance';

const Maintenance = () => {
  const [records, setRecords] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    item_id: '',
    maintenance_date: new Date().toISOString().split('T')[0],
    issue_description: '',
    action_taken: '',
    cost: '0.00'
  });

  const fetchMaintenance = async () => {
    try {
      const res = await API.get('/maintenance');
      setRecords(res.data);
    } catch (err) {
      console.error('Failed to load maintenance records:', err);
    }
  };

  const fetchEquipment = async () => {
    try {
      const res = await API.get('/equipment');
      setEquipmentList(res.data);
    } catch (err) {
      console.error('Failed to load equipment list:', err);
    }
  };

  useEffect(() => {
    fetchMaintenance();
    fetchEquipment();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/maintenance', formData);
      setShowModal(false);
      setFormData({
        item_id: '',
        maintenance_date: new Date().toISOString().split('T')[0],
        issue_description: '',
        action_taken: '',
        cost: '0.00'
      });
      fetchMaintenance();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit maintenance log.');
    }
  };

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0" style={{ color: '#102a43' }}>Maintenance Logs</h2>
          <small className="text-muted">Track equipment servicing, repairs, and associated expenses</small>
        </div>
        <button className="btn btn-warning fw-bold text-dark" onClick={() => setShowModal(true)}>
          <i className="bi bi-wrench-adjustable me-1"></i> Log Maintenance
        </button>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Property #</th>
                <th>Item Name</th>
                <th>Maintenance Date</th>
                <th>Issue Description</th>
                <th>Action Taken</th>
                <th>Cost (₱)</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                records.map(m => (
                  <tr key={m.maintenance_id}>
                    <td>#{m.maintenance_id}</td>
                    <td className="fw-bold">{m.property_number}</td>
                    <td>{m.item_name}</td>
                    <td>{new Date(m.maintenance_date).toLocaleDateString()}</td>
                    <td>{m.issue_description}</td>
                    <td>{m.action_taken || 'Pending'}</td>
                    <td className="fw-bold text-success">₱{parseFloat(m.cost).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">No maintenance history found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title fw-bold">Log Equipment Maintenance</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Select Equipment Item</label>
                    <select
                      className="form-select"
                      required
                      value={formData.item_id}
                      onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
                    >
                      <option value="">Choose Equipment</option>
                      {equipmentList.map(e => (
                        <option key={e.item_id} value={e.item_id}>{e.item_name} - {e.property_number}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Maintenance Date</label>
                    <input
                      type="date"
                      className="form-control"
                      required
                      value={formData.maintenance_date}
                      onChange={(e) => setFormData({ ...formData, maintenance_date: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Issue Description</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      required
                      placeholder="Describe the defect or repair needed..."
                      value={formData.issue_description}
                      onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Action Taken</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., Replaced battery, recalibrated lens"
                      value={formData.action_taken}
                      onChange={(e) => setFormData({ ...formData, action_taken: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Repair Cost (₱)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-warning fw-bold text-dark">Save Record</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Maintenance;