import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUsers, FiDollarSign, FiShield, FiSettings, 
  FiActivity, FiArrowRight, FiLogOut, FiBell, FiPieChart 
} from 'react-icons/fi';

const AdminLandingPage = () => {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) setAdminName(user.fullName.split(' ')[0]);
  }, []);

  const menuItems = [
    { 
      title: "Master Registry", 
      desc: "Manage Advisors, Accountants & Staff Access", 
      icon: <FiUsers size={28}/>, 
      path: "/admin/dashboard", 
      color: "#2563eb" 
    },
    { 
      title: "Disbursement Pool", 
      desc: "Approve pending loans & verify field reports", 
      icon: <FiDollarSign size={28}/>, 
      path: "/admin/approvals", 
      color: "#10b981" 
    },
    { 
      title: "Security & Audit", 
      desc: "Check system logs & reset user passwords", 
      icon: <FiShield size={28}/>, 
      path: "/admin/users", 
      color: "#f59e0b" 
    },
    { 
      title: "Branch Analytics", 
      desc: "View collection reports & growth charts", 
      icon: <FiPieChart size={28}/>, 
      path: "/admin/stats", 
      color: "#8b5cf6" 
    }
  ];

  return (
    <div style={pageContainer}>
      {/* Background Glows */}
      <div style={blob1}></div>
      <div style={blob2}></div>

      <nav style={navBar}>
        <div style={logoSection}>
          <div style={logoIcon}><FiShield/></div>
          <span style={logoText}>D-FINANCE <small style={{fontSize: '10px', opacity: 0.6}}>v2.0</small></span>
        </div>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={logoutBtn}>
          <FiLogOut/> Sign Out
        </button>
      </nav>

      <main style={mainContent}>
        <div style={heroSection}>
          <h1 style={greeting}>Welcome back, <span style={{color: '#2563eb'}}>{adminName}!</span></h1>
          <p style={subGreeting}>Prayagraj Branch Command Center • {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        <div style={cardGrid}>
          {menuItems.map((item, index) => (
            <div 
              key={index} 
              style={cardStyle} 
              onClick={() => navigate(item.path)}
              className="admin-card"
            >
              <div style={{ ...iconCircle, backgroundColor: `${item.color}15`, color: item.color }}>
                {item.icon}
              </div>
              <div style={cardInfo}>
                <h3 style={cardTitle}>{item.title}</h3>
                <p style={cardDesc}>{item.desc}</p>
              </div>
              <div style={arrowBox}>
                <FiArrowRight />
              </div>
            </div>
          ))}
        </div>

        <div style={footerStats}>
          <div style={miniStat}><FiActivity color="#10b981"/> <span>System Status: <b>Online</b></span></div>
          <div style={miniStat}><FiBell color="#f59e0b"/> <span>Pending Tasks: <b>12</b></span></div>
        </div>
      </main>

      <style>{hoverEffect}</style>
    </div>
  );
};

// --- Styles ---
const pageContainer = {
  minHeight: '100vh', background: '#f8fafc', position: 'relative', overflow: 'hidden',
  fontFamily: '"Inter", sans-serif', padding: '0 5%'
};

const navBar = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
  padding: '30px 0', position: 'relative', zIndex: 10
};

const logoSection = { display: 'flex', alignItems: 'center', gap: '12px' };
const logoIcon = { width: '40px', height: '40px', background: '#0f172a', color: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' };
const logoText = { fontSize: '20px', fontWeight: '900', letterSpacing: '-1px' };

const logoutBtn = { 
  background: '#fff', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '12px',
  fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b'
};

const mainContent = { position: 'relative', zIndex: 10, marginTop: '40px' };
const heroSection = { marginBottom: '50px' };
const greeting = { fontSize: '48px', fontWeight: '900', letterSpacing: '-2px', margin: 0 };
const subGreeting = { fontSize: '14px', color: '#64748b', fontWeight: '700', marginTop: '10px', textTransform: 'uppercase', letterSpacing: '1px' };

const cardGrid = { 
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
  gap: '25px', marginBottom: '60px' 
};

const cardStyle = {
  background: '#fff', padding: '35px', borderRadius: '32px', border: '1px solid #fff',
  boxShadow: '0 20px 40px rgba(0,0,0,0.03)', cursor: 'pointer', transition: '0.4s all ease',
  display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative'
};

const iconCircle = { width: '70px', height: '70px', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const cardTitle = { fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: 0 };
const cardDesc = { fontSize: '13px', color: '#64748b', fontWeight: '500', lineHeight: '1.6' };
const arrowBox = { position: 'absolute', right: '35px', top: '35px', color: '#cbd5e1', fontSize: '20px' };

const footerStats = { display: 'flex', gap: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '30px' };
const miniStat = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' };

// Blobs for background design
const blob1 = { position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', background: 'rgba(37, 99, 235, 0.05)', filter: 'blur(100px)', borderRadius: '50%' };
const blob2 = { position: 'absolute', bottom: '0', left: '-10%', width: '400px', height: '400px', background: 'rgba(16, 185, 129, 0.05)', filter: 'blur(80px)', borderRadius: '50%' };

const hoverEffect = `
  .admin-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 30px 60px rgba(0,0,0,0.08);
    background: #0f172a;
  }
  .admin-card:hover h3 { color: #fff; }
  .admin-card:hover p { color: rgba(255,255,255,0.6); }
  .admin-card:hover svg { transform: scale(1.1); transition: 0.3s; }
`;

export default AdminLandingPage;