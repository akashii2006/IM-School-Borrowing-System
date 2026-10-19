import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path) => (location.pathname === path ? 'active' : '');

  return (
    <div className="sidebar-nav">
      <div className="sidebar-brand">
        <div>
          <h2>NAVIGATION</h2>
          <small>INVENTORY SYSTEM</small>
        </div>
      </div>

      <div className="sidebar-label">MAIN MENU</div>

      <div className="sidebar-links d-flex flex-column">
        <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
          <span><i className="bi bi-speedometer2"></i></span> Dashboard
        </Link>
        <Link to="/equipment" className={`nav-link ${isActive('/equipment')}`}>
          <span><i className="bi bi-tools"></i></span> Equipment
        </Link>
        <Link to="/borrow" className={`nav-link ${isActive('/borrow')}`}>
          <span><i className="bi bi-journal-text"></i></span> Borrow Logs
        </Link>

        {user?.role === 'Admin' && (
          <>
            <div className="sidebar-label mt-2">ADMINISTRATION</div>
            <Link to="/borrowers" className={`nav-link ${isActive('/borrowers')}`}>
              <span><i className="bi bi-people"></i></span> Borrowers
            </Link>
            <Link to="/maintenance" className={`nav-link ${isActive('/maintenance')}`}>
              <span><i className="bi bi-wrench-adjustable"></i></span> Maintenance
            </Link>
          </>
        )}
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-status">
          <span></span> Server Connected
        </div>
      </div>
    </div>
  );
};

export default Sidebar;