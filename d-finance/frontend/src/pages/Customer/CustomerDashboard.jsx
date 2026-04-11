import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from "../../api/axios";
import PaymentModal from "../Payment/PaymentModal"; 

const CustomerDashboard = () => {
  const [loans, setLoans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const navigate = useNavigate();

  // --- 🔄 FETCH DATA FROM BACKEND ---
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
    const interval = setInterval(fetchData, 15000); 
    return () => clearInterval(interval); 
  }, [fetchData]);

  // --- 📊 LOGIC & CALCULATIONS ---
  const activeLoan = loans.find(l => l.status === 'Disbursed' || l.status === 'Approved');
  const pendingLoan = loans.find(l => ['Applied', 'Verification Pending', 'Field Verified'].includes(l.status));
  
  const totalApplied = loans.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalPaid = payments
    .filter(p => p.status === 'Approved')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  // 🚀 FIXED: Smart Payment Trigger
  const openQR = (loan) => {
    // EMI amount check (weeklyEMI pehle, phir emiAmount)
    const amountToPay = loan.weeklyEMI || loan.emiAmount || 0;
    
    // selectedLoan state update with guaranteed amount key
    setSelectedLoan({
      ...loan,
      installmentAmount: amountToPay 
    });
    setShowModal(true);
  };

  if (loading) return <div style={{textAlign: 'center', padding: '50px', fontWeight: 'bold'}}>Loading Dashboard...</div>;

  return (
    <div style={container}>
      
      {/* 1. Header Section */}
      <div style={headerFlex}>
        <div className="header-text">
          <h2 style={portalTitle}>🚀 CUSTOMER PORTAL</h2>
          <p style={welcomeText}>Welcome, {user.fullName} | Branch: Mathura</p>
        </div>
        <button onClick={() => navigate('/customer/apply-loan')} style={applyBtn}>+ Apply New Loan</button>
      </div>

      {/* 2. Stats Grid */}
      <div style={grid4}>
        <div style={card}>
            <span style={label}>Status</span>
            <p style={{ ...val, color: activeLoan ? '#10b981' : '#f59e0b' }}>
                {activeLoan ? '✅ Active' : pendingLoan ? '⏳ Processing' : '🆕 Ready'}
            </p>
        </div>
        <div style={card}><span style={label}>Total Credit</span><p style={val}>₹{totalApplied.toLocaleString('en-IN')}</p></div>
        <div style={card}>
            <span style={label}>Weekly EMI</span>
            <p style={{ ...val, color: '#2563eb' }}>
                ₹{activeLoan ? (activeLoan.weeklyEMI || activeLoan.emiAmount || 0) : '0'}
            </p>
        </div>
        <div style={card}><span style={label}>Total Repaid</span><p style={{ ...val, color: '#059669' }}>₹{totalPaid.toLocaleString('en-IN')}</p></div>
      </div>

      {/* 3. Main Content Grid */}
      <div className="dashboard-main-grid" style={mainGrid}>
        
        {/* Left Column: Applications Table */}
        <div style={leftCol}>
          {activeLoan && (
            <div style={activeAlert}>
              <div style={{fontSize: '28px'}}>🎊</div>
              <div>
                <b style={{color: '#065f46', fontSize: '15px'}}>Loan Disbursement Active!</b>
                <p style={{margin: '4px 0 0 0', fontSize: '11px', color: '#047857'}}>Check your bank account for funds released to <b>{activeLoan.bankName}</b>.</p>
              </div>
            </div>
          )}

          <div style={sectionCard}>
            <h4 style={sectionTitle}>📜 My Applications</h4>
            <div style={{overflowX: 'auto'}}>
              <table style={tableStyle}>
                <thead>
                  <tr style={tableHeader}><th>DATE</th><th>LOAN ID</th><th>AMOUNT</th><th>STATUS</th></tr>
                </thead>
                <tbody>
                  {loans.length === 0 ? (
                    <tr><td colSpan="4" style={emptyRow}>No applications found.</td></tr>
                  ) : (
                    loans.map(l => (
                      <tr key={l._id} style={tableRow}>
                        <td>{new Date(l.createdAt).toLocaleDateString()}</td>
                        <td style={{fontWeight: 'bold'}}>{l.loanId || '---'}</td>
                        <td style={{fontWeight: '700'}}>₹{l.amount.toLocaleString('en-IN')}</td>
                        <td><span style={statusBadge(l.status)}>{l.status}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar Repayment */}
        <div className="sidebar">
          <div style={sectionCard}>
            <h4 style={sectionTitle}>💳 Repayment Center</h4>
            {activeLoan ? (
              <div style={{textAlign: 'center'}}>
                <div style={emiDisplay}>
                  <span style={miniLabel}>WEEKLY INSTALLMENT</span>
                  <h2 style={emiVal}>₹{activeLoan.weeklyEMI || activeLoan.emiAmount || 0}</h2>
                  <div style={emiTag}>Loan ID: {activeLoan.loanId}</div>
                </div>
                
                {/* 🚀 FIXED BUTTON TRIGGER */}
                <button 
                  onClick={() => openQR(activeLoan)} 
                  style={payBtn}
                  onMouseOver={(e) => e.target.style.background = '#1e293b'}
                  onMouseOut={(e) => e.target.style.background = '#0f172a'}
                >
                  Pay EMI via Gateway
                </button>
                
                <div style={syncNote}>
                  ⚠️ <b>Verification:</b> Cashfree payments are updated <b>instantly</b> in your ledger.
                </div>
              </div>
            ) : (
              <div style={lockedState}>
                <div style={{fontSize: '40px', marginBottom: '10px'}}>🔒</div>
                <h4 style={{color: '#1e293b', margin: '0 0 10px 0'}}>Repayment Locked</h4>
                <p style={smallText}>EMI portal activates after loan disbursement.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL INTEGRATION --- */}
      {showModal && selectedLoan && (
        <PaymentModal 
          loan={selectedLoan} 
          onClose={() => setShowModal(false)} 
          onRefresh={fetchData} 
        />
      )}

      {/* CSS For Mobile Responsiveness */}
      <style>{`
        @media (max-width: 768px) {
          .dashboard-main-grid { grid-template-columns: 1fr !important; }
          .header-text { margin-bottom: 15px; }
        }
      `}</style>
    </div>
  );
};

// --- 🎨 STYLES (Keep exactly as before) ---
const container = { padding: '20px', maxWidth: '1200px', margin: '0 auto', background: '#f8fafc', minHeight: '100vh' };
const headerFlex = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', flexWrap: 'wrap' };
const portalTitle = { color: '#0f172a', margin: 0, fontWeight: '900', fontSize: '24px', letterSpacing: '-1px' };
const welcomeText = { fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' };
const grid4 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' };
const mainGrid = { display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '25px' };
const leftCol = { display: 'flex', flexDirection: 'column', gap: '20px' };
const card = { background: '#fff', padding: '20px', borderRadius: '24px', border: '1px solid #e2e8f0' };
const label = { fontSize: '9px', color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase' };
const val = { fontSize: '22px', fontWeight: '900', margin: '5px 0 0 0' };
const sectionCard = { background: '#fff', padding: '25px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' };
const sectionTitle = { margin: '0 0 20px 0', fontSize: '13px', fontWeight: '900', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '1px' };
const activeAlert = { background: '#ecfdf5', border: '1px solid #d1fae5', padding: '15px', borderRadius: '20px', display: 'flex', gap: '15px', alignItems: 'center' };
const emiDisplay = { background: '#f8fafc', padding: '30px 15px', borderRadius: '24px', border: '1px solid #e2e8f0', marginBottom: '20px' };
const miniLabel = { fontSize: '9px', fontWeight: '900', color: '#64748b', letterSpacing: '1px' };
const emiVal = { margin: '8px 0', fontSize: '36px', color: '#0f172a', fontWeight: '900' };
const emiTag = { display: 'inline-block', padding: '4px 10px', background: '#e0f2fe', color: '#0369a1', borderRadius: '8px', fontSize: '10px', fontWeight: '800' };
const payBtn = { width: '100%', padding: '18px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '18px', fontWeight: '900', cursor: 'pointer', fontSize: '14px', transition: '0.3s' };
const syncNote = { marginTop: '15px', padding: '12px', background: '#fff9db', borderRadius: '12px', fontSize: '10px', color: '#856404', border: '1px solid #ffeeba' };
const applyBtn = { padding: '12px 24px', background: '#059669', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', fontSize: '12px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const tableHeader = { textAlign: 'left', color: '#94a3b8', fontSize: '10px', fontWeight: '900', paddingBottom: '10px' };
const tableRow = { borderBottom: '1px solid #f1f5f9', fontSize: '13px' };
const emptyRow = { textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '12px' };
const lockedState = { textAlign: 'center', padding: '30px 10px' };
const smallText = { color: '#94a3b8', fontSize: '12px' };

const statusBadge = (s) => {
  const isOk = ['Disbursed', 'Approved'].includes(s);
  const isPending = ['Applied', 'Field Verified', 'Verification Pending'].includes(s);
  return {
    padding: '4px 10px', borderRadius: '8px', fontSize: '9px', fontWeight: '900',
    background: isOk ? '#dcfce7' : isPending ? '#fef3c7' : '#f1f5f9',
    color: isOk ? '#15803d' : isPending ? '#92400e' : '#475569',
    textTransform: 'uppercase'
  }
};

export default CustomerDashboard;