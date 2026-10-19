import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axiosInstance';

const Register = () => {
  const [role, setRole] = useState('Faculty');
  const [idNumber, setIdNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post('/borrowers', {
        id_number: idNumber,
        full_name: fullName,
        role: role,
        contact_number: contactNumber,
        password: password
      });

      setMessage({
        text: `Registration successful! You can now log in using your ID Number (${idNumber}).`,
        type: 'text-success fw-bold'
      });

      setIdNumber('');
      setFullName('');
      setContactNumber('');
      setPassword('');
      setRole('Faculty');
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Registration failed.',
        type: 'text-danger fw-bold'
      });
    }
  };

  return (
    <div style={{ backgroundColor: '#edf4fa', minHeight: '100vh' }}>
      <nav className="navbar navbar-dark bg-dark px-4">
        <span className="navbar-brand fw-bold">
          <i className="bi bi-box-seam me-2"></i>SCHOOL BORROW
        </span>
        <Link to="/login" className="btn btn-outline-light btn-sm">
          Back to Login
        </Link>
      </nav>

      <div className="container">
        <div className="card registration-card shadow my-5">
          <div className="card-header text-center bg-primary text-white p-4">
            <h3>Borrower Account Registration</h3>
            <p className="mb-0">School Property & Equipment Inventory System</p>
          </div>

          <div className="card-body p-4">
            <form onSubmit={handleRegisterSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Role</label>
                <select
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="Faculty">Faculty Member</option>
                  <option value="Student">Student</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">ID Number (This will be your login username)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. FAC-2026-001 or 2024-10042"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Contact Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter contact number"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Account Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-register w-100 fw-bold mt-2">
                Create Borrower Account
              </button>

              {message.text && (
                <div className={`mt-3 text-center ${message.type}`}>
                  {message.text}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;