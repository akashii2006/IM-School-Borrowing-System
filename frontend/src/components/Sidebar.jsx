import { useNavigate } from 'react-router-dom';

const Sidebar = ({ user }) => {
  const navigate = useNavigate();
  const role = (user?.role || user?.type || '').toLowerCase();
  const isAdmin = role === 'admin';

  return (
    <div
      className="p-3 text-white d-flex flex-column justify-content-between shadow-sm"
      style={{ width: '260px', minWidth: '260px', backgroundColor: '#0d233a' }}
    >
      <div>
        <div className="px-2 mb-4">
          <small className="text-uppercase text-white-50 fw-bold tracking-wider" style={{ fontSize: '0.7rem' }}>
            Navigation
          </small>
          <h6 className="fw-bold text-white mb-0 mt-1">
            {isAdmin ? 'ADMINISTRATOR' : role === 'staff' ? 'FACULTY PORTAL' : 'BORROWER PORTAL'}
          </h6>
        </div>

        <div className="nav flex-column nav-pills gap-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="nav-link text-start rounded-3 d-flex align-items-center px-3 py-2 text-white hover-light border-0 bg-transparent"
          >
            <i className="bi bi-speedometer2 me-3 fs-5"></i>
            Dashboard Overview
          </button>

          {/* Admin-Only Navigation Links */}
          {isAdmin && (
            <>
              <button
                onClick={() => navigate('/borrow-logs')}
                className="nav-link text-start rounded-3 d-flex align-items-center px-3 py-2 text-white-50 hover-light border-0 bg-transparent"
              >
                <i className="bi bi-journal-text me-3 fs-5"></i>
                Borrow Logs & Returns
              </button>
              <button
                onClick={() => navigate('/rooms')}
                className="nav-link text-start rounded-3 d-flex align-items-center px-3 py-2 text-white-50 hover-light border-0 bg-transparent"
              >
                <i className="bi bi-building me-3 fs-5"></i>
                Rooms & Offices
              </button>
              <button
                onClick={() => navigate('/property-assignments')}
                className="nav-link text-start rounded-3 d-flex align-items-center px-3 py-2 text-white-50 hover-light border-0 bg-transparent"
              >
                <i className="bi bi-person-workspace me-3 fs-5"></i>
                Property Assignments
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sidebar User Info Card */}
      <div className="p-3 rounded-3 mt-auto" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
        <div className="d-flex align-items-center">
          <i className="bi bi-person-badge-fill fs-2 text-info me-2"></i>
          <div className="text-truncate">
            <div className="fw-bold text-white text-truncate">{user.name || user.full_name || 'User Account'}</div>
            <small className="text-white-50 d-block text-truncate">
              Role: {user.role || user.type || 'User'}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;