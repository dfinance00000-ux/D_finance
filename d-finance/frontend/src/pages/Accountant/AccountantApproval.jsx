import React, { useState, useEffect } from 'react';

const AccountantApproval = () => {
  const [verifiedLoans, setVerifiedLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null); 

  const fetchVerified = async () => {
    try {
      const res = await fetch('http://localhost:5000/loans?status=Field Verified');
      const data = await res.json();
      setVerifiedLoans(data.reverse());
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerified();
  }, []);

  const handleAction = async (loanId, action) => {
    const statusUpdate = action === 'APPROVE' ? 'Approved' : 'Rejected';
    const confirmMsg = action === 'APPROVE' 
      ? `Confirm Disbursement?\n------------------\nNet To Pay: ₹${selectedLoan.netDisbursed}\nWeekly EMI: ₹${selectedLoan.weeklyEMI}` 
      : "Reject this application?";
    
    if (!window.confirm(confirmMsg)) return;

    const approvalData = {
      ...selectedLoan, // Preserving all existing fields (Weekly math + LUC data)
      status: statusUpdate,
      finalAuthTimestamp: new Date().toISOString(),
      accountantComments: action === 'APPROVE' 
        ? "Full QC passed. Funds released for disbursement."
        : "QC failed. Discrepancy found in field report.",
      // Next EMI Date calculation (Current Date + 7 Days)
      nextEmiDate: action === 'APPROVE' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null
    };

    try {
      await fetch(`http://localhost:5000/loans/${loanId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(approvalData)
      });
      alert(`Loan ${statusUpdate} Successfully!`);
      setSelectedLoan(null);
      fetchVerified();
    } catch (err) {
      alert("Error updating status.");
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={headerSection}>
        <h2 style={{ color: '#0f172a', margin: 0, fontWeight: '900' }}>🛡️ FINAL DISBURSEMENT QUEUE</h2>
        <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold' }}>Audit Advisor's LUC report & confirm weekly repayment schedule.</p>
      </div>

      {loading ? (
        <p>Fetching verified reports...</p>
      ) : verifiedLoans.length === 0 ? (
        <div style={emptyState}>
          <p>No loans pending for final authentication.</p>
          <small>Check back after Advisors submit Field Reports (LUC).</small>
        </div>
      ) : (
        <div style={grid}>
          {verifiedLoans.map(loan => (
            <div key={loan.id} style={card}>
              <div style={cardHeader}>
                <span style={idBadge}>ID: {loan.id}</span>
                <span style={amountLabel}>₹{Number(loan.amount).toLocaleString()}</span>
              </div>
              <h4 style={{ margin: '15px 0', color: '#1e293b' }}>{loan.customerName}</h4>
              
              {/* Mini Financial Summary */}
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
              {/* FINANCIAL RECAP BOX */}
              <div style={disbursementBox}>
                <p style={{fontSize: '10px', fontWeight: '900', color: '#059669', marginBottom: '10px'}}>DISBURSEMENT SUMMARY</p>
                <div style={sumGrid}>
                  <div><span style={tinyLabel}>Loan Amount</span><br/><b>₹{selectedLoan.amount}</b></div>
                  <div><span style={tinyLabel}>Net To Pay</span><br/><b style={{color: '#059669', fontSize: '18px'}}>₹{selectedLoan.netDisbursed}</b></div>
                  <div><span style={tinyLabel}>Weekly Recovery</span><br/><b style={{color: '#2563eb'}}>₹{selectedLoan.weeklyEMI}</b></div>
                  <div><span style={tinyLabel}>Fees (1% + ₹200)</span><br/><b>₹{Number(selectedLoan.processingFee) + Number(selectedLoan.fileCharge)}</b></div>
                </div>
              </div>

              <h5 style={sectionTitle}>LUC Report Details (Advisor: {selectedLoan.verifiedByName})</h5>
              <table style={detailsTable}>
                <tbody>
                  <tr style={tableRow}><td style={labelTd}>RELIGION / CATEGORY</td><td style={valTd}>{selectedLoan.religion} / {selectedLoan.category}</td></tr>
                  <tr style={tableRow}><td style={labelTd}>HOUSE TYPE / AREA</td><td style={valTd}>{selectedLoan.houseType} / {selectedLoan.areaType}</td></tr>
                  <tr style={tableRow}><td style={labelTd}>MONTHLY INCOME</td><td style={valTd}>₹{selectedLoan.monthlyIncome}</td></tr>
                  <tr style={tableRow}><td style={labelTd}>VEHICLE TYPE</td><td style={valTd}>{selectedLoan.vehicleType || 'None'}</td></tr>
                  <tr style={tableRow}><td style={labelTd}>PEP / DISABLED</td><td style={valTd}>{selectedLoan.isPep} / {selectedLoan.isDisabled}</td></tr>
                </tbody>
              </table>
            </div>

            <div style={modalFooter}>
              <button onClick={() => handleAction(selectedLoan.id, 'REJECT')} style={rejectBtn}>QC Reject</button>
              <button onClick={() => handleAction(selectedLoan.id, 'APPROVE')} style={approveBtn}>Authenticate & Disburse</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Professional Theme Styles ---
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