import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../api/axiosInstance';

const Borrowers = () => {
  const [borrowers, setBorrowers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    borrower_id: '',
    id_number: '',
    full_name: '',
    role: 'Student',
    contact_number: ''
  });

  const fetchBorrowers = async () => {
    try {
      const res = await API.get('/borrowers');
      setBorrowers(res.data);
    } catch (err) {
      console.error('Failed to load borrowers:', err);
    }
  };

  useEffect(() => {
    fetchBorrowers();
  }, []);

  const handleOpenModal = (borrower = null) => {
    if (borrower) {
      setIsEditing(true);
      setFormData(borrower);
    } else {
      setIsEditing(false);
      setFormData({ borrower_id: '', id_number: '', full_name: '', role: 'Student', contact_number: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await API.put(`/borrowers/${formData.borrower_id}`, formData);
      } else {
        await API.post('/borrowers', formData);
      }
      setShowModal(false);
      fetchBorrowers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving borrower.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this borrower record?')) {
      try {
        await API.delete(`/borrowers/${id}`);
        fetchBorrowers();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete borrower.');
      }
    }
  };

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0" style={{ color: '#102a43' }}>Borrower Directory</h2>
          <small className="text-muted">Manage registered students, faculty, and staff members</small>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <i className="bi bi-person-plus me-1"></i> Register Borrower
        </button>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>ID Number</th>
                <th>Full Name</th>
                <th>Role</th>
                <th>Contact Number</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {borrowers.length > 0 ? (
                borrowers.map(b => (
                  <tr key={b.borrower_id}>
                    <td className="fw-bold">{b.id_number}</td>
                    <td>{b.full_name}</td>
                    <td>
                      <span className="badge bg-secondary">{b.role}</span>
                    </td>
                    <td>{b.contact_number || 'N/A'}</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleOpenModal(b)}>
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(b.borrower_id)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">No borrower records found.</td>
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
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">{isEditing ? 'Edit Borrower' : 'Register New Borrower'}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">ID Number</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={formData.id_number}
                      onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Role</label>
                    <select
                      className="form-select"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="Student">Student</option>
                      <option value="Faculty">Faculty</option>
                      <option value="Staff">Staff</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Contact Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.contact_number}
                      onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{isEditing ? 'Save Changes' : 'Register'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Borrowers;