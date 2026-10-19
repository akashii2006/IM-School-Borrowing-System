import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div>
      <Navbar />
      <div className="d-flex">
        <Sidebar />
        <div className="flex-grow-1 p-4 dashboard-content" style={{ minHeight: 'calc(100vh - 60px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;