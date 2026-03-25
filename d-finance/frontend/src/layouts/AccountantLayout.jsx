import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';

const AccountantLayout = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Accountant Sidebar */}
      <div style={sidebarStyle}>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2 style={{ color: '#10b981', margin: 0 }}>D-FINANCE</h2>
          <span style={roleBadge}>Accountant Portal</span>
        </div>
        
        <nav style={navStyle}>
          <Link to="/accountant/approval" style={linkStyle}>✅ Final Auth Queue</Link>
          <Link to="/accountant/reports" style={linkStyle}>📊 Collection Reports</Link>
          {/* SOP Point 3: Bulk retrieval access check */}
          <Link to="/admin/bulk-reports" style={linkStyle}>📥 Bulk Data Retrieval</Link>
          
          <div style={{ marginTop: 'auto', padding: '20px' }}>
            <button onClick={handleLogout} style={logoutBtn}>Logout System</button>
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '30px' }}>
        <header style={headerStyle}>
          <div>
            <h3 style={{ margin: 0 }}>Finance Head: {user?.fullName}</h3>
            <small style={{ color: '#64748b' }}>Ready for Final Authentication & QC </small>
          </div>
          <div style={statusDot}>System Online</div>
        </header>
        
        <main style={contentBox}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// --- Accountant Specific Styles ---
const sidebarStyle = { width: '280px', background: '#0f172a', color: '#fff', display: 'flex', flexDirection: 'column' };
const roleBadge = { fontSize: '10px', background: '#059669', padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase' };
const navStyle = { display: 'flex', flexDirection: 'column', gap: '5px', padding: '20px', flex: 1 };
const linkStyle = { color: '#94a3b8', textDecoration: 'none', padding: '12px 15px', borderRadius: '8px', fontSize: '14px', transition: '0.3s' };
const logoutBtn = { width: '100%', background: '#ef4444', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '20px', borderRadius: '15px', marginBottom: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' };
const statusDot = { background: '#dcfce7', color: '#166534', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' };
const contentBox = { background: '#fff', padding: '25px', borderRadius: '15px', minHeight: '80vh', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };

export default AccountantLayout;