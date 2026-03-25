import React, { useState, useEffect } from 'react';
import API from '../../api/axios';

const AdminApproval = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch all pending loans
  const fetchPendingLoans = async () => {
    try {
      const res = await API.get('/admin/all-loans');
      // Sirf 'Verification Pending' wali files dikhani hain
      const pending = res.data.filter(loan => loan.status === 'Verification Pending');
      setLoans(pending);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingLoans();
  }, []);

  // 2. Approve Loan Logic
  const handleApprove = async (id) => {
    if (!window.confirm("Bhai, kya aap is loan ko Approve karna chahte hain?")) return;
    
    try {
      const res = await API.put(`/admin/approve-loan/${id}`);
      if (res.data.message) {
        alert("Loan Approved! Customer ko notification bhej di gayi hai.");
        fetchPendingLoans(); // List refresh karo
      }
    } catch (err) {
      alert("Approval failed: " + (err.response?.data?.error || "Server Error"));
    }
  };

  return (
    <div style={{ padding: '25px', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={headerStyle}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>📂 Loan Approval Queue</h2>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Mathura Branch: Pending Verification Files</p>
      </div>

      {loading ? (
        <div style={loaderStyle}>🔄 Fetching files from Atlas...</div>
      ) : loans.length === 0 ? (
        <div style={emptyStyle}>✅ Sab clear hai! Koi pending file nahi hai.</div>
      ) : (
        <div style={gridStyle}>
          {loans.map((loan) => (
            <div key={loan._id} style={cardStyle}>
              <div style={cardHeader}>
                <span style={idBadge}>ID: {loan.loanId}</span>
                <span style={dateText}>{new Date(loan.appliedDate).toLocaleDateString()}</span>
              </div>

              <h3 style={nameStyle}>{loan.customerName}</h3>
              
              <div style={infoRow}>
                <div>
                  <label style={labelStyle}>LOAN AMOUNT</label>
                  <p style={valStyle}>₹{loan.amount}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <label style={labelStyle}>WEEKLY EMI</label>
                  <p style={{ ...valStyle, color: '#2563eb' }}>₹{loan.emiAmount}</p>
                </div>
              </div>

              <div style={detailsBox}>
                <p><strong>Advisor:</strong> {loan.advisorName || "Direct"}</p>
                <p><strong>Type:</strong> {loan.type}</p>
              </div>

              <div style={actionRow}>
                <button 
                  onClick={() => handleApprove(loan._id)} 
                  style={approveBtn}
                >
                  ✅ Approve Loan
                </button>
                <button style={rejectBtn}>❌ Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Styles (Fintech Theme) ---
const headerStyle = { marginBottom: '30px', borderLeft: '5px solid #2563eb', paddingLeft: '15px' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' };
const cardStyle = { background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: '15px' };
const idBadge = { background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', color: '#475569' };
const dateText = { fontSize: '12px', color: '#94a3b8' };
const nameStyle = { fontSize: '18px', margin: '0 0 20px 0', color: '#1e293b', fontWeight: '800' };
const infoRow = { display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '12px', borderRadius: '10px', marginBottom: '15px' };
const labelStyle = { fontSize: '10px', color: '#94a3b8', fontWeight: 'bold' };
const valStyle = { fontSize: '16px', fontWeight: 'bold', margin: '4px 0' };
const detailsBox = { fontSize: '13px', color: '#64748b', marginBottom: '20px' };
const actionRow = { display: 'flex', gap: '10px' };
const approveBtn = { flex: 2, padding: '12px', background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const rejectBtn = { flex: 1, padding: '12px', background: '#fff', color: '#dc2626', border: '1px solid #fee2e2', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const loaderStyle = { textAlign: 'center', padding: '50px', color: '#64748b' };
const emptyStyle = { textAlign: 'center', padding: '50px', background: '#fff', borderRadius: '16px', color: '#059669', fontWeight: 'bold' };

export default AdminApproval;