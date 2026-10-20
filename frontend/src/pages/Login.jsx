import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axiosInstance';

const Login = ({ setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await API.post('/auth/login', {
        username: username.trim(),
        password: password.trim()
      });

      if (response.data && response.data.user) {
        const userData = response.data.user;
        localStorage.setItem('user', JSON.stringify(userData));
        if (setUser) setUser(userData);
        navigate('/dashboard', { replace: true });
        window.location.reload(); // Ensures state refreshes cleanly
      } else {
        setErrorMsg('Invalid response from server.');
      }
    } catch (err) {
      console.error('Login submit error:', err);
      const serverMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setErrorMsg(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{ backgroundColor: '#1a5b6e' }}
    >
      <div
        className="card shadow-lg p-4 border-0 rounded-4"
        style={{ width: '100%', maxWidth: '420px', backgroundColor: '#ffffff' }}
      >
        <div className="text-center mb-4">
          <small className="text-uppercase tracking-wider text-muted fw-semibold">WELCOME BACK</small>
          <h2 className="fw-extrabold text-dark mt-1 mb-0" style={{ letterSpacing: '-0.5px' }}>
            SCHOOL BORROW
          </h2>
          <small className="text-muted">School Inventory Management System</small>
        </div>

        {errorMsg && (
          <div className="alert alert-danger text-center small py-2 rounded-3 mb-3" role="alert">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-bold text-secondary">Username / ID Number</label>
            <input
              type="text"
              className="form-control form-control-lg fs-6 bg-light border-0"
              placeholder="e.g. admin or 123"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold text-secondary">Password</label>
            <input
              type="password"
              className="form-control form-control-lg fs-6 bg-light border-0"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg w-100 fw-bold rounded-3"
            style={{ backgroundColor: '#0f4c5c', borderColor: '#0f4c5c' }}
          >
            {loading ? (
              <span>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Signing In...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <small className="text-muted" style={{ fontSize: '0.75rem' }}>
            © 2026 SCHOOL BORROW | University of Cabuyao
          </small>
        </div>
      </div>
    </div>
  );
};

export default Login;