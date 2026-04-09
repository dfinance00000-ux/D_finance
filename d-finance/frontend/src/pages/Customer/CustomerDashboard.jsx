import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from "../../api/axios";

const CustomerDashboard = () => {
  const [loans, setLoans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const navigate = useNavigate();

  // 🔥 Razorpay Payment Page URL
  const RAZORPAY_URL = "https://rzp.io/rzp/0I14rlJi";

  const fetchData = useCallback(async () => {
    if (!user.id && !user._id) return;
    try {
      // Syncing both loans and payments for the customer
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
    const interval = setInterval(fetchData, 10000); // 10s auto-refresh for live status
    return () => clearInterval(interval); 
  }, [fetchData]);

  // Logic to find active/pending loans
  const activeLoan = loans.find(l => l.status === 'Disbursed');
  const pendingLoan = loans.find(l => ['Applied', 'Verification Pending', 'Field Verified', 'Approved'].includes(l.status));
  
  const totalApplied = loans.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalPaid = payments.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* 1. Header & Quick Stats */}
      <div style={headerFlex}>
        <div>
          <h2 style={{ color: '#0f172a', margin: 0, fontWeight: '900', fontSize: '28px', letterSpacing: '-1px' }}>🚀 CUSTOMER PORTAL</h2>
          <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Welcome, {user.fullName} | Branch: Mathura</p>
        </div>
        <button onClick={() => navigate('/customer/apply-loan')} style={applyBtn}>+ Apply New Loan</button>
      </div>

      <div style={grid4}>
        <div style={card}>
          <span style={label}>Account Status</span>
          <p style={{ ...val, color: activeLoan ? '#10b981' : '#f59e0b' }}>
            {activeLoan ? '✅ Active Loan' : pendingLoan ? '⏳ In Process' : '🆕 Ready'}
          </p>
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

      {/* 2. Main Content Layout */}
      <div style={mainGrid}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          {/* Active Notification */}
          {activeLoan && (
            <div style={activeAlert}>
              <div style={{fontSize: '28px'}}>🎊</div>
              <div>
                <b style={{color: '#065f46', fontSize: '16px'}}>Loan Disbursed Successfully!</b>
                <p style={{margin: '4px 0 0 0', fontSize: '12px', color: '#047857'}}>
                  Funds have been released to <b>{activeLoan.bankName}</b> (A/C: {activeLoan.accountNumber?.slice(-4).padStart(activeLoan.accountNumber.length, '*')}).
                </p>
              </div>
            </div>
          )}

          {/* Loan History Section */}
          <div style={sectionCard}>
            <h4 style={sectionTitle}>📜 My Loan Applications</h4>
            <div style={{overflowX: 'auto'}}>
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
                  {loans.length === 0 ? (
                    <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px', color: '#94a3b8'}}>No applications found.</td></tr>
                  ) : (
                    loans.map(l => (
                      <tr key={l._id} style={tableRow}>
                        <td style={{padding: '15px 0'}}>{new Date(l.createdAt).toLocaleDateString()}</td>
                        <td style={{fontWeight: 'bold', color: '#334155'}}>{l.loanId || '---'}</td>
                        <td style={{fontWeight: '700'}}>₹{l.amount.toLocaleString()}</td>
                        <td><span style={statusBadge(l.status)}>{l.status}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment History Section */}
          <div style={sectionCard}>
            <h4 style={sectionTitle}>💸 Recent Repayments</h4>
            {payments.length === 0 ? (
              <p style={emptyText}>No payments recorded yet.</p>
            ) : (
              <table style={tableStyle}>
                <thead>
                  <tr style={tableHeader}>
                    <th>DATE</th>
                    <th>TRANS. ID</th>
                    <th>AMOUNT</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p._id} style={tableRow}>
                      <td style={{padding: '12px 0'}}>{new Date(p.paymentDate || p.createdAt).toLocaleDateString()}</td>
                      <td style={{color: '#64748b', fontSize: '11px'}}>{p.transactionId || 'ONLINE'}</td>
                      <td style={{color: '#059669', fontWeight: 'bold'}}>₹{p.amount.toLocaleString()}</td>
                      <td><span style={methodBadge}>SUCCESS</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Sidebar: Repayment Center */}
        <div style={{ position: 'sticky', top: '20px', height: 'fit-content' }}>
          <div style={sectionCard}>
            <h4 style={sectionTitle}>💳 Repayment Center</h4>
            {activeLoan ? (
              <div style={{textAlign: 'center'}}>
                <div style={emiDisplay}>
                  <span style={{fontSize: '11px', fontWeight: '900', color: '#64748b', letterSpacing: '1px'}}>WEEKLY INSTALLMENT</span>
                  <h2 style={{margin: '10px 0', fontSize: '42px', color: '#0f172a', fontWeight: '900'}}>₹{activeLoan.weeklyEMI}</h2>
                  <div style={emiTag}>Loan ID: {activeLoan.loanId}</div>
                </div>
                
                <button onClick={() => window.open(RAZORPAY_URL, "_blank")} style={payBtn}>
                  Pay EMI via Razorpay
                </button>
                
                <div style={syncNote}>
                  ⚠️ <b>Sync Delay:</b> Online payments may take up to 24 hours to reflect in your dashboard history.
                </div>
              </div>
            ) : (
              <div style={{textAlign: 'center', padding: '40px 20px'}}>
                <div style={{fontSize: '50px', marginBottom: '15px'}}>🔒</div>
                <h4 style={{color: '#1e293b', margin: '0 0 10px 0'}}>Repayment Locked</h4>
                <p style={{...emptyText, lineHeight: '1.5'}}>
                  EMI portal activates automatically once your loan is disubursed by the Accountant.
                </p>
                {pendingLoan && (
                  <div style={statusStep}>Current Stage: <b>{pendingLoan.status}</b></div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// --- Updated Styles ---
const headerFlex = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' };
const grid4 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' };
const mainGrid = { display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '30px' };
const card = { background: '#fff', padding: '25px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' };
const label = { fontSize: '10px', color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' };
const val = { fontSize: '24px', fontWeight: '900', margin: '8px 0 0 0', letterSpacing: '-0.5px' };
const sectionCard = { background: '#fff', padding: '30px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.03)' };
const sectionTitle = { margin: '0 0 25px 0', fontSize: '15px', fontWeight: '900', color: '#1e293b', borderBottom: '2px solid #f8fafc', paddingBottom: '15px' };
const activeAlert = { background: '#ecfdf5', border: '1px solid #d1fae5', padding: '20px', borderRadius: '20px', display: 'flex', gap: '20px', alignItems: 'center' };
const emiDisplay = { background: '#f8fafc', padding: '35px 20px', borderRadius: '24px', border: '1px solid #e2e8f0', marginBottom: '25px' };
const emiTag = { display: 'inline-block', padding: '5px 12px', background: '#e0f2fe', color: '#0369a1', borderRadius: '10px', fontSize: '11px', fontWeight: '800' };
const payBtn = { width: '100%', padding: '20px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '20px', fontWeight: '900', cursor: 'pointer', fontSize: '16px', boxShadow: '0 10px 15px -3px rgba(15,23,42,0.2)' };
const syncNote = { marginTop: '20px', padding: '15px', background: '#fff9db', borderRadius: '15px', fontSize: '11px', color: '#856404', lineHeight: '1.5', border: '1px solid #ffeeba' };
const applyBtn = { padding: '14px 28px', background: '#059669', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 14px 0 rgba(5,150,105,0.39)' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const tableHeader = { textAlign: 'left', color: '#94a3b8', fontSize: '11px', fontWeight: '900', paddingBottom: '15px' };
const tableRow = { borderBottom: '1px solid #f1f5f9', fontSize: '14px' };
const emptyText = { color: '#94a3b8', fontSize: '14px', textAlign: 'center' };
const methodBadge = { padding: '4px 10px', background: '#dcfce7', color: '#15803d', borderRadius: '8px', fontSize: '10px', fontWeight: '900' };
const statusStep = { marginTop: '15px', padding: '10px', background: '#f1f5f9', borderRadius: '10px', fontSize: '12px', color: '#475569' };

const statusBadge = (s) => {
  const isOk = s === 'Disbursed' || s === 'Approved';
  const isPending = ['Applied', 'Field Verified', 'Verification Pending'].includes(s);
  return {
    padding: '6px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: '900',
    background: isOk ? '#dcfce7' : isPending ? '#fef3c7' : '#f1f5f9',
    color: isOk ? '#15803d' : isPending ? '#92400e' : '#475569',
    textTransform: 'uppercase'
  }
};

export default CustomerDashboard;