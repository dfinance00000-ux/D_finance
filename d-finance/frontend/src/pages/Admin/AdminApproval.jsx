import React, { useState, useEffect, useCallback } from 'react';
import API from "../../api/axios";

const AdminApproval = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  // LocalStorage se logged-in user ki details (Role check ke liye)
  const user = JSON.parse(localStorage.getItem('user')) || {};

  // 1. Fetch Loans (Filter: Field Verified)
  const fetchPendingLoans = useCallback(async () => {
    try {
      setLoading(true);
      // 🔥 FIX: Admin routes ka use karke saara data Atlas se fetch karna
      const res = await API.get('/admin/all-loans');
      
      // ✅ LOGIC: Sirf wahi dikhao jo Advisor ne 'Field Verified' kar diye hain
      // Ya jo 'Pending Accountant Approval' par hain
      const pending = res.data.filter(loan => 
        loan.status === 'Field Verified' || 
        loan.status === 'Pending Accountant Approval'
      );
      
      setLoans(pending.reverse());
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingLoans();
  }, [fetchPendingLoans]);

  // 2. Approve/Disburse Loan Logic
  const handleApprove = async (loan) => {
    const confirmMsg = `Confirm Disbursement for ${loan.customerName}?\nAmount: ₹${loan.amount}\nNet Disburse: ₹${loan.netDisbursed}`;
    
    if (!window.confirm(confirmMsg)) return;
    
    try {
      // 🔥 FIX: Backend approval route call (Using MongoDB _id)
      const res = await API.post(`/accountant/approve/${loan._id}`);
      
      if (res.data.success) {
        alert("✅ Loan Disbursed! Status updated to 'Disbursed'.");
        fetchPendingLoans(); 
      }
    } catch (err) {
      alert("Approval failed: " + (err.response?.data?.error || "Server Error"));
    }
  };

  return (
    <div style={{ padding: '25px', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={headerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, color: '#1e293b', fontWeight: '900', letterSpacing: '-1px' }}>🛡️ DISBURSEMENT QUEUE</h2>
            <p style={{ color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Active Session: {user.fullName} ({user.role})</p>
          </div>
          <button onClick={fetchPendingLoans} style={refreshBtn}>🔄 Refresh Pool</button>
        </div>
      </div>

      {loading ? (
        <div style={loaderStyle}>🔄 Fetching verified reports from Atlas...</div>
      ) : loans.length === 0 ? (
        <div style={emptyStyle}>
          <p style={{ fontSize: '24px' }}>✅</p>
          <p>Sab clear hai! Filhal koi pending file nahi hai.</p>
          <small style={{ color: '#94a3b8' }}>Verified files will appear here after Advisor submission.</small>
        </div>
      ) : (
        <div style={gridStyle}>
          {loans.map((loan) => (
            <div key={loan._id} style={cardStyle}>
              <div style={cardHeader}>
                <span style={idBadge}>LOAN ID: {loan.loanId}</span>
                <span style={statusBadge}>{loan.status}</span>
              </div>

              <h3 style={nameStyle}>{loan.customerName}</h3>
              
              <div style={infoRow}>
                <div>
                  <label style={labelStyle}>PRINCIPAL</label>
                  <p style={valStyle}>₹{loan.amount}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <label style={labelStyle}>NET DISBURSE</label>
                  <p style={{ ...valStyle, color: '#059669' }}>₹{loan.netDisbursed}</p>
                </div>
              </div>

              <div style={detailGrid}>
                <div style={detailItem}>
                  <label style={labelStyle}>WEEKLY EMI</label>
                  <p style={{ fontWeight: 'bold', color: '#1e293b' }}>₹{loan.weeklyEMI}</p>
                </div>
                <div style={detailItem}>
                  <label style={labelStyle}>TENURE</label>
                  <p style={{ fontWeight: 'bold', color: '#1e293b' }}>{loan.totalWeeks} Weeks</p>
                </div>
              </div>

              <div style={advisorBox}>
                <p style={{ margin: 0 }}>📍 <b>Verified By:</b> {loan.verifiedByName || "Advisor"}</p>
                <p style={{ margin: '5px 0 0 0', fontSize: '11px' }}><b>Inspection:</b> {loan.houseType} house in {loan.areaType} area.</p>
              </div>

              <div style={actionRow}>
                <button 
                  onClick={() => handleApprove(loan)} 
                  style={approveBtn}
                >
                  Confirm & Release Funds
                </button>
                <button style={rejectBtn}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Styles (Modern Fintech UI) ---
const headerStyle = { marginBottom: '35px', paddingBottom: '20px', borderBottom: '2px solid #e2e8f0' };
const refreshBtn = { background: '#fff', border: '1px solid #e2e8f0', padding: '8px 15px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px' };
const cardStyle = { background: '#fff', padding: '25px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' };
const idBadge = { background: '#f8fafc', padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '900', color: '#64748b', border: '1px solid #e2e8f0' };
const statusBadge = { color: '#2563eb', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', background: '#eff6ff', padding: '4px 10px', borderRadius: '20px' };
const nameStyle = { fontSize: '20px', margin: '0 0 20px 0', color: '#0f172a', fontWeight: '900', letterSpacing: '-0.5px' };
const infoRow = { display: 'flex', justifyContent: 'space-between', background: '#f0fdf4', padding: '15px', borderRadius: '16px', marginBottom: '20px', border: '1px solid #dcfce7' };
const labelStyle = { fontSize: '9px', color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' };
const valStyle = { fontSize: '18px', fontWeight: '900', margin: '4px 0' };
const detailGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' };
const detailItem = { background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9' };
const advisorBox = { background: '#fff9f2', padding: '12px', borderRadius: '12px', fontSize: '12px', color: '#92400e', marginBottom: '25px', border: '1px solid #ffedd5' };
const actionRow = { display: 'flex', gap: '12px' };
const approveBtn = { flex: 2, padding: '16px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', fontSize: '13px' };
const rejectBtn = { flex: 1, padding: '16px', background: '#fff', color: '#ef4444', border: '1.5px solid #fee2e2', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', fontSize: '13px' };
const loaderStyle = { textAlign: 'center', padding: '100px', color: '#64748b', fontWeight: 'bold' };
const emptyStyle = { textAlign: 'center', padding: '100px 20px', background: '#fff', borderRadius: '32px', color: '#059669', fontWeight: '900' };

export default AdminApproval;