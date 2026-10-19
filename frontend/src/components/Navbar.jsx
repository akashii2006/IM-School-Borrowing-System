import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark px-4">
      <span className="navbar-brand d-flex align-items-center gap-2">
        <i className="bi bi-box-seam fs-4"></i>
        <span>SCHOOL BORROW</span>
      </span>
      <div className="ms-auto d-flex align-items-center text-white gap-3">
        <span>
          <i className="bi bi-person-circle me-1"></i>
          {user?.full_name || user?.username} ({user?.role})
        </span>
        <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-1"></i>Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;