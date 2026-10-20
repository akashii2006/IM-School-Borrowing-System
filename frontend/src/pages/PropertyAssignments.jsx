import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axiosInstance';

const PropertyAssignments = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  const [roomsList, setRoomsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    item_id: '',
    assigned_to: '',
    room_id: '',
    date_assigned: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      const [assignmentsRes, itemsRes, roomsRes] = await Promise.all([
        API.get('/property-assignments').catch(() => ({ data: [] })),
        API.get('/items').catch(() => ({ data: [] })),
        API.get('/rooms').catch(() => ({ data: [] }))
      ]);

      setAssignments(Array.isArray(assignmentsRes.data) ? assignmentsRes.data : []);
      
      const rawItems = Array.isArray(itemsRes.data) ? itemsRes.data : itemsRes.data?.data || [];
      setItemsList(rawItems);

      const rawRooms = Array.isArray(roomsRes.data) ? roomsRes.data : [];
      setRoomsList(rawRooms);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/property-assignments', formData);
      alert('Property assigned successfully!');
      setShowModal(false);
      setFormData({
        item_id: '',
        assigned_to: '',
        room_id: '',
        date_assigned: new Date().toISOString().split('T')[0],
        remarks: ''
      });
      fetchInitialData();
    } catch (err) {
      alert('Assignment failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUnassign = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to release/unassign this property?')) return;

    try {
      await API.put(`/property-assignments/${assignmentId}/unassign`);
      alert('Property released successfully.');
      fetchInitialData();
    } catch (err) {
      alert('Release failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    const term = searchTerm.toLowerCase();
    return (
      (a.item_name || '').toLowerCase().includes(term) ||
      (a.item_code || '').toLowerCase().includes(term) ||
      (a.assigned_to || '').toLowerCase().includes(term) ||
      (a.room_name || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#f4f7f6' }}>
      {/* Top Navbar Header */}
      <nav className="navbar navbar-dark bg-dark px-4 shadow-sm mb-4">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold d-flex align-items-center">
            <i className="bi bi-person-workspace fs-4 me-2 text-info"></i>
            <span>
              SCHOOL BORROW <small className="fs-6 text-white-50 ms-2">| Property Assignments</small>
            </span>
          </span>
          <button onClick={() => navigate('/dashboard')} className="btn btn-outline-light btn-sm rounded-pill px-3">
            <i className="bi bi-arrow-left me-1"></i> Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="container pb-5">
        {/* Page Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-1 text-dark">Property Assignments</h4>
            <p className="text-muted small mb-0">Assign non-borrowable property items to department custodians and rooms.</p>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary rounded-pill px-3"
              onClick={() => navigate('/dashboard')}
            >
              <i className="bi bi-arrow-left me-1"></i> Back
            </button>
            <button className="btn btn-primary rounded-pill px-3" onClick={() => setShowModal(true)}>
              <i className="bi bi-plus-circle me-1"></i> Assign Property
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="card border-0 shadow-sm p-3 mb-4 rounded-3">
          <div className="row g-2 align-items-center">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Search by asset name, code, custodian, or room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-6 text-md-end text-muted small">
              Total Active Assignments: <strong>{assignments.filter(a => a.status === 'Active').length}</strong>
            </div>
          </div>
        </div>

        {/* Assignments Table */}
        <div className="card border-0 shadow-sm rounded-3">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Asset Name</th>
                  <th>Property Code</th>
                  <th>Assigned Custodian</th>
                  <th>Room / Office</th>
                  <th>Date Assigned</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      <div className="spinner-border spinner-border-sm me-2 text-primary" role="status"></div>
                      Loading property assignments...
                    </td>
                  </tr>
                ) : filteredAssignments.length > 0 ? (
                  filteredAssignments.map((a) => (
                    <tr key={a.assignment_id}>
                      <td className="fw-bold">#{a.assignment_id}</td>
                      <td className="fw-bold text-dark">{a.item_name || 'N/A'}</td>
                      <td><code>{a.item_code || 'N/A'}</code></td>
                      <td>{a.assigned_to}</td>
                      <td>{a.room_name ? `${a.room_name} (${a.building})` : 'Unassigned Room'}</td>
                      <td>{new Date(a.date_assigned).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${a.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="text-end">
                        {a.status === 'Active' && (
                          <button
                            className="btn btn-sm btn-outline-danger rounded-pill px-3"
                            onClick={() => handleUnassign(a.assignment_id)}
                          >
                            Release
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      No property assignments recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assign Modal */}
        {showModal && (
          <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-3 border-0 shadow-lg">
                <form onSubmit={handleAssignSubmit}>
                  <div className="modal-header bg-dark text-white">
                    <h5 className="modal-title fw-bold">Assign Property Asset</h5>
                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                  </div>
                  <div className="modal-body p-4">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Select Property Item</label>
                      <select
                        className="form-select"
                        required
                        value={formData.item_id}
                        onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
                      >
                        <option value="">-- Choose Item --</option>
                        {itemsList
                          .filter((i) => i.status === 'available')
                          .map((item) => (
                            <option key={item.item_id || item.id} value={item.item_id || item.id}>
                              {item.name} ({item.item_code})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Custodian Name / Faculty</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Dr. John Doe or Dept Head"
                        required
                        value={formData.assigned_to}
                        onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Assign to Room / Office</label>
                      <select
                        className="form-select"
                        value={formData.room_id}
                        onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                      >
                        <option value="">-- Optional Location --</option>
                        {roomsList.map((room) => (
                          <option key={room.room_id} value={room.room_id}>
                            {room.room_name} ({room.building})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Assignment Date</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={formData.date_assigned}
                        onChange={(e) => setFormData({ ...formData, date_assigned: e.target.value })}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Remarks / Notes</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Optional details or condition notes..."
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary px-4">
                      Confirm Assignment
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

export default PropertyAssignments;