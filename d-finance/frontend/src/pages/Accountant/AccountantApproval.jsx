import React, { useState, useEffect, useCallback } from 'react';
import API from "../../../api/axios"; // Hamara common axios instance

const AccountantApproval = () => {
  const [verifiedLoans, setVerifiedLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);

  // User details for personalized header
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const fetchVerified = useCallback(async () => {
    setLoading(true);
    try {
      // 🚀 Fix: Axios instance already has /api and token, so just use relative path
      const res = await API.get('/admin/all-loans');
      
      // ✅ LOGIC: Accountant sirf 'Field Verified' files ko hi dekhega
      const pendingApproval = res.data.filter(loan => 
        loan.status === 'Field Verified' || loan.status === 'Verification Pending'
      );
      setVerifiedLoans(pendingApproval.reverse());
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVerified();
  }, [fetchVerified]);

  const handleAction = async (mongoId, action) => {
    const isApprove = action === 'APPROVE';
    
    if (isApprove) {
        const confirmMsg = `Confirm Disbursement?\n------------------\nCustomer: ${selectedLoan.customerName}\nNet To Pay: ₹${selectedLoan.netDisbursed}`;
        if (!window.confirm(confirmMsg)) return;
    }

    try {
      // 🚀 Fix: Role-based approval route call
      const res = await API.post(`/accountant/approve/${mongoId}`);

      if (res.data.success || res.status === 200) {
        alert(`Loan ${isApprove ? 'Disbursed' : 'Rejected'} Successfully!`);
        setSelectedLoan(null);
        fetchVerified();
      }
    } catch (err) {
      alert("Action Failed: " + (err.response?.data?.error || "Server Error"));
    }
  };

  if (loading) return <div style={loaderStyle}>🔄 Syncing D-Finance Core...</div>;

  return (
    <div style={{ padding: '30px', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={headerSection}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ color: '#0f172a', margin: 0, fontWeight: '900', letterSpacing: '-1px' }}>🛡️ DISBURSEMENT AUDIT</h2>
            <p style={{ color: '#64748b', fontSize: '13px', fontWeight: 'bold' }}>Active Session: {user.fullName} (Accountant)</p>
          </div>
          <button onClick={fetchVerified} style={refreshBtn}>Refresh Pool</button>
        </div>
      </div>

      {verifiedLoans.length === 0 ? (
        <div style={emptyState}>
          <p style={{fontSize: '40px'}}>✅</p>
          <p style={{fontWeight: '900', color: '#1e293b'}}>No loans pending for final authentication.</p>
          <small>Status: Verified reports will appear here after Advisor submission.</small>
        </div>
      ) : (
        <div style={grid}>
          {verifiedLoans.map(loan => (
            <div key={loan._id} style={card}>
              <div style={cardHeader}>
                <span style={idBadge}>LID: {loan.loanId || 'PENDING'}</span>
                <span style={statusTag}>{loan.status}</span>
              </div>
              <h3 style={nameStyle}>{loan.customerName}</h3>
              
              <div style={miniStats}>
                <div style={statItem}><span>SANCTIONED</span><br/><b>₹{loan.amount}</b></div>
                <div style={statItem}><span>NET DISBURSE</span><br/><b style={{color: '#059669'}}>₹{loan.netDisbursed}</b></div>
              </div>

              <button 
                onClick={() => setSelectedLoan(loan)} 
                style={reviewBtn}>
                Audit & Release Funds
              </button>
            </div>
          ))}
        </div>
      )}

      {/* --- REVIEW MODAL --- */}
      {selectedLoan && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={modalHeader}>
              <h3 style={{ margin: 0, fontWeight: '900' }}>Review: {selectedLoan.customerName}</h3>
              <button onClick={() => setSelectedLoan(null)} style={closeBtn}>✕</button>
            </div>

            <div style={modalBody}>
              <div style={disbursementBox}>
                <p style={boxLabel}>FINANCIAL SETTLEMENT</p>
                <div style={sumGrid}>
                  <div><span style={tinyLabel}>Net To Pay</span><br/><b style={{color: '#059669', fontSize: '24px'}}>₹{selectedLoan.netDisbursed}</b></div>
                  <div><span style={tinyLabel}>Weekly Recovery</span><br/><b style={{color: '#2563eb', fontSize: '24px'}}>₹{selectedLoan.weeklyEMI}</b></div>
                </div>
                <div style={chargesRow}>
                    <p>Processing Fee: ₹{selectedLoan.processingFee}</p>
                    <p>File Charges: ₹{selectedLoan.fileCharge}</p>
                </div>
              </div>

              <h5 style={sectionTitle}>LUC (Advisor Inspection Report)</h5>
              <div style={reportGrid}>
                  <p><b>House Type:</b> {selectedLoan.houseType}</p>
                  <p><b>Area:</b> {selectedLoan.areaType}</p>
                  <p><b>Monthly Income:</b> ₹{selectedLoan.monthlyIncome}</p>
                  <p><b>Verification:</b> Passed by {selectedLoan.verifiedByName || 'Advisor'}</p>
              </div>
            </div>

            <div style={modalFooter}>
              <button onClick={() => setSelectedLoan(null)} style={cancelBtn}>Hold File</button>
              <button onClick={() => handleAction(selectedLoan._id, 'APPROVE')} style={approveBtn}>Authorize & Disburse</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Professional Styles ---
const headerSection = { marginBottom: '35px', paddingBottom: '20px', borderBottom: '2px solid #e2e8f0' };
const refreshBtn = { background: '#fff', border: '1px solid #cbd5e1', padding: '8px 15px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' };
const card = { background: '#fff', padding: '25px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.03)' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const idBadge = { background: '#0f172a', padding: '5px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold', color: '#fff' };
const statusTag = { fontSize: '10px', fontWeight: '900', color: '#2563eb', textTransform: 'uppercase' };
const nameStyle = { margin: '20px 0', color: '#1e293b', fontSize: '20px', fontWeight: '900' };
const miniStats = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', margin: '20px 0', padding: '15px', background: '#f8fafc', borderRadius: '16px' };
const statItem = { fontSize: '10px', color: '#64748b', fontWeight: 'bold' };
const reviewBtn = { width: '100%', padding: '15px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' };
const loaderStyle = { textAlign: 'center', marginTop: '100px', fontWeight: 'bold', color: '#64748b' };

// Modal Styles
const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' };
const modalContent = { background: '#fff', borderRadius: '32px', width: '90%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' };
const modalHeader = { padding: '25px', background: '#0f172a', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const modalBody = { padding: '30px' };
const disbursementBox = { background: '#f0fdf4', padding: '25px', borderRadius: '24px', border: '1px solid #dcfce7', marginBottom: '25px' };
const boxLabel = { fontSize: '10px', fontWeight: '900', color: '#059669', marginBottom: '15px', letterSpacing: '1px' };
const sumGrid = { display: 'flex', justifyContent: 'space-between' };
const tinyLabel = { fontSize: '11px', color: '#64748b', fontWeight: 'bold' };
const chargesRow = { marginTop: '20px', borderTop: '1px dashed #bbf7d0', paddingTop: '10px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', color: '#166534', fontWeight: 'bold' };
const sectionTitle = { fontSize: '12px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '15px' };
const reportGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px', color: '#475569' };
const modalFooter = { padding: '25px', display: 'flex', gap: '15px', background: '#f8fafc' };
const approveBtn = { flex: 2, padding: '18px', background: '#059669', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: '900', cursor: 'pointer' };
const cancelBtn = { flex: 1, padding: '18px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '16px', fontWeight: '900', cursor: 'pointer' };
const closeBtn = { background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' };
const emptyState = { textAlign: 'center', padding: '100px 20px', background: '#fff', borderRadius: '32px', border: '2px dashed #cbd5e1' };

export default AccountantApproval;