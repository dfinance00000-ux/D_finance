import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // Fetch ki jagah Axios use karna better hai interceptors ke liye

const AccountantApproval = () => {
  const [verifiedLoans, setVerifiedLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);

  // Token aur User details nikalna
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const fetchVerified = useCallback(async () => {
    setLoading(true);
    try {
      // 🚀 Fix 1: Backend ka sahi endpoint use karein
      // 🚀 Fix 2: Authorization Header bhejhein warna 403 error aayega
      const res = await axios.get('http://localhost:5000/api/accountant/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setVerifiedLoans(res.data);
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err.message);
      if(err.response?.status === 403) alert("Access Denied: You are not an Accountant!");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchVerified();
  }, [fetchVerified, token]);

  const handleAction = async (mongoId, action) => {
    const isApprove = action === 'APPROVE';
    const confirmMsg = isApprove 
      ? `Confirm Disbursement?\n------------------\nNet To Pay: ₹${selectedLoan.netDisbursed}\nWeekly EMI: ₹${selectedLoan.weeklyEMI}` 
      : "Reject this application?";
    
    if (!window.confirm(confirmMsg)) return;

    try {
      // 🚀 Fix 3: Sahi Approval Route call karein (Backend mein jo humne banaya tha)
      const url = isApprove 
        ? `http://localhost:5000/api/accountant/approve-loan/${mongoId}`
        : `http://localhost:5000/api/loans/${mongoId}`; // Rejection logic

      const res = await axios.post(url, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        alert(`Loan ${isApprove ? 'Disbursed' : 'Rejected'} Successfully!`);
        setSelectedLoan(null);
        fetchVerified();
      }
    } catch (err) {
      alert("Error updating status: " + (err.response?.data?.error || "Server Error"));
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={headerSection}>
        <h2 style={{ color: '#0f172a', margin: 0, fontWeight: '900' }}>🛡️ FINAL DISBURSEMENT QUEUE</h2>
        <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold' }}>Review Advisor's report & release funds to {user.fullName}.</p>
      </div>

      {loading ? (
        <p style={{textAlign: 'center', padding: '50px'}}>🔄 Fetching verified reports from Atlas...</p>
      ) : verifiedLoans.length === 0 ? (
        <div style={emptyState}>
          <p>No loans pending for final authentication.</p>
          <small>Status: Data is synced with Cloud DB.</small>
        </div>
      ) : (
        <div style={grid}>
          {verifiedLoans.map(loan => (
            <div key={loan._id} style={card}>
              <div style={cardHeader}>
                <span style={idBadge}>ID: {loan.loanId}</span>
                <span style={amountLabel}>₹{Number(loan.amount).toLocaleString()}</span>
              </div>
              <h4 style={{ margin: '15px 0', color: '#1e293b' }}>{loan.customerName}</h4>
              
              <div style={miniStats}>
                <div style={statItem}><span>Net Disburse</span><br/><b>₹{loan.netDisbursed}</b></div>
                <div style={statItem}><span>Weekly EMI</span><br/><b>₹{loan.weeklyEMI}</b></div>
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
              <h3 style={{ margin: 0 }}>Review: {selectedLoan.customerName}</h3>
              <button onClick={() => setSelectedLoan(null)} style={closeBtn}>✕</button>
            </div>

            <div style={modalBody}>
              <div style={disbursementBox}>
                <p style={{fontSize: '10px', fontWeight: '900', color: '#059669', marginBottom: '10px'}}>DISBURSEMENT SUMMARY</p>
                <div style={sumGrid}>
                  <div><span style={tinyLabel}>Loan Amount</span><br/><b>₹{selectedLoan.amount}</b></div>
                  <div><span style={tinyLabel}>Net To Pay</span><br/><b style={{color: '#059669', fontSize: '18px'}}>₹{selectedLoan.netDisbursed}</b></div>
                  <div><span style={tinyLabel}>Weekly Recovery</span><br/><b style={{color: '#2563eb'}}>₹{selectedLoan.weeklyEMI}</b></div>
                  <div><span style={tinyLabel}>Processing + File</span><br/><b>₹{Number(selectedLoan.processingFee) + Number(selectedLoan.fileCharge)}</b></div>
                </div>
              </div>

              <h5 style={sectionTitle}>LUC Audit Report</h5>
              <table style={detailsTable}>
                <tbody>
                  <tr style={tableRow}><td style={labelTd}>RELIGION / CATEGORY</td><td style={valTd}>{selectedLoan.religion} / {selectedLoan.category}</td></tr>
                  <tr style={tableRow}><td style={labelTd}>HOUSE / AREA</td><td style={valTd}>{selectedLoan.houseType} / {selectedLoan.areaType}</td></tr>
                  <tr style={tableRow}><td style={labelTd}>MONTHLY INCOME</td><td style={valTd}>₹{selectedLoan.monthlyIncome}</td></tr>
                  <tr style={tableRow}><td style={labelTd}>VEHICLE</td><td style={valTd}>{selectedLoan.vehicleType || 'None'}</td></tr>
                </tbody>
              </table>
            </div>

            <div style={modalFooter}>
              <button onClick={() => handleAction(selectedLoan._id, 'REJECT')} style={rejectBtn}>QC Reject</button>
              <button onClick={() => handleAction(selectedLoan._id, 'APPROVE')} style={approveBtn}>Authenticate & Disburse</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Styles same as before ---
const headerSection = { marginBottom: '30px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' };
const card = { background: '#fff', padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const idBadge = { background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', color: '#64748b' };
const amountLabel = { color: '#059669', fontWeight: '900', fontSize: '18px' };
const miniStats = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '15px 0', padding: '10px', background: '#f8fafc', borderRadius: '12px' };
const statItem = { fontSize: '10px', color: '#64748b' };
const reviewBtn = { width: '100%', padding: '12px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' };
const modalContent = { background: '#fff', borderRadius: '24px', width: '95%', maxWidth: '550px', overflow: 'hidden' };
const modalHeader = { padding: '20px', background: '#0f172a', color: '#fff', display: 'flex', justifyContent: 'space-between' };
const modalBody = { padding: '25px', maxHeight: '70vh', overflowY: 'auto' };
const modalFooter = { padding: '20px', display: 'flex', gap: '10px', background: '#f8fafc' };
const disbursementBox = { background: '#f0fdf4', padding: '20px', borderRadius: '16px', border: '1px solid #dcfce7', marginBottom: '25px' };
const sumGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };
const tinyLabel = { fontSize: '9px', color: '#059669', textTransform: 'uppercase', fontWeight: 'bold' };
const sectionTitle = { margin: '0 0 15px 0', color: '#1e293b', fontSize: '12px', borderBottom: '1px solid #eee', paddingBottom: '5px' };
const detailsTable = { width: '100%', borderCollapse: 'collapse' };
const tableRow = { borderBottom: '1px solid #f8fafc' };
const labelTd = { padding: '12px 0', fontSize: '10px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' };
const valTd = { padding: '12px 0', fontSize: '13px', textAlign: 'right', fontWeight: 'bold', color: '#1e293b' };
const approveBtn = { flex: 2, padding: '16px', background: '#059669', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' };
const rejectBtn = { flex: 1, padding: '16px', background: '#fff', color: '#ef4444', border: '1.5px solid #ef4444', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' };
const closeBtn = { background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' };
const emptyState = { textAlign: 'center', padding: '100px 20px', color: '#94a3b8', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0' };

export default AccountantApproval;