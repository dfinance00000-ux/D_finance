import React, { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios'; // Naya Axios instance use karein

const LoanTracking = () => {
  const [loans, setLoans] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  
  // LocalStorage se user nikalna
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const fetchLoans = useCallback(async () => {
    if (!user.id && !user._id) return;
    try {
      // Atlas Backend API call
      const response = await API.get(`/loans?customerId=${user.id || user._id}`);
      
      // Latest applications ko upar dikhane ke liye
      setLoans(response.data.reverse());
    } catch (error) {
      console.error("Tracking Sync Error:", error);
    } finally {
      setLoading(false);
    }
  }, [user.id, user._id]);

  useEffect(() => {
    fetchLoans();
    // Real-time update check every 10 seconds
    const interval = setInterval(fetchLoans, 10000);
    return () => clearInterval(interval);
  }, [fetchLoans]);

  const filteredLoans = loans.filter(loan => 
    (loan.loanId || loan.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (loan.type || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Approved': return { bg: '#dcfce7', text: '#166534', icon: '✅', label: 'Funds Disbursed' };
      case 'Rejected': return { bg: '#fee2e2', text: '#991b1b', icon: '❌', label: 'Application Rejected' };
      case 'Field Verified': return { bg: '#e0f2fe', text: '#0369a1', icon: '🛡️', label: 'QC Audit Pending' };
      case 'Closed': return { bg: '#f1f5f9', text: '#475569', icon: '🏁', label: 'Loan Settled' };
      default: return { bg: '#fef3c7', text: '#92400e', icon: '⏳', label: 'Verification Pending' };
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={headerSection}>
        <div>
          <h2 style={{ color: '#0f172a', margin: 0, fontWeight: '900' }}>📡 LOAN TRACKING</h2>
          <p style={{ color: '#64748b', fontSize: '12px' }}>Real-time status of your weekly micro-loan applications.</p>
        </div>
        <input 
          type="text" 
          placeholder="Search Loan ID or Type..." 
          style={searchBar} 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={messageBox}>🔄 Syncing with Finance Cloud...</div>
      ) : filteredLoans.length === 0 ? (
        <div style={emptyState}>
          <h3>No Records Found</h3>
          <p>Your applications will appear here after submission.</p>
        </div>
      ) : (
        <div style={gridContainer}>
          {filteredLoans.map((loan) => {
            const style = getStatusStyle(loan.status);
            return (
              <div key={loan._id || loan.id} style={loanCard}>
                <div style={cardHeader}>
                  <span style={loanIdTag}>ID: {loan.loanId || loan.id}</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ ...statusBadge, background: style.bg, color: style.text }}>
                      {style.icon} {style.label}
                    </span>
                  </div>
                </div>
                
                <div style={cardBody}>
                   <div style={mainInfo}>
                      <label style={infoLabel}>TOTAL LOAN</label>
                      <h2 style={{ margin: 0, color: '#0f172a', fontWeight: '900' }}>₹{Number(loan.amount).toLocaleString()}</h2>
                   </div>

                   <div style={emiHighlight}>
                      <label style={{...infoLabel, color: '#059669'}}>WEEKLY EMI</label>
                      <h3 style={{ margin: 0, color: '#059669', fontWeight: '900' }}>₹{loan.weeklyEMI || '---'}</h3>
                   </div>
                </div>

                <div style={detailsGrid}>
                  <div style={infoGroup}>
                    <label style={infoLabel}>NET TO RECEIVE</label>
                    <span style={infoValue}>₹{loan.netDisbursed || '---'}</span>
                  </div>
                  <div style={infoGroup}>
                    <label style={infoLabel}>TENURE</label>
                    <span style={infoValue}>{loan.totalWeeks || loan.tenure} Weeks</span>
                  </div>
                  <div style={infoGroup}>
                    <label style={infoLabel}>NEXT DUE DATE</label>
                    <span style={{...infoValue, color: '#ef4444'}}>
                      {loan.nextEmiDate ? new Date(loan.nextEmiDate).toLocaleDateString() : 'TBD'}
                    </span>
                  </div>
                  <div style={infoGroup}>
                    <label style={infoLabel}>PURPOSE</label>
                    <span style={infoValue}>{loan.type}</span>
                  </div>
                </div>

                {loan.status === 'Approved' && (
                  <div style={alertBox}>
                    📢 Your funds are active. Keep balance for weekly auto-debits.
                  </div>
                )}

                <div style={cardFooter}>
                  <button style={detailBtn} onClick={() => alert("Schedule feature coming soon!")}>View Schedule</button>
                  {loan.status === 'Approved' && (
                    <button 
                      style={repayBtn} 
                      onClick={() => window.location.href='/customer/emi'}
                    >
                      Pay Weekly Due
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// --- Styles Update for Modern UI ---
const headerSection = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' };
const searchBar = { padding: '14px 20px', borderRadius: '14px', border: '1.5px solid #e2e8f0', width: '320px', outline: 'none', fontSize: '14px', fontWeight: '600' };
const gridContainer = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '25px' };
const loanCard = { background: '#fff', borderRadius: '24px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' };
const loanIdTag = { fontSize: '10px', fontWeight: '900', color: '#94a3b8', background: '#f8fafc', padding: '5px 10px', borderRadius: '8px' };
const statusBadge = { padding: '8px 14px', borderRadius: '12px', fontSize: '11px', fontWeight: '900' };
const cardBody = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '15px', borderRadius: '18px', marginBottom: '20px' };
const mainInfo = { display: 'flex', flexDirection: 'column' };
const emiHighlight = { textAlign: 'right', display: 'flex', flexDirection: 'column' };
const detailsGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' };
const infoGroup = { display: 'flex', flexDirection: 'column', gap: '2px' };
const infoLabel = { fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' };
const infoValue = { fontSize: '14px', fontWeight: '700', color: '#1e293b' };
const alertBox = { background: '#f0fdf4', color: '#166534', padding: '12px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #dcfce7', marginBottom: '20px' };
const cardFooter = { display: 'flex', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' };
const detailBtn = { flex: 1, padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '12px', fontWeight: '800', cursor: 'pointer', color: '#64748b' };
const repayBtn = { flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#059669', color: '#fff', fontSize: '12px', fontWeight: '800', cursor: 'pointer' };
const messageBox = { textAlign: 'center', padding: '40px', color: '#64748b' };
const emptyState = { textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '24px', border: '2px dashed #e2e8f0' };

export default LoanTracking;