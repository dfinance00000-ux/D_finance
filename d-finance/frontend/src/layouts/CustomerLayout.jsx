import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';

const CustomerLayout = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <div style={{ width: '260px', background: '#1e293b', color: '#fff', padding: '20px' }}>
        <h2 style={{ color: '#38bdf8', marginBottom: '30px' }}>D-FINANCE</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <Link to="/customer/dashboard" style={linkStyle}>📊 Dashboard</Link>
          <Link to="/customer/apply-loan" style={linkStyle}>📝 Apply for Loan</Link>
          <Link to="/customer/tracking" style={linkStyle}>📡 Track Application</Link>
          <Link to="/customer/emi" style={linkStyle}>💳 EMI Payments</Link>
          <button onClick={handleLogout} style={logoutBtn}>Logout</button>
        </nav>
      </div>
      {/* Main Content */}
      <div style={{ flex: 1, padding: '30px' }}>
        <header style={{ marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
          <h3>Welcome, {user?.fullName} (ID: {user?.id})</h3>
        </header>
        <Outlet />
      </div>
    </div>
  );
};

const linkStyle = { color: '#cbd5e1', textDecoration: 'none', fontSize: '16px', padding: '10px', borderRadius: '8px', transition: '0.3s' };
const logoutBtn = { marginTop: '50px', background: '#ef4444', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' };

export default CustomerLayout;