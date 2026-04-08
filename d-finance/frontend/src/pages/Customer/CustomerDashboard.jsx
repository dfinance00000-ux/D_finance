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
      const [loanRes, payRes] = await Promise.all([
        API.get(`/loans?customerId=${user.id || user._id}`),
        API.get(`/api/payments?customerId=${user.id || user._id}`) // API prefix fix
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
    const interval = setInterval(fetchData, 15000); // 15s sync is enough
    return () => clearInterval(interval); 
  }, [fetchData]);

  // Statistics Calculation
  const activeLoan = loans.find(l => l.status === 'Disbursed' || l.status === 'Approved');
  const pendingLoan = loans.find(l => l.status === 'Applied' || l.status === 'Verification Pending');
  const totalApplied = loans.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalPaid = payments.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const handlePaymentRedirect = () => {
    window.open(RAZORPAY_URL, "_blank");
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={headerFlex}>
        <div>
          <h2 style={{ color: '#0f172a', margin: 0, fontWeight: '900', letterSpacing: '-1px' }}>📊 MY FINANCIAL PORTAL</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Mathura Branch | ID: <b>{user.id?.slice(-6)}</b></p>
        </div>
        <button onClick={() => navigate('/customer/apply-loan')} style={applyBtn}>
          🚀 New Loan Application
        </button>
      </div>

      {/* Stats Grid */}
      <div style={grid4}>
        <div style={card}>
          <span style={label}>Account Status</span>
          <p style={{ ...val, color: activeLoan ? '#10b981' : '#f59e0b' }}>
            {activeLoan ? '✅ Active Loan' : pendingLoan ? '⏳ In Verification' : '🆕 Ready to Apply'}
          </p>
        </div>
        <div style={card}>
          <span style={label}>Total Credit Limit</span>
          <p style={val}>₹{totalApplied.toLocaleString()}</p>
        </div>
        <div style={card}>
          <span style={label}>Current Weekly EMI</span>
          <p style={{ ...val, color: '#2563eb' }}>
            ₹{activeLoan ? activeLoan.weeklyEMI : '0'}
          </p>
        </div>
        <div style={card}>
          <span style={label}>Amount Repaid</span>
          <p style={{ ...val, color: '#059669' }}>₹{totalPaid.toLocaleString()}</p>
        </div>
      </div>

      <div style={mainGrid}>
        {/* Recent Activity */}
        <div style={sectionCard}>
          <h4 style={sectionTitle}>Loan History (Latest from Atlas)</h4>
          {loading ? (
            <p style={emptyText}>Syncing with cloud database...</p>
          ) : loans.length === 0 ? (
            <div style={{textAlign: 'center', padding: '30px'}}>
              <p style={emptyText}>No applications found in your account.</p>
            </div>
          ) : (
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
                {loans.slice(0, 5).map(l => (
                  <tr key={l._id || l.id} style={tableRow}>
                    <td style={{ padding: '15px 0' }}>{new Date(l.appliedDate || l.createdAt).toLocaleDateString()}</td>
                    <td style={{fontWeight: '700', color: '#475569'}}>{l.loanId || 'PENDING'}</td>
                    <td><b>₹{Number(l.amount).toLocaleString()}</b></td>
                    <td>
                      <span style={statusBadge(l.status)}>{l.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Repayment Center */}
        <div style={sectionCard}>
          <h4 style={sectionTitle}>Repayment Center</h4>
          {activeLoan ? (
            <div>
              <div style={emiBox}>
                <p style={{ margin: 0, fontSize: '10px', fontWeight: '900', color: '#059669', textTransform: 'uppercase' }}>Upcoming Weekly Due</p>
                <h3 style={{ margin: '10px 0', fontSize: '36px', fontWeight: '900', letterSpacing: '-1px' }}>
                  ₹{activeLoan.weeklyEMI}
                </h3>
                <div style={{fontSize: '12px', fontWeight: '600', opacity: 0.8}}>
                  Next Pay Date: {activeLoan.nextEmiDate ? new Date(activeLoan.nextEmiDate).toLocaleDateString() : 'Next Monday'}
                </div>
              </div>
              <button onClick={handlePaymentRedirect} style={payBtn}>
                💳 Pay Now via Razorpay
              </button>
              <p style={{textAlign: 'center', fontSize: '11px', color: '#94a3b8', mt: '10px'}}>
                *Enter your Loan ID: <b>{activeLoan.loanId}</b> on the payment page.
              </p>
            </div>
          ) : pendingLoan ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '40px', marginBottom: '15px' }}>🔍</div>
              <h5 style={{margin: '0 0 10px 0'}}>Verification Underway</h5>
              <p style={emptyText}>Our advisor is reviewing your application (LUC). Repayment starts once disbursed.</p>
              <button onClick={() => navigate('/customer/tracking')} style={trackBtn}>
                Track Real-time Status
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p style={emptyText}>No active EMI found. Apply for a loan to start your credit journey.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Styles ---
const headerFlex = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' };
const grid4 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' };
const mainGrid = { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px', marginTop: '30px' };
const card = { background: '#fff', padding: '25px', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' };
const label = { fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' };
const val = { fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: '10px 0 0 0', letterSpacing: '-0.5px' };
const sectionCard = { background: '#fff', padding: '30px', borderRadius: '32px', boxShadow: '0 15px 35px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' };
const sectionTitle = { margin: '0 0 25px 0', color: '#0f172a', fontSize: '15px', fontWeight: '900', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' };
const emptyText = { color: '#94a3b8', fontSize: '13px', lineHeight: '1.6', fontWeight: '500' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const tableHeader = { textAlign: 'left', color: '#94a3b8', fontSize: '10px', fontWeight: '900', borderBottom: '1px solid #f1f5f9' };
const tableRow = { borderBottom: '1px solid #f8fafc', fontSize: '13px', color: '#334155' };
const emiBox = { background: '#f0fdf4', padding: '30px', borderRadius: '24px', border: '1px solid #dcfce7', color: '#166534', marginBottom: '20px', textAlign: 'center' };
const payBtn = { width: '100%', padding: '18px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '18px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 10px 20px rgba(15,23,42,0.15)', transition: 'all 0.3s' };
const trackBtn = { width: '100%', padding: '14px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '15px', cursor: 'pointer', fontSize: '12px', fontWeight: '800' };
const applyBtn = { padding: '14px 28px', background: '#059669', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 8px 15px rgba(5,150,105,0.2)' };

const statusBadge = (status) => {
  const isOk = status === 'Approved' || status === 'Disbursed';
  const isBad = status === 'Rejected';
  return {
    padding: '6px 14px', borderRadius: '12px', fontSize: '10px', fontWeight: '900',
    background: isOk ? '#dcfce7' : isBad ? '#fee2e2' : '#fef3c7',
    color: isOk ? '#166534' : isBad ? '#991b1b' : '#92400e',
    textTransform: 'uppercase', letterSpacing: '0.5px'
  }
};

export default CustomerDashboard;