import React, { useState, useEffect, useCallback } from 'react';
import API from "../../api/axios";
import { 
  FiLock, FiUser, FiRefreshCw, FiShield, FiSearch, 
  FiToggleLeft, FiToggleRight, FiBriefcase, FiUsers, FiTrash2 
} from 'react-icons/fi';

const AdminApproval = () => {
  const [loans, setLoans] = useState([]);
  const [allUsers, setAllUsers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [masterMode, setMasterMode] = useState(false); 
  const [searchTerm, setSearchTerm] = useState("");

  // Local storage se current user ki details
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};

  // 1. Fetch Data: Loans aur Absolute User List
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [loansRes, usersRes] = await Promise.all([
        API.get('/admin/all-loans').catch(() => ({ data: [] })),
        // 🔥 Ye route backend mein User.find({}) hona chahiye (No filters)
        API.get('/admin/all-users-absolute').catch(() => ({ data: [] })) 
      ]);

      // Disbursement Queue (Normal Mode)
      const pending = loansRes.data.filter(loan => 
        ['Field Verified', 'Pending Verification', 'Pending Accountant Approval'].includes(loan.status)
      );
      
      setLoans(pending.reverse());
      setAllUsers(usersRes.data || []);
      
    } catch (err) {
      console.error("Atlas Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // 🔑 Global Password Change (For ANY User)
  const handleResetPassword = async (userId, name) => {
    const newPass = window.prompt(`Master Security: Set NEW password for ${name}:`);
    if (!newPass || newPass.length < 4) return alert("Error: Password too short!");

    try {
      const res = await API.post('/admin/change-password', { userId, newPassword: newPass });
      if (res.data.success) alert(`✅ Security Protocol: Password for ${name} updated!`);
    } catch (err) {
      alert("❌ Reset failed. Ensure backend /admin/change-password is active.");
    }
  };

  const handleApprove = async (loan) => {
    if (!window.confirm(`Disburse ₹${loan.netDisbursed} to ${loan.customerName}?`)) return;
    try {
      const res = await API.post(`/accountant/approve/${loan._id}`);
      if (res.data.success) { alert("✅ Disbursed!"); fetchData(); }
    } catch (err) { alert("Error: " + err.message); }
  };

  // Search Logic (Name, Mobile, or Role)
  const filteredUsers = allUsers.filter(u => 
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.mobile?.includes(searchTerm) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '25px', background: '#f8fafc', minHeight: '100vh' }}>
      
      {/* --- HEADER --- */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h2 style={{ margin: 0, color: '#0f172a', fontWeight: '900', fontSize: '28px', letterSpacing: '-1.5px' }}>
               {masterMode ? "🌐 MASTER USER CONTROL" : "🛡️ ADMIN AUTHORITY"}
            </h2>
            <p style={{ color: '#64748b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>
               {masterMode ? "Full System Access: Admins, Staff & Customers" : "Disbursement Queue & Verifications"}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              onClick={() => setMasterMode(!masterMode)} 
              style={{ ...modeBtn, background: masterMode ? '#ef4444' : '#0f172a', color: '#fff' }}
            >
              {masterMode ? <FiToggleRight size={22}/> : <FiToggleLeft size={22}/>}
              {masterMode ? "CLOSE MASTER" : "GO MASTER"}
            </button>
            <button onClick={fetchData} style={refreshBtn}><FiRefreshCw /></button>
          </div>
        </div>
      </div>

      {/* --- SEARCH (Only in Master Mode) --- */}
      {masterMode && (
        <div style={searchContainer}>
          <FiSearch color="#94a3b8" />
          <input 
            placeholder="Search by Name, Mobile or Role (Admin, Accountant, User)..." 
            style={searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {loading ? (
        <div style={loaderStyle}>READING MASTER DATABASE...</div>
      ) : (
        <div style={gridStyle}>
          
          {/* --- VIEW 1: MASTER MODE (Sare Users) --- */}
          {masterMode && filteredUsers.map((u) => {
            const isMe = u.mobile === currentUser.mobile;
            return (
              <div key={u._id} style={{...userCard, border: isMe ? '2.5px solid #2563eb' : '1.5px solid #0f172a'}}>
                <div style={cardHeader}>
                  <div style={roleBadge(u.role)}>
                    {u.role === 'Admin' ? <FiShield/> : u.role === 'Accountant' ? <FiBriefcase/> : <FiUser/>}
                    {u.role}
                  </div>
                  {isMe && <span style={meBadge}>YOU</span>}
                </div>
                
                <h3 style={{ margin: '15px 0 5px 0', fontSize: '18px', fontWeight: '900' }}>{u.fullName}</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '13px', fontWeight: 'bold' }}>📞 {u.mobile}</p>
                <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '10px' }}>ID: {u._id}</p>
                
                <div style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleResetPassword(u._id, u.fullName)} style={masterResetBtn}>
                     <FiLock /> Force Password Reset
                  </button>
                </div>
              </div>
            );
          })}

          {/* --- VIEW 2: DISBURSEMENT MODE (Pending Loans) --- */}
          {!masterMode && (loans.length > 0 ? loans.map((loan) => (
            <div key={loan._id} style={cardStyle}>
              <div style={cardHeader}>
                <span style={idBadge}>LOAN: {loan.loanId}</span>
                <span style={statusBadge(loan.status)}>{loan.status}</span>
              </div>

              <h3 style={nameStyle}>{loan.customerName}</h3>
              
              <div style={infoRow}>
                <div><label style={labelStyle}>PAYOUT</label><p style={{...valStyle, color: '#059669'}}>₹{loan.netDisbursed || 0}</p></div>
                <div style={{textAlign: 'right'}}><label style={labelStyle}>EMI</label><p style={valStyle}>₹{loan.weeklyEMI}</p></div>
              </div>

              <div style={advisorBox}>
                <p style={{ margin: 0, fontWeight: '700', fontSize: '12px' }}>📍 Verified: {loan.verifiedByName || "Officer"}</p>
                <button onClick={() => handleResetPassword(loan.customerId, loan.customerName)} style={quickPassBtn}>
                   <FiLock size={12}/> Pass
                </button>
              </div>

              <button 
                onClick={() => handleApprove(loan)} 
                style={{...approveBtn, opacity: loan.status.includes('Pending') ? 0.5 : 1}}
                disabled={loan.status.includes('Pending')}
              >
                {loan.status.includes('Pending') ? 'In Verification' : 'Confirm Disbursement'}
              </button>
            </div>
          )) : <div style={emptyStyle}>Disbursement Queue is Empty.</div>)}

        </div>
      )}
    </div>
  );
};

// --- STYLES ---
const headerStyle = { marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' };
const refreshBtn = { background: '#fff', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center' };
const modeBtn = { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px', borderRadius: '15px', fontSize: '12px', fontWeight: '900', cursor: 'pointer', border: 'none', transition: '0.3s' };
const searchContainer = { display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '18px 25px', borderRadius: '25px', marginBottom: '30px', border: '1.5px solid #e2e8f0' };
const searchInput = { border: 'none', outline: 'none', width: '100%', fontSize: '14px', fontWeight: 'bold', color: '#0f172a' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' };
const userCard = { background: '#fff', padding: '25px', borderRadius: '30px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' };
const meBadge = { background: '#2563eb', color: '#fff', padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '900' };
const masterResetBtn = { flex: 1, background: '#0f172a', color: '#fff', border: 'none', padding: '14px', borderRadius: '14px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' };
const roleBadge = (role) => ({
  display: 'flex', alignItems: 'center', gap: '6px', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', padding: '5px 12px', borderRadius: '12px',
  background: role === 'Admin' ? '#fee2e2' : role === 'Accountant' ? '#dbeafe' : '#f0fdf4',
  color: role === 'Admin' ? '#ef4444' : role === 'Accountant' ? '#2563eb' : '#16a34a'
});
const cardStyle = { background: '#fff', padding: '25px', borderRadius: '30px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const idBadge = { background: '#f1f5f9', padding: '6px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: '900', color: '#64748b' };
const statusBadge = (s) => ({ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', padding: '5px 12px', borderRadius: '20px', background: s.includes('Pending') ? '#fff7ed' : '#f0fdf4', color: s.includes('Pending') ? '#c2410c' : '#16a34a' });
const nameStyle = { fontSize: '22px', margin: '15px 0', color: '#0f172a', fontWeight: '900', letterSpacing: '-0.5px' };
const infoRow = { display: 'flex', justifyContent: 'space-between', background: '#f0fdf4', padding: '18px', borderRadius: '20px', marginBottom: '15px' };
const labelStyle = { fontSize: '9px', color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase' };
const valStyle = { fontSize: '20px', fontWeight: '900', margin: 0 };
const advisorBox = { background: '#f8fafc', padding: '15px', borderRadius: '18px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const quickPassBtn = { background: '#fff', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' };
const approveBtn = { width: '100%', padding: '18px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '18px', fontWeight: '900', cursor: 'pointer' };
const loaderStyle = { textAlign: 'center', padding: '100px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px' };
const emptyStyle = { textAlign: 'center', padding: '100px', background: '#fff', borderRadius: '32px', color: '#94a3b8', fontWeight: 'bold', gridColumn: '1/-1' };

export default AdminApproval;