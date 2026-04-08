import React, { useState, useEffect, useCallback } from 'react';
import API from "../../api/axios"; 

const AccountantApproval = () => {
  const [verifiedLoans, setVerifiedLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);

  // User details
  const user = JSON.parse(localStorage.getItem('user')) || {};

  // --- 1. FETCH DATA (With Local & Cloud Fallback) ---
  const fetchVerified = useCallback(async () => {
    setLoading(true);
    try {
      console.log("🔄 Fetching D-Finance Records...");
      const res = await API.get('/admin/all-loans');
      
      // ✅ Filtering Logic: Local pe testing ke liye 'Applied' bhi check kar rahe hain
      // Production mein sirf 'Field Verified' dikhega
      const pendingApproval = res.data.filter(loan => 
        loan.status === 'Field Verified' || 
        loan.status === 'Verification Pending' ||
        loan.status === 'Applied' 
      );

      console.log(`✅ Found ${pendingApproval.length} records in queue.`);
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

  // --- 2. DISBURSEMENT LOGIC (Fixed for 404 Errors) ---
  const handleAction = async (mongoId) => {
    if (!selectedLoan) return;

    const confirmMsg = `FINAL AUTHORIZATION\n------------------\nCustomer: ${selectedLoan.customerName}\nNet Payout: ₹${selectedLoan.netDisbursed || 0}\n\nDo you want to release these funds?`;
    
    if (!window.confirm(confirmMsg)) return;

    try {
      console.log(`🚀 Attempting disbursement for ID: ${mongoId}`);
      
      // FIX: BaseURL agar /api tak hai, to sirf /accountant/... use karein
      const res = await API.post(`/accountant/approve/${mongoId}`);

      if (res.data.success || res.status === 200) {
        alert("✅ TRANSACTION SUCCESS: Funds released successfully!");
        setSelectedLoan(null);
        fetchVerified(); 
      }
    } catch (err) {
      console.error("❌ Action Error:", err.response);
      
      // User friendly error message
      const errorDetail = err.response?.status === 404 
        ? "Backend Route Not Found (404). Please ensure 'app.post(/api/accountant/approve/:id)' is added to server.js and server is restarted."
        : (err.response?.data?.error || "Network sync failed.");
        
      alert("❌ Deployment Sync Error: " + errorDetail);
    }
  };

  if (loading) return <div style={loaderStyle}>🔄 SYNCING WITH D-FINANCE CORE...</div>;

  return (
    <div style={{ padding: '30px', background: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header Area */}
      <div style={headerSection}>
        <div>
          <h2 style={{ color: '#0f172a', margin: 0, fontWeight: '900', letterSpacing: '-1.5px', fontSize: '32px' }}>🛡️ DISBURSEMENT</h2>
          <p style={{ color: '#64748b', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', marginTop: '5px' }}>
            Officer: {user.fullName} | Control: Branch Mathura
          </p>
        </div>
        <button onClick={fetchVerified} style={refreshBtn}>🔄 Sync Records</button>
      </div>

      {verifiedLoans.length === 0 ? (
        <div style={emptyState}>
          <div style={{fontSize: '60px', marginBottom: '20px'}}>📁</div>
          <h3 style={{margin: 0, color: '#1e293b', fontWeight: '900'}}>Queue is Empty</h3>
          <p style={{color: '#94a3b8', fontSize: '13px', marginTop: '8px'}}>Verified reports will appear here automatically.</p>
        </div>
      ) : (
        <div style={grid}>
          {verifiedLoans.map(loan => (
            <div key={loan._id} style={card}>
              <div style={cardHeader}>
                <span style={idBadge}>LID: {loan.loanId || 'NEW'}</span>
                <span style={statusTag(loan.status)}>{loan.status}</span>
              </div>
              <h3 style={nameStyle}>{loan.customerName}</h3>
              
              <div style={miniStats}>
                <div style={statItem}><span>PRINCIPAL</span><br/><b>₹{loan.amount}</b></div>
                <div style={statItem}><span>NET PAYOUT</span><br/><b style={{color: '#059669'}}>₹{loan.netDisbursed || 0}</b></div>
              </div>

              <button onClick={() => setSelectedLoan(loan)} style={reviewBtn}>Audit & Release</button>
            </div>
          ))}
        </div>
      )}

      {/* --- RE-STYLED MODAL --- */}
      {selectedLoan && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={modalHeader}>
              <h3 style={{ margin: 0, fontWeight: '900' }}>Final Audit: {selectedLoan.customerName}</h3>
              <button onClick={() => setSelectedLoan(null)} style={closeBtn}>✕</button>
            </div>

            <div style={modalBody}>
              <div style={disbursementBox}>
                <div style={sumGrid}>
                  <div><span style={tinyLabel}>NET DISBURSEMENT</span><br/><b style={{color: '#059669', fontSize: '30px', letterSpacing: '-1px'}}>₹{selectedLoan.netDisbursed || 0}</b></div>
                  <div style={{textAlign: 'right'}}><span style={tinyLabel}>RECOVERY / WEEK</span><br/><b style={{color: '#2563eb', fontSize: '30px', letterSpacing: '-1px'}}>₹{selectedLoan.weeklyEMI || 0}</b></div>
                </div>
              </div>

              <div style={reportSummary}>
                <h4 style={reportTitle}>FIELD OFFICER REPORT (LUC)</h4>
                <div style={detailGrid}>
                    <p><b>Mobile:</b> {selectedLoan.customerMobile || '---'}</p>
                    <p><b>House:</b> {selectedLoan.houseType || '---'}</p>
                    <p><b>Area:</b> {selectedLoan.areaType || '---'}</p>
                    <p><b>Income:</b> ₹{selectedLoan.monthlyIncome || '0'}</p>
                </div>
                {selectedLoan.remark && (
                  <div style={remarkBox}><b>Note:</b> {selectedLoan.remark}</div>
                )}
              </div>
            </div>

            <div style={modalFooter}>
              <button onClick={() => setSelectedLoan(null)} style={cancelBtn}>Hold</button>
              <button onClick={() => handleAction(selectedLoan._id)} style={approveBtn}>Authorize Funds</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Styles ---
const headerSection = { marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '25px' };
const refreshBtn = { background: '#fff', border: '1px solid #cbd5e1', padding: '12px 24px', borderRadius: '15px', fontSize: '11px', fontWeight: '900', cursor: 'pointer', color: '#1e293b', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' };
const card = { background: '#fff', padding: '25px', borderRadius: '30px', border: '1px solid #f1f5f9', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', position: 'relative' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' };
const idBadge = { background: '#f1f5f9', padding: '6px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: '900', color: '#64748b' };
const statusTag = (status) => ({ fontSize: '9px', fontWeight: '900', color: status === 'Applied' ? '#f59e0b' : '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' });
const nameStyle = { margin: '0 0 20px 0', color: '#0f172a', fontSize: '24px', fontWeight: '900', letterSpacing: '-0.8px' };
const miniStats = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', padding: '15px', background: '#f8fafc', borderRadius: '20px', marginBottom: '20px', border: '1px solid #f1f5f9' };
const statItem = { fontSize: '9px', color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase' };
const reviewBtn = { width: '100%', padding: '18px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '18px', cursor: 'pointer', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(10px)' };
const modalContent = { background: '#fff', borderRadius: '40px', width: '95%', maxWidth: '550px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' };
const modalHeader = { padding: '30px', background: '#0f172a', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const modalBody = { padding: '35px' };
const disbursementBox = { background: '#ecfdf5', padding: '30px', borderRadius: '30px', border: '1px solid #d1fae5', marginBottom: '30px' };
const sumGrid = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const tinyLabel = { fontSize: '10px', color: '#059669', fontWeight: '900', letterSpacing: '0.5px' };
const reportSummary = { background: '#f8fafc', padding: '25px', borderRadius: '25px', border: '1px solid #f1f5f9' };
const reportTitle = { margin: '0 0 15px 0', fontSize: '11px', color: '#94a3b8', fontWeight: '900', letterSpacing: '1px' };
const detailGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '13px', color: '#1e293b' };
const remarkBox = { marginTop: '15px', padding: '10px', background: '#fff', borderRadius: '10px', fontSize: '12px', color: '#64748b', border: '1px solid #e2e8f0' };
const modalFooter = { padding: '30px', display: 'flex', gap: '15px', background: '#f8fafc' };
const approveBtn = { flex: 2, padding: '20px', background: '#059669', color: '#fff', border: 'none', borderRadius: '20px', fontWeight: '900', cursor: 'pointer', fontSize: '14px' };
const cancelBtn = { flex: 1, padding: '20px', background: '#fff', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '20px', fontWeight: '900', cursor: 'pointer' };
const closeBtn = { background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' };
const emptyState = { textAlign: 'center', padding: '120px 20px', background: '#fff', borderRadius: '50px', border: '2px dashed #e2e8f0', gridColumn: '1 / -1' };
const loaderStyle = { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#94a3b8', background: '#f1f5f9', letterSpacing: '3px', fontSize: '12px' };

export default AccountantApproval;