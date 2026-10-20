import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axiosInstance';

const RoomsOffices = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    room_name: '',
    building: 'Main Building',
    floor_level: '1st Floor'
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await API.get('/rooms');
      setRooms(res.data || []);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        room_name: room.room_name,
        building: room.building || 'Main Building',
        floor_level: room.floor_level || '1st Floor'
      });
    } else {
      setEditingRoom(null);
      setFormData({
        room_name: '',
        building: 'Main Building',
        floor_level: '1st Floor'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await API.put(`/rooms/${editingRoom.room_id}`, formData);
        alert('Room updated successfully!');
      } else {
        await API.post('/rooms', formData);
        alert('Room registered successfully!');
      }
      setShowModal(false);
      fetchRooms();
    } catch (err) {
      alert('Operation failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room/office?')) return;

    try {
      await API.delete(`/rooms/${roomId}`);
      alert('Room deleted successfully.');
      fetchRooms();
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredRooms = rooms.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      (r.room_name || '').toLowerCase().includes(term) ||
      (r.building || '').toLowerCase().includes(term) ||
      (r.floor_level || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#f4f7f6' }}>
      {/* Top Navbar Header */}
      <nav className="navbar navbar-dark bg-dark px-4 shadow-sm mb-4">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold d-flex align-items-center">
            <i className="bi bi-building fs-4 me-2 text-info"></i>
            <span>
              SCHOOL BORROW <small className="fs-6 text-white-50 ms-2">| Rooms & Offices Directory</small>
            </span>
          </span>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-outline-light btn-sm rounded-pill px-3"
          >
            <i className="bi bi-arrow-left me-1"></i> Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="container pb-5">
        {/* Page Header Area */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-1 text-dark">Rooms & Offices Directory</h4>
            <p className="text-muted small mb-0">Manage campus facilities, buildings, and property locations.</p>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary rounded-pill px-3"
              onClick={() => navigate('/dashboard')}
            >
              <i className="bi bi-arrow-left me-1"></i> Back
            </button>
            <button className="btn btn-primary rounded-pill px-3" onClick={() => handleOpenModal()}>
              <i className="bi bi-plus-circle me-1"></i> Add Room / Office
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="card border-0 shadow-sm p-3 mb-4 rounded-3">
          <div className="row g-2 align-items-center">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Search by room name, building, or floor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-6 text-md-end text-muted small">
              Total Locations Listed: <strong>{rooms.length}</strong>
            </div>
          </div>
        </div>

        {/* Rooms Table */}
        <div className="card border-0 shadow-sm rounded-3">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Room / Office Name</th>
                  <th>Building</th>
                  <th>Floor Level</th>
                  <th>Assigned Assets</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      <div className="spinner-border spinner-border-sm me-2 text-primary" role="status"></div>
                      Loading campus locations...
                    </td>
                  </tr>
                ) : filteredRooms.length > 0 ? (
                  filteredRooms.map((room) => (
                    <tr key={room.room_id}>
                      <td className="fw-bold">#{room.room_id}</td>
                      <td className="fw-bold text-dark">{room.room_name}</td>
                      <td>{room.building}</td>
                      <td>{room.floor_level}</td>
                      <td>
                        <span className="badge bg-info text-dark">
                          {room.total_assigned_assets || 0} Assets
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-primary me-2 rounded-pill px-3"
                          onClick={() => handleOpenModal(room)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger rounded-pill px-3"
                          onClick={() => handleDelete(room.room_id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No rooms or offices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add / Edit Modal */}
        {showModal && (
          <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-3 border-0 shadow-lg">
                <form onSubmit={handleSubmit}>
                  <div className="modal-header bg-dark text-white">
                    <h5 className="modal-title fw-bold">
                      {editingRoom ? 'Edit Location Details' : 'Register New Room / Office'}
                    </h5>
                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                  </div>
                  <div className="modal-body p-4">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Room or Office Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Computer Laboratory 2 or Registrar Office"
                        required
                        value={formData.room_name}
                        onChange={(e) => setFormData({ ...formData, room_name: e.target.value })}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Building Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. IT Building or Main Academic Hall"
                        required
                        value={formData.building}
                        onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Floor Level</label>
                      <select
                        className="form-select"
                        value={formData.floor_level}
                        onChange={(e) => setFormData({ ...formData, floor_level: e.target.value })}
                      >
                        <option value="Ground Floor">Ground Floor</option>
                        <option value="1st Floor">1st Floor</option>
                        <option value="2nd Floor">2nd Floor</option>
                        <option value="3rd Floor">3rd Floor</option>
                        <option value="4th Floor">4th Floor</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary px-4">
                      {editingRoom ? 'Save Changes' : 'Create Room'}
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

export default RoomsOffices;