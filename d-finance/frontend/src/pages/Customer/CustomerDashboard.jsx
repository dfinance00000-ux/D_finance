import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// import API from '../api/axios'; // Hamara naya Axios instance
import API from "../../api/axios"; // '../' se Customer folder bahar, '../' se pages folder bahar
const CustomerDashboard = () => {
  const [loans, setLoans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    if (!user.id && !user._id) return;

    try {
      // Atlas API calls
      const [loanRes, payRes] = await Promise.all([
        API.get(`/loans?customerId=${user.id || user._id}`),
        API.get(`/payments?customerId=${user.id || user._id}`)
      ]);
      
      setLoans(loanRes.data);
      setPayments(payRes.data);
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user.id, user._id]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Sync every 10s
    return () => clearInterval(interval); 
  }, [fetchData]);

  // Statistics Calculation (Weekly Model Based)
  const activeLoan = loans.find(l => l.status === 'Approved');
  const totalApplied = loans.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalPaid = payments.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={headerFlex}>
        <div>
          <h2 style={{ color: '#0f172a', margin: 0, fontWeight: '900' }}>📊 Financial Overview</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Welcome back, <b>{user.fullName}</b></p>
        </div>
        <button onClick={() => navigate('/customer/apply-loan')} style={applyBtn}>
          🚀 Apply New Loan
        </button>
      </div>

      {/* Stats Grid */}
      <div style={grid4}>
        <div style={card}>
          <span style={label}>Active Status</span>
          <p style={{ ...val, color: activeLoan ? '#10b981' : '#64748b' }}>
            {activeLoan ? 'In Repayment' : 'No Active Loan'}
          </p>
        </div>
        <div style={card}>
          <span style={label}>Total Loan Limit</span>
          <p style={val}>₹{totalApplied.toLocaleString()}</p>
        </div>
        <div style={card}>
          <span style={label}>Weekly EMI</span>
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
          <h4 style={sectionTitle}>Recent Loan Activity</h4>
          {loading ? (
            <p style={emptyText}>Connecting to Atlas Cloud...</p>
          ) : loans.length === 0 ? (
            <div style={{textAlign: 'center', padding: '30px'}}>
              <p style={emptyText}>No loan history found.</p>
            </div>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeader}>
                  <th>DATE</th>
                  <th>TYPE</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {loans.slice(0, 5).map(l => (
                  <tr key={l._id || l.id} style={tableRow}>
                    <td style={{ padding: '15px 0' }}>{new Date(l.appliedDate).toLocaleDateString()}</td>
                    <td style={{fontWeight: '600'}}>{l.type}</td>
                    <td>₹{Number(l.amount).toLocaleString()}</td>
                    <td>
                      <span style={statusBadge(l.status)}>{l.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Weekly EMI Card */}
        <div style={sectionCard}>
          <h4 style={sectionTitle}>Repayment Center</h4>
          {activeLoan ? (
            <div>
              <div style={emiBox}>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: '900', color: '#059669' }}>UPCOMING WEEKLY DUE</p>
                <h3 style={{ margin: '10px 0', fontSize: '32px', fontWeight: '900' }}>
                  ₹{activeLoan.weeklyEMI}
                </h3>
                <div style={{fontSize: '12px', opacity: 0.8}}>
                  Due Date: {activeLoan.nextEmiDate ? new Date(activeLoan.nextEmiDate).toLocaleDateString() : 'Calculating...'}
                </div>
              </div>
              <button onClick={() => navigate('/customer/emi')} style={payBtn}>
                💳 Pay Now via Razorpay
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '50px', marginBottom: '15px' }}>⏳</div>
              <p style={emptyText}>Wait for Advisor's Field Verification (LUC) to start your repayment schedule.</p>
              <button onClick={() => navigate('/customer/tracking')} style={trackBtn}>
                Track Application Status
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Professional Theme Styles ---
const headerFlex = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const grid4 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' };
const mainGrid = { display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '30px', marginTop: '30px' };
const card = { background: '#fff', padding: '25px', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' };
const label = { fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' };
const val = { fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: '12px 0 0 0' };
const sectionCard = { background: '#fff', padding: '30px', borderRadius: '28px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' };
const sectionTitle = { margin: '0 0 25px 0', color: '#0f172a', fontSize: '16px', fontWeight: '800', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' };
const emptyText = { color: '#94a3b8', fontSize: '13px', lineHeight: '1.6' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const tableHeader = { textAlign: 'left', color: '#94a3b8', fontSize: '10px', fontWeight: '900', borderBottom: '1px solid #f1f5f9' };
const tableRow = { borderBottom: '1px solid #f8fafc', fontSize: '13px', color: '#334155' };
const emiBox = { background: '#f0fdf4', padding: '25px', borderRadius: '20px', border: '1px solid #dcfce7', color: '#166534', marginBottom: '20px' };
const payBtn = { width: '100%', padding: '16px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 10px 20px rgba(15,23,42,0.2)' };
const trackBtn = { width: '100%', padding: '14px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '15px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' };
const applyBtn = { padding: '12px 24px', background: '#059669', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5,150,105,0.3)' };

const statusBadge = (status) => ({
  padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: '900',
  background: status === 'Approved' ? '#dcfce7' : status === 'Rejected' ? '#fee2e2' : '#fef3c7',
  color: status === 'Approved' ? '#166534' : status === 'Rejected' ? '#991b1b' : '#92400e',
  textTransform: 'uppercase'
});

export default CustomerDashboard;