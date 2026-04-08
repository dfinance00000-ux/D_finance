import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from "../../api/axios";

const CustomerDashboard = () => {
  const [loans, setLoans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const navigate = useNavigate();

  const RAZORPAY_URL = "https://rzp.io/rzp/0I14rlJi";

  const fetchData = useCallback(async () => {
    if (!user.id && !user._id) return;
    try {
      const [loanRes, payRes] = await Promise.all([
        API.get(`/loans?customerId=${user.id || user._id}`),
        API.get(`/payments?customerId=${user.id || user._id}`).catch(() => ({ data: [] })) 
      ]);
      setLoans(loanRes.data);
      setPayments(payRes.data || []);
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user.id, user._id]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval); 
  }, [fetchData]);

  const activeLoan = loans.find(l => l.status === 'Disbursed');
  const pendingLoan = loans.find(l => ['Applied', 'Verification Pending', 'Field Verified', 'Approved'].includes(l.status));
  
  const totalApplied = loans.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalPaid = payments.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', background: '#f8fafc', minHeight: '100vh' }}>
      
      {/* 1. Header & Quick Stats */}
      <div style={headerFlex}>
        <div>
          <h2 style={{ color: '#0f172a', margin: 0, fontWeight: '900', fontSize: '28px' }}>🚀 CUSTOMER PORTAL</h2>
          <p style={{ fontSize: '12px', color: '#64748b' }}>Mathura Branch | ID: <b>{user.id?.slice(-6)}</b></p>
        </div>
        <button onClick={() => navigate('/customer/apply-loan')} style={applyBtn}>+ Apply New Loan</button>
      </div>

      <div style={grid4}>
        <div style={card}>
          <span style={label}>Status</span>
          <p style={{ ...val, color: activeLoan ? '#10b981' : '#f59e0b' }}>{activeLoan ? 'Active' : 'Pending'}</p>
        </div>
        <div style={card}>
          <span style={label}>Total Credit</span>
          <p style={val}>₹{totalApplied.toLocaleString()}</p>
        </div>
        <div style={card}>
          <span style={label}>Weekly EMI</span>
          <p style={{ ...val, color: '#2563eb' }}>₹{activeLoan ? activeLoan.weeklyEMI : '0'}</p>
        </div>
        <div style={card}>
          <span style={label}>Total Repaid</span>
          <p style={{ ...val, color: '#059669' }}>₹{totalPaid.toLocaleString()}</p>
        </div>
      </div>

      {/* 2. Main Layout */}
      <div style={mainGrid}>
        
        {/* Left Side: Active Status & History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          {/* Active Alert */}
          {activeLoan && (
            <div style={activeAlert}>
              <div style={{fontSize: '24px'}}>🎉</div>
              <div>
                <b style={{color: '#065f46'}}>Your loan is DISBURSED!</b>
                <p style={{margin: '4px 0 0 0', fontSize: '12px', color: '#047857'}}>Loan ID: {activeLoan.loanId} is now active. Repay weekly to maintain credit score.</p>
              </div>
            </div>
          )}

          {/* History Table */}
          <div style={sectionCard}>
            <h4 style={sectionTitle}>📜 Loan Applications</h4>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeader}>
                  <th>DATE</th>
                  <th>LOAN ID</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {loans.map(l => (
                  <tr key={l._id} style={tableRow}>
                    <td style={{padding: '12px 0'}}>{new Date(l.createdAt).toLocaleDateString()}</td>
                    <td style={{fontWeight: 'bold'}}>{l.loanId || '---'}</td>
                    <td>₹{l.amount}</td>
                    <td><span style={statusBadge(l.status)}>{l.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payment History Table (New) */}
          <div style={sectionCard}>
            <h4 style={sectionTitle}>💸 Recent Payments</h4>
            {payments.length === 0 ? (
              <p style={emptyText}>No payment history found yet.</p>
            ) : (
              <table style={tableStyle}>
                <thead>
                  <tr style={tableHeader}>
                    <th>DATE</th>
                    <th>TRANS. ID</th>
                    <th>AMOUNT</th>
                    <th>METHOD</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p._id} style={tableRow}>
                      <td style={{padding: '12px 0'}}>{new Date(p.paymentDate || p.createdAt).toLocaleDateString()}</td>
                      <td style={{color: '#64748b', fontSize: '11px'}}>{p.transactionId || 'RAZORPAY'}</td>
                      <td style={{color: '#059669', fontWeight: 'bold'}}>+ ₹{p.amount}</td>
                      <td><span style={methodBadge}>Online</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Side: Repayment Center */}
        <div style={sectionCard}>
          <h4 style={sectionTitle}>💳 Repayment Center</h4>
          {activeLoan ? (
            <div style={{textAlign: 'center'}}>
              <div style={emiDisplay}>
                <span style={{fontSize: '11px', fontWeight: '900', color: '#64748b'}}>NEXT WEEKLY DUE</span>
                <h2 style={{margin: '10px 0', fontSize: '40px', color: '#0f172a'}}>₹{activeLoan.weeklyEMI}</h2>
                <div style={emiTag}>Status: UNPAID</div>
              </div>
              
              <button onClick={() => window.open(RAZORPAY_URL, "_blank")} style={payBtn}>
                Pay Now via Razorpay
              </button>
              
              <div style={syncNote}>
                ⚠️ <b>Security Note:</b> Payment takes 24h to reflect in your "Total Repaid" balance. Please keep your screenshot safe.
              </div>
            </div>
          ) : (
            <div style={{textAlign: 'center', padding: '40px 0'}}>
              <div style={{fontSize: '40px'}}>🔒</div>
              <p style={{...emptyText, marginTop: '15px'}}>Repayment center unlocks after loan disbursement.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

// --- Additional Styles ---
const headerFlex = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const grid4 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' };
const mainGrid = { display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '25px' };
const card = { background: '#fff', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0' };
const label = { fontSize: '10px', color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase' };
const val = { fontSize: '22px', fontWeight: '900', margin: '5px 0 0 0' };
const sectionCard = { background: '#fff', padding: '25px', borderRadius: '25px', border: '1px solid #e2e8f0' };
const sectionTitle = { margin: '0 0 20px 0', fontSize: '14px', fontWeight: '900', color: '#334155' };
const activeAlert = { background: '#ecfdf5', border: '1px solid #d1fae5', padding: '15px', borderRadius: '15px', display: 'flex', gap: '15px', alignItems: 'center' };
const emiDisplay = { background: '#f8fafc', padding: '30px', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '20px' };
const emiTag = { display: 'inline-block', padding: '4px 10px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '10px', fontWeight: '900' };
const payBtn = { width: '100%', padding: '18px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: '900', cursor: 'pointer' };
const syncNote = { marginTop: '20px', padding: '12px', background: '#fff9db', borderRadius: '12px', fontSize: '10px', color: '#856404', lineHeight: '1.4' };
const applyBtn = { padding: '10px 20px', background: '#059669', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: '13px' };
const tableHeader = { textAlign: 'left', color: '#94a3b8', fontSize: '10px' };
const tableRow = { borderBottom: '1px solid #f1f5f9' };
const emptyText = { color: '#94a3b8', fontSize: '13px', textAlign: 'center' };
const methodBadge = { padding: '2px 8px', background: '#e0f2fe', color: '#0369a1', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' };

const statusBadge = (s) => ({
  padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold',
  background: s === 'Disbursed' ? '#dcfce7' : '#f1f5f9',
  color: s === 'Disbursed' ? '#15803d' : '#475569'
});

export default CustomerDashboard;