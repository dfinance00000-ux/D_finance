import React, { useState, useEffect, useCallback } from 'react';
import API from "../../api/axios"; // Axios instance configured with baseURL

const AccountantApproval = () => {
  const [verifiedLoans, setVerifiedLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);

  // User details for personalized header
  const user = JSON.parse(localStorage.getItem('user')) || {};

  // --- FETCH DATA ---
  const fetchVerified = useCallback(async () => {
    setLoading(true);
    try {
      // 🚀 FIX: Directly use the endpoint. 
      // If your axios baseURL is '.../api', this will call '.../api/admin/all-loans'
      const res = await API.get('/admin/all-loans');
      
      // ✅ FILTERING: Sirf Advisor dwara verify ki gayi files (Field Verified)
      const pendingApproval = res.data.filter(loan => 
        loan.status === 'Field Verified' || loan.status === 'Verification Pending'
      );
      setVerifiedLoans(pendingApproval.reverse());
    } catch (err) {
      console.error("❌ Fetch error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVerified();
  }, [fetchVerified]);

  // --- APPROVAL LOGIC ---
  const handleAction = async (mongoId) => {
    const confirmMsg = `Authorize Funds Release?\n------------------\nCustomer: ${selectedLoan.customerName}\nNet Payout: ₹${selectedLoan.netDisbursed}`;
    
    if (!window.confirm(confirmMsg)) return;

    try {
      // 🚀 FIX: Relative path to avoid /api/api
      const res = await API.post(`/accountant/approve/${mongoId}`);

      if (res.data.success || res.status === 200) {
        alert("✅ Loan Disbursed Successfully!");
        setSelectedLoan(null);
        fetchVerified(); // Refresh list
      }
    } catch (err) {
      alert("❌ Deployment Sync Error: " + (err.response?.data?.error || "Check if backend route /api/accountant/approve exists"));
    }
  };

  if (loading) return <div style={loaderStyle}>🔄 SYNCING WITH D-FINANCE CLOUD...</div>;

  return (
    <div style={{ padding: '30px', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header Area */}
      <div style={headerSection}>
        <div>
          <h2 style={{ color: '#0f172a', margin: 0, fontWeight: '900', letterSpacing: '-1.5px', fontSize: '28px' }}>🛡️ DISBURSEMENT CONTROL</h2>
          <p style={{ color: '#64748b', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', marginTop: '5px' }}>
            Officer: {user.fullName} | Branch: Mathura
          </p>
        </div>
        <button onClick={fetchVerified} style={refreshBtn}>🔄 Refresh Pool</button>
      </div>

      {verifiedLoans.length === 0 ? (
        <div style={emptyState}>
          <div style={{fontSize: '50px', marginBottom: '20px'}}>📂</div>
          <h3 style={{margin: 0, color: '#1e293b'}}>Queue is Empty</h3>
          <p style={{color: '#94a3b8', fontSize: '14px'}}>Verified LUC reports will appear here automatically.</p>
        </div>
      ) : (
        <div style={grid}>
          {verifiedLoans.map(loan => (
            <div key={loan._id} style={card}>
              <div style={cardHeader}>
                <span style={idBadge}>ID: {loan.loanId || 'NEW'}</span>
                <span style={statusTag}>{loan.status}</span>
              </div>
              <h3 style={nameStyle}>{loan.customerName}</h3>
              
              <div style={miniStats}>
                <div style={statItem}><span>PRINCIPAL</span><br/><b>₹{loan.amount}</b></div>
                <div style={statItem}><span>NET PAYABLE</span><br/><b style={{color: '#059669'}}>₹{loan.netDisbursed || 0}</b></div>
              </div>

              <button onClick={() => setSelectedLoan(loan)} style={reviewBtn}>Audit & Release</button>
            </div>
          ))}
        </div>
      )}

      {/* --- RE-STYLED AUDIT MODAL --- */}
      {selectedLoan && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={modalHeader}>
              <h3 style={{ margin: 0 }}>Final Audit: {selectedLoan.customerName}</h3>
              <button onClick={() => setSelectedLoan(null)} style={closeBtn}>✕</button>
            </div>

            <div style={modalBody}>
              <div style={disbursementBox}>
                <div style={sumGrid}>
                  <div><span style={tinyLabel}>NET TO DISBURSE</span><br/><b style={{color: '#059669', fontSize: '26px'}}>₹{selectedLoan.netDisbursed}</b></div>
                  <div style={{textAlign: 'right'}}><span style={tinyLabel}>RECOVERY/WEEK</span><br/><b style={{color: '#2563eb', fontSize: '26px'}}>₹{selectedLoan.weeklyEMI}</b></div>
                </div>
              </div>

              <div style={detailGrid}>
                  <p><b>Mobile:</b> {selectedLoan.customerMobile || 'N/A'}</p>
                  <p><b>House Type:</b> {selectedLoan.houseType || 'N/A'}</p>
                  <p><b>Area:</b> {selectedLoan.areaType || 'N/A'}</p>
                  <p><b>Advisor:</b> {selectedLoan.advisorName || 'Direct'}</p>
              </div>
            </div>

            <div style={modalFooter}>
              <button onClick={() => setSelectedLoan(null)} style={cancelBtn}>Hold</button>
              <button onClick={() => handleAction(selectedLoan._id)} style={approveBtn}>Authenticate & Disburse</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Styles (Modern Fintech Theme) ---
const headerSection = { marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px' };
const refreshBtn = { background: '#fff', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '12px', fontSize: '12px', fontWeight: '900', cursor: 'pointer', color: '#475569' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' };
const card = { background: '#fff', padding: '25px', borderRadius: '28px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.02)' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' };
const idBadge = { background: '#0f172a', padding: '5px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold', color: '#fff' };
const statusTag = { fontSize: '10px', fontWeight: '900', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' };
const nameStyle = { margin: '0 0 20px 0', color: '#1e293b', fontSize: '22px', fontWeight: '900', letterSpacing: '-0.5px' };
const miniStats = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', padding: '20px', background: '#f8fafc', borderRadius: '20px', marginBottom: '20px' };
const statItem = { fontSize: '10px', color: '#94a3b8', fontWeight: 'bold' };
const reviewBtn = { width: '100%', padding: '16px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '16px', cursor: 'pointer', fontWeight: '900', textTransform: 'uppercase' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' };
const modalContent = { background: '#fff', borderRadius: '32px', width: '90%', maxWidth: '500px', overflow: 'hidden' };
const modalHeader = { padding: '25px', background: '#0f172a', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const modalBody = { padding: '30px' };
const disbursementBox = { background: '#f0fdf4', padding: '25px', borderRadius: '24px', border: '1px solid #dcfce7', marginBottom: '25px' };
const sumGrid = { display: 'flex', justifyContent: 'space-between' };
const tinyLabel = { fontSize: '10px', color: '#059669', fontWeight: '900' };
const detailGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '13px', color: '#64748b' };
const modalFooter = { padding: '25px', display: 'flex', gap: '15px', background: '#f8fafc' };
const approveBtn = { flex: 2, padding: '18px', background: '#059669', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: '900', cursor: 'pointer' };
const cancelBtn = { flex: 1, padding: '18px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '16px', fontWeight: '900', cursor: 'pointer' };
const closeBtn = { background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' };
const emptyState = { textAlign: 'center', padding: '100px 20px', background: '#fff', borderRadius: '40px', border: '2px dashed #cbd5e1', gridColumn: '1 / -1' };
const loaderStyle = { textAlign: 'center', marginTop: '100px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px' };

export default AccountantApproval;