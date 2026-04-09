import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiCheckCircle, FiBarChart, FiDownload, FiLogOut, 
  FiCreditCard, FiShield, FiActivity 
} from 'react-icons/fi';

const AccountantLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Active Link check karne ke liye helper
  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      
      {/* --- Accountant Premium Sidebar --- */}
      <div style={sidebarStyle}>
        <div style={brandBox}>
          <h2 style={brandTitle}>D-FINANCE</h2>
          <span style={roleBadge}>Accountant Portal</span>
        </div>
        
        <nav style={navStyle}>
          <p style={navLabel}>Main Menu</p>
          
          <Link to="/accountant/approval" style={isActive('/accountant/approval') ? activeLink : linkStyle}>
            <FiCheckCircle size={18} /> ✅ Final Auth Queue
          </Link>

          {/* 🔥 Naya Payment Approval Link (Aditi's EMI Verifier) */}
          <Link to="/accountant/payment-approval" style={isActive('/accountant/payment-approval') ? activeLink : linkStyle}>
            <FiCreditCard size={18} /> 💳 EMI Payment Approval
          </Link>

          <Link to="/accountant/reports" style={isActive('/accountant/reports') ? activeLink : linkStyle}>
            <FiBarChart size={18} /> 📊 Collection Reports
          </Link>
          
          <Link to="/accountant/bulk-data" style={isActive('/accountant/bulk-data') ? activeLink : linkStyle}>
            <FiDownload size={18} /> 📥 Bulk Data Retrieval
          </Link>
          
          {/* Logout Section at Bottom */}
          <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
            <button onClick={handleLogout} style={logoutBtn}>
              <FiLogOut /> Logout System
            </button>
          </div>
        </nav>
      </div>

      {/* --- Main Content Area --- */}
      <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        
        <header style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={userAvatar}><FiShield size={24} color="#059669" /></div>
            <div>
              <h3 style={{ margin: 0, color: '#0f172a', fontWeight: 800 }}>Officer: {user?.fullName}</h3>
              <small style={{ color: '#64748b', fontWeight: 600 }}>Branch: Mathura | Finance Head Terminal</small>
            </div>
          </div>
          <div style={statusBadge}>
            <FiActivity className="pulse" /> System Online
          </div>
        </header>
        
        <main style={contentBox}>
          {/* Saare pages (Approval, Payouts) isi area mein khulenge */}
          <Outlet />
        </main>

        <footer style={footerStyle}>
          © 2026 D-Finance Ledger Management System | Secure 256-bit Encrypted
        </footer>
      </div>

      {/* Pulse Animation Style */}
      <style>{`
        .pulse { animation: pulse-red 2s infinite; margin-right: 5px; }
        @keyframes pulse-red { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
};

// --- Accountant Specific Styles (Modern UI) ---
const sidebarStyle = { 
  width: '300px', 
  background: '#0f172a', 
  color: '#fff', 
  display: 'flex', 
  flexDirection: 'column',
  boxShadow: '4px 0 10px rgba(0,0,0,0.1)' 
};

const brandBox = { padding: '40px 20px', textAlign: 'center', borderBottom: '1px solid #1e293b' };
const brandTitle = { color: '#10b981', margin: 0, fontSize: '24px', fontWeight: 900, letterSpacing: '2px' };
const roleBadge = { fontSize: '9px', background: '#059669', padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', fontWeight: 900, marginTop: '10px', display: 'inline-block' };

const navStyle = { display: 'flex', flexDirection: 'column', gap: '8px', padding: '30px 20px', flex: 1 };
const navLabel = { fontSize: '10px', color: '#475569', textTransform: 'uppercase', fontWeight: 800, marginBottom: '10px', letterSpacing: '1px' };

const linkStyle = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '12px', 
  color: '#94a3b8', 
  textDecoration: 'none', 
  padding: '14px 18px', 
  borderRadius: '12px', 
  fontSize: '14px', 
  fontWeight: 600, 
  transition: 'all 0.3s' 
};

const activeLink = { 
  ...linkStyle, 
  background: '#1e293b', 
  color: '#fff', 
  borderLeft: '4px solid #10b981' 
};

const logoutBtn = { 
  width: '100%', 
  background: 'rgba(239, 68, 68, 0.1)', 
  color: '#ef4444', 
  border: '1px solid rgba(239, 68, 68, 0.2)', 
  padding: '14px', 
  borderRadius: '12px', 
  cursor: 'pointer', 
  fontWeight: 800, 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  gap: '10px',
  transition: '0.3s'
};

const headerStyle = { 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  background: '#fff', 
  padding: '20px 30px', 
  borderRadius: '20px', 
  marginBottom: '25px', 
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
  border: '1px solid #f1f5f9'
};

const userAvatar = { width: '45px', height: '45px', background: '#ecfdf5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const statusBadge = { background: '#dcfce7', color: '#166534', padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center' };
const contentBox = { background: '#fff', padding: '30px', borderRadius: '25px', minHeight: '75vh', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' };
const footerStyle = { textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '11px', fontWeight: 600 };

export default AccountantLayout;