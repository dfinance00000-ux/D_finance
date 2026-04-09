import React, { useState, useEffect, useCallback } from 'react';
import API from "../../api/axios";
import { 
  FiLock, FiUser, FiRefreshCw, FiShield, FiSearch, 
  FiToggleLeft, FiToggleRight, FiBriefcase, FiUsers, FiTrash2, FiX, FiActivity, FiExternalLink
} from 'react-icons/fi';

const AdminApproval = () => {
  const [loans, setLoans] = useState([]);
  const [allUsers, setAllUsers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [masterMode, setMasterMode] = useState(false); 
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserHistory, setSelectedUserHistory] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('user')) || {};

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [loansRes, usersRes] = await Promise.all([
        API.get('/admin/all-loans').catch(() => ({ data: [] })),
        API.get('/admin/all-users-absolute').catch(() => ({ data: [] })) 
      ]);

      // ✅ FIX: Filter ko thoda relax kiya hai taaki loans dikhne lagein
      // Agar status 'Disbursed' nahi hai, toh wo approval queue mein dikhega
      const pending = loansRes.data.filter(loan => loan.status !== 'Disbursed');
      
      setLoans(pending.reverse());
      setAllUsers(usersRes.data || []);
      console.log("Total Loans in State:", pending.length);
    } catch (err) {
      console.error("Atlas Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleResetPassword = async (userId, name) => {
    const newPass = window.prompt(`Master Security: Set NEW password for ${name}:`);
    if (!newPass || newPass.length < 4) return alert("Error: Password too short!");
    try {
      const res = await API.post('/admin/change-password', { userId, newPassword: newPass });
      if (res.data.success) alert(`✅ Security Protocol: Updated!`);
    } catch (err) { alert("❌ Reset failed."); }
  };

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`⚠️ DELETE PERMANENTLY: ${name}?`)) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      fetchData();
    } catch (err) { alert("Delete restricted: User has active records."); }
  };

  const handleApprove = async (loan) => {
    if (!window.confirm(`Disburse ₹${loan.netDisbursed} to ${loan.customerName}?`)) return;
    try {
      const res = await API.post(`/accountant/approve/${loan._id}`);
      if (res.data.success) { alert("✅ Disbursed!"); fetchData(); }
    } catch (err) { alert("Error: " + err.message); }
  };

  const filteredUsers = allUsers.filter(u => 
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.mobile?.includes(searchTerm)
  );

  return (
    <div style={{ padding: '25px', background: '#f8fafc', minHeight: '100vh' }}>
      
      {/* --- MASTER HEADER --- */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h2 style={{ margin: 0, color: '#0f172a', fontWeight: '900', fontSize: '28px', letterSpacing: '-1px' }}>
               {masterMode ? "🌐 MASTER CONTROL" : "🛡️ DISBURSEMENT"}
            </h2>
            <div style={{display: 'flex', gap: '15px', marginTop: '5px'}}>
                <span style={miniBadge}><FiActivity/> Loans: {loans.length}</span>
                <span style={miniBadge}><FiUsers/> Registry: {allUsers.length}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              onClick={() => setMasterMode(!masterMode)} 
              style={{ ...modeBtn, background: masterMode ? '#ef4444' : '#0f172a', color: '#fff' }}
            >
              {masterMode ? <FiToggleRight size={22}/> : <FiToggleLeft size={22}/>}
              {masterMode ? "EXIT MASTER" : "GO MASTER"}
            </button>
            <button onClick={fetchData} style={refreshBtn}><FiRefreshCw /></button>
          </div>
        </div>
      </div>

      {masterMode && (
        <div style={searchContainer}>
          <FiSearch color="#94a3b8" />
          <input placeholder="Search Registry..." style={searchInput} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      )}

      {loading ? (
        <div style={loaderStyle}>SYNCING WITH ATLAS...</div>
      ) : (
        <div style={gridStyle}>
          
          {/* --- VIEW 1: MASTER MODE --- */}
          {masterMode && filteredUsers.map((u) => {
            const isMe = u.mobile === currentUser.mobile;
            return (
              <div key={u._id} style={{...userCard, border: isMe ? '2.5px solid #2563eb' : '1px solid #e2e8f0'}}>
                <div style={cardHeader}>
                  <div style={roleBadge(u.role)}>{u.role}</div>
                  <div style={{display: 'flex', gap: '8px'}}>
                    <button onClick={() => handleResetPassword(u._id, u.fullName)} style={iconBtn}><FiLock /></button>
                    {!isMe && <button onClick={() => handleDeleteUser(u._id, u.fullName)} style={{...iconBtn, color: '#ef4444'}}><FiTrash2 /></button>}
                  </div>
                </div>
                
                <h3 style={nameStyle}>{u.fullName} {isMe && "⭐"}</h3>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '13px', fontWeight: 'bold' }}>📞 {u.mobile}</p>
                    <button onClick={() => {
                        const history = loans.filter(l => l.customerId === u._id);
                        setSelectedUserHistory({...u, records: history});
                    }} style={historyLink}>View History <FiExternalLink/></button>
                </div>
              </div>
            );
          })}

          {/* --- VIEW 2: LOAN QUEUE --- */}
          {!masterMode && loans.length > 0 ? loans.map((loan) => (
            <div key={loan._id} style={cardStyle}>
              <div style={cardHeader}>
                <span style={idBadge}>ID: {loan.loanId}</span>
                <span style={statusBadge(loan.status)}>{loan.status}</span>
              </div>
              <h3 style={nameStyle}>{loan.customerName}</h3>
              <div style={infoRow}>
                <div><label style={labelStyle}>PRINCIPAL</label><p style={valStyle}>₹{loan.amount}</p></div>
                <div style={{textAlign: 'right'}}><label style={labelStyle}>PAYOUT</label><p style={{...valStyle, color: '#059669'}}>₹{loan.netDisbursed}</p></div>
              </div>
              <div style={miniStatsRow}>
                  <span>EMI: ₹{loan.weeklyEMI}</span>
                  <span>Weeks: {loan.totalWeeks}</span>
              </div>
              <button onClick={() => handleApprove(loan)} style={approveBtn}>Disburse Now</button>
            </div>
          )) : !masterMode && <div style={emptyStyle}>No active loans found in queue.</div>}
        </div>
      )}

      {/* --- HISTORY MODAL --- */}
      {selectedUserHistory && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
              <h3 style={{margin: 0, fontWeight: 900}}>Registry Profile</h3>
              <FiX onClick={() => setSelectedUserHistory(null)} style={{cursor: 'pointer'}} size={24}/>
            </div>
            <div style={historyMeta}>
                <div style={avatar}>{selectedUserHistory.fullName.charAt(0)}</div>
                <div>
                    <h4 style={{margin: 0}}>{selectedUserHistory.fullName}</h4>
                    <p style={{margin: 0, fontSize: '12px', color: '#94a3b8'}}>{selectedUserHistory.role} • {selectedUserHistory.mobile}</p>
                </div>
            </div>
            <div style={historyList}>
                <p style={labelStyle}>Linked Loan Records</p>
                {selectedUserHistory.records?.length > 0 ? selectedUserHistory.records.map(r => (
                    <div key={r._id} style={historyItem}>
                        <span>{r.loanId}</span>
                        <span style={{fontWeight: 900}}>₹{r.amount}</span>
                        <span style={{fontSize: '10px', opacity: 0.6}}>{r.status}</span>
                    </div>
                )) : <p style={{textAlign: 'center', padding: '20px', color: '#cbd5e1'}}>No history available.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- STYLES ---
const headerStyle = { marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' };
const miniBadge = { fontSize: '10px', fontWeight: 'bold', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px', background: '#fff', padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' };
const refreshBtn = { background: '#fff', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '15px', cursor: 'pointer' };
const modeBtn = { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px', borderRadius: '15px', fontSize: '11px', fontWeight: '900', cursor: 'pointer', border: 'none' };
const searchContainer = { display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '18px 25px', borderRadius: '25px', marginBottom: '30px', border: '1.5px solid #e2e8f0' };
const searchInput = { border: 'none', outline: 'none', width: '100%', fontSize: '14px', fontWeight: 'bold' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' };
const userCard = { background: '#fff', padding: '25px', borderRadius: '30px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' };
const roleBadge = (r) => ({ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', padding: '5px 12px', borderRadius: '10px', background: r === 'Admin' ? '#fee2e2' : '#f0fdf4', color: r === 'Admin' ? '#ef4444' : '#10b981' });
const iconBtn = { background: '#f8fafc', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer' };
const nameStyle = { fontSize: '22px', margin: '0 0 10px 0', color: '#0f172a', fontWeight: '900', letterSpacing: '-1px' };
const historyLink = { border: 'none', background: 'none', color: '#2563eb', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' };

const cardStyle = { background: '#fff', padding: '25px', borderRadius: '30px', border: '1px solid #f1f5f9' };
const idBadge = { background: '#f1f5f9', padding: '6px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: '900', color: '#64748b' };
const statusBadge = (s) => ({ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', padding: '5px 12px', borderRadius: '20px', background: s.includes('Disbursed') ? '#f0fdf4' : '#fff7ed', color: s.includes('Disbursed') ? '#16a34a' : '#c2410c' });
const infoRow = { display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '15px', borderRadius: '20px', marginBottom: '15px' };
const labelStyle = { fontSize: '10px', color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase' };
const valStyle = { fontSize: '18px', fontWeight: '900', margin: 0 };
const miniStatsRow = { display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '20px', padding: '0 5px' };
const approveBtn = { width: '100%', padding: '18px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '18px', fontWeight: '900', cursor: 'pointer' };

const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContent = { background: '#fff', width: '90%', maxWidth: '450px', borderRadius: '40px', padding: '35px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' };
const historyMeta = { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' };
const avatar = { width: '50px', height: '50px', background: '#0f172a', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '900' };
const historyList = { maxHeight: '250px', overflowY: 'auto' };
const historyItem = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', background: '#f8fafc', borderRadius: '12px', marginBottom: '8px' };

const loaderStyle = { textAlign: 'center', padding: '100px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px' };
const emptyStyle = { textAlign: 'center', padding: '100px', color: '#94a3b8', fontWeight: 'bold', gridColumn: '1/-1' };

export default AdminApproval;