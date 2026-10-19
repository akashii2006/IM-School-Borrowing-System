import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axiosInstance';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter your username and password.');
      return;
    }

    try {
      const response = await API.post('/auth/login', { username, password });
      login(response.data.user);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert('Please contact the system administrator to reset your password.');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <span className="login-label text-uppercase">Welcome Back</span>
        <h1 className="mt-1">SCHOOL BORROW</h1>
        <p className="login-description">School Inventory Management System</p>

        {errorMsg && <div className="alert alert-danger py-2">{errorMsg}</div>}

        <form onSubmit={handleLoginSubmit}>
          <div className="text-start mb-3">
            <label className="form-label fw-semibold">Username</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="text-start mb-3">
            <label className="form-label fw-semibold">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <a href="#forgot" className="login-link" onClick={handleForgotPassword}>
              Forgot Password?
            </a>
            <Link to="/register" className="login-link">
              Register Account
            </Link>
          </div>

          <button type="submit" className="btn login-button w-100">
            Sign In
          </button>
        </form>

        <div className="login-footer">
          &copy; 2026 SCHOOL BORROW | University of Cabuyao
        </div>
      </div>
    </div>
  );
};

export default Login;