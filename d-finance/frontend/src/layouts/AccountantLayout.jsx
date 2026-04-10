import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiCheckCircle, FiBarChart, FiDownload, FiLogOut, 
  FiCreditCard, FiShield, FiActivity, FiMenu, FiX 
} from 'react-icons/fi';

const AccountantLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', position: 'relative' }}>
      
      {/* --- Sidebar Overlay for Mobile --- */}
      {isMobileMenuOpen && (
        <div 
          style={overlayStyle} 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      {/* --- Accountant Premium Sidebar --- */}
      <div style={{
        ...sidebarStyle,
        left: isMobileMenuOpen ? '0' : '-300px', // Mobile toggle logic
      }} className="sidebar-transition">
        <div style={brandBox}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={brandTitle}>D-FINANCE</h2>
            <button 
              onClick={() => setIsMobileMenuOpen(false)} 
              style={closeMenuBtn}
            >
              <FiX size={20} />
            </button>
          </div>
          <span style={roleBadge}>Accountant Portal</span>
        </div>
        
        <nav style={navStyle}>
          <p style={navLabel}>Main Menu</p>
          
          <Link 
            to="/accountant/approval" 
            onClick={() => setIsMobileMenuOpen(false)}
            style={isActive('/accountant/approval') ? activeLink : linkStyle}
          >
            <FiCheckCircle size={18} /> Final Auth Queue
          </Link>

          <Link 
            to="/accountant/payment-approval" 
            onClick={() => setIsMobileMenuOpen(false)}
            style={isActive('/accountant/payment-approval') ? activeLink : linkStyle}
          >
            <FiCreditCard size={18} /> EMI Approval
          </Link>

          <Link 
            to="/accountant/reports" 
            onClick={() => setIsMobileMenuOpen(false)}
            style={isActive('/accountant/reports') ? activeLink : linkStyle}
          >
            <FiBarChart size={18} /> Reports
          </Link>
          
          <Link 
            to="/accountant/bulk-data" 
            onClick={() => setIsMobileMenuOpen(false)}
            style={isActive('/accountant/bulk-data') ? activeLink : linkStyle}
          >
            <FiDownload size={18} /> Bulk Data
          </Link>
          
          <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
            <button onClick={handleLogout} style={logoutBtn}>
              <FiLogOut /> Logout System
            </button>
          </div>
        </nav>
      </div>

      {/* --- Main Content Area --- */}
      <div style={mainAreaStyle}>
        
        <header style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Hamburger for Mobile */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)} 
              style={hamburgerBtn}
            >
              <FiMenu size={24} />
            </button>

            <div style={userAvatar} className="hide-mobile">
              <FiShield size={24} color="#059669" />
            </div>
            <div>
              <h3 style={headerUserText}>Hi, {user?.fullName?.split(' ')[0]}</h3>
              <small style={headerSubText} className="hide-mobile">Mathura Branch | Finance Head</small>
            </div>
          </div>

          <div style={statusBadge}>
            <FiActivity className="pulse" /> <span className="hide-mobile">System Online</span>
          </div>
        </header>
        
        <main style={contentBox}>
          <Outlet />
        </main>

        <footer style={footerStyle}>
          © 2026 D-Finance Ledger | Mathura Branch
        </footer>
      </div>

      <style>{`
        .pulse { animation: pulse-red 2s infinite; margin-right: 5px; }
        @keyframes pulse-red { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        
        .sidebar-transition {
          transition: all 0.3s ease-in-out;
        }

        @media (max-width: 900px) {
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
};

// --- Styles ---
const sidebarStyle = { 
  width: '300px', 
  background: '#0f172a', 
  color: '#fff', 
  display: 'flex', 
  flexDirection: 'column',
  boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
  position: 'fixed',
  height: '100vh',
  zIndex: 1001,
  // Initial left value handled in component
};

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.5)',
  backdropFilter: 'blur(4px)',
  zIndex: 1000
};

const mainAreaStyle = { 
  flex: 1, 
  padding: '20px', 
  overflowY: 'auto',
  marginLeft: '0', // Default for mobile
  // Desktop adjustments via media query would be better, 
  // but using responsive inline logic here:
  '@media (min-width: 901px)': { marginLeft: '300px' } 
};

// Update mainAreaStyle logic for desktop padding
if (typeof window !== 'undefined' && window.innerWidth > 900) {
  sidebarStyle.left = '0';
  mainAreaStyle.paddingLeft = '320px';
}

const brandBox = { padding: '30px 20px', textAlign: 'center', borderBottom: '1px solid #1e293b' };
const brandTitle = { color: '#10b981', margin: 0, fontSize: '22px', fontWeight: 900, letterSpacing: '1px' };
const roleBadge = { fontSize: '9px', background: '#059669', padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', fontWeight: 900, marginTop: '8px', display: 'inline-block' };

const navStyle = { display: 'flex', flexDirection: 'column', gap: '8px', padding: '20px', flex: 1 };
const navLabel = { fontSize: '10px', color: '#475569', textTransform: 'uppercase', fontWeight: 800, marginBottom: '5px', letterSpacing: '1px' };

const linkStyle = { 
  display: 'flex', alignItems: 'center', gap: '12px', color: '#94a3b8', 
  textDecoration: 'none', padding: '12px 16px', borderRadius: '12px', 
  fontSize: '14px', fontWeight: 600, transition: '0.3s' 
};

const activeLink = { 
  ...linkStyle, background: '#1e293b', color: '#fff', borderLeft: '4px solid #10b981' 
};

const logoutBtn = { 
  width: '100%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', 
  border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', 
  borderRadius: '12px', cursor: 'pointer', fontWeight: 800, 
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
};

const headerStyle = { 
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
  background: '#fff', padding: '15px 20px', borderRadius: '18px', 
  marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9'
};

const headerUserText = { margin: 0, color: '#0f172a', fontWeight: 800, fontSize: '16px' };
const headerSubText = { color: '#64748b', fontWeight: 600, fontSize: '12px' };
const hamburgerBtn = { background: 'none', border: 'none', color: '#0f172a', cursor: 'pointer', display: window.innerWidth > 900 ? 'none' : 'block' };
const closeMenuBtn = { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: window.innerWidth > 900 ? 'none' : 'block' };

const userAvatar = { width: '40px', height: '40px', background: '#ecfdf5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const statusBadge = { background: '#dcfce7', color: '#166534', padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center' };
const contentBox = { background: '#fff', padding: '20px', borderRadius: '20px', minHeight: '70vh', border: '1px solid #f1f5f9' };
const footerStyle = { textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '10px', fontWeight: 600 };

export default AccountantLayout;