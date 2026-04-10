import React, { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios'; 
import PaymentModal from '../Payment/PaymentModal'; 
import { 
  FiArrowUpRight, FiArrowDownLeft, FiRefreshCw, FiChevronDown, 
  FiChevronUp, FiCalendar, FiAlertCircle, FiClock, FiCheckCircle, FiInfo 
} from 'react-icons/fi';

const EMIPayments = () => {
  const [loans, setLoans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [payAmounts, setPayAmounts] = useState({});
  const [activeLedger, setActiveLedger] = useState(null);

  const user = JSON.parse(localStorage.getItem('user')) || {};

  const fetchData = useCallback(async () => {
    if (!user.id && !user._id) return;
    setLoading(true);
    try {
      const cId = user.id || user._id;
      const [loanRes, payRes] = await Promise.all([
        API.get(`/loans?customerId=${cId}`),
        API.get(`/payments?customerId=${cId}`)
      ]);

      const active = (loanRes.data || []).filter(l => l.status === 'Disbursed');
      setLoans(active);
      
      const history = Array.isArray(payRes.data) ? payRes.data : [];
      setPayments(history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

      const initAmt = {};
      active.forEach(l => { 
        initAmt[l._id] = l.installmentAmount || l.dailyEMI || 200; 
      });
      setPayAmounts(initAmt);
    } catch (err) {
      console.error("Ledger Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user.id, user._id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- 📅 NEXT DUE DATE LOGIC ---
  const getNextDueDate = (loan) => {
    // Disbursement date ko base maante hain (updatedAt ya appliedDate)
    const baseDate = new Date(loan.updatedAt || loan.appliedDate);
    const today = new Date();
    
    let nextDue = new Date(baseDate);
    if (loan.emiType === 'Weekly EMI') {
      nextDue.setDate(baseDate.getDate() + 7);
    } else {
      nextDue.setDate(baseDate.getDate() + 1);
    }

    // Agar due date nikal chuki hai toh aaj ki date dikhayein (Late mode)
    if (nextDue < today) return "OVERDUE TODAY";
    return nextDue.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handlePay = (loan, amountOverride = null) => {
    const amt = amountOverride || Number(payAmounts[loan._id]);
    if (amt < 100) return alert("⚠️ Minimum payment ₹100 allowed.");
    setSelectedLoan({ ...loan, customAmount: amt });
    setShowModal(true);
  };

  return (
    <div className="ledger-container" style={masterPageStyle}>
      <style>{animations}</style>

      {/* --- HEADER --- */}
      <div style={headerSection} className="mobile-header">
        <div>
          <h2 style={titleStyles}>🏦 D-FINANCE LEDGER</h2>
          <p style={subStyles}>Real-time EMI Tracking & Verified Statements</p>
        </div>
        <button onClick={fetchData} style={syncBtn} className="hover-scale">
          <FiRefreshCw /> Sync Ledger
        </button>
      </div>

      {loading ? (
        <div style={loaderBox}>
            <div className="spinner"></div>
            <p>Verifying Database Integrity...</p>
        </div>
      ) : (
        <>
          {/* --- ACTIVE LOAN CARDS --- */}
          <div className="loan-grid" style={gridStyles}>
            {loans.length > 0 ? loans.map(loan => {
              const loanPayments = payments.filter(p => 
                p.loanId?.toString() === loan.loanId?.toString() && p.status?.toLowerCase() === 'approved'
              );
              const totalRepaid = loanPayments.reduce((sum, p) => sum + Number(p.amount), 0);
              const netRemaining = (Number(loan.totalPayable) || 0) - totalRepaid;
              const emiAmt = loan.installmentAmount || loan.dailyEMI;
              const inputAmt = payAmounts[loan._id] || 0;
              const nextDate = getNextDueDate(loan);

              return (
                <div key={loan._id} style={cardStyles} className="card-hover">
                  <div style={cardHeader}>
                    <span style={loanIdTag}>ID: {loan.loanId}</span>
                    <span style={liveBadge}>● {loan.emiType?.toUpperCase()}</span>
                  </div>

                  {/* 📅 NEXT DUE DATE SECTION */}
                  <div style={dueInfoBox}>
                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                        <FiCalendar color="#3b82f6" />
                        <span style={{fontSize:'10px', fontWeight:'900', color:'#64748b'}}>NEXT DUE DATE</span>
                    </div>
                    <div style={{fontSize:'14px', fontWeight:'900', color: nextDate.includes('OVERDUE') ? '#ef4444' : '#0f172a', marginTop:'4px'}}>
                        {nextDate}
                    </div>
                  </div>

                  <div style={statsContainer}>
                    <div style={statBox}>
                      <label style={miniLabel}>EMI Amount</label>
                      <b style={statVal}>₹{emiAmt}</b>
                    </div>
                    <div style={statDivider}></div>
                    <div style={statBox}>
                      <label style={miniLabel}>Outstanding</label>
                      <b style={{...statVal, color: netRemaining <= 0 ? '#10b981' : '#f43f5e'}}>
                        ₹{netRemaining.toFixed(0)}
                      </b>
                    </div>
                  </div>

                  <div style={inputGroup}>
                    <label style={miniLabel}>Amount to Pay (₹)</label>
                    <input 
                      type="number" 
                      style={inputBox}
                      value={inputAmt}
                      onChange={(e) => setPayAmounts({...payAmounts, [loan._id]: e.target.value})}
                    />
                  </div>

                  <button onClick={() => handlePay(loan)} style={mainPayBtn} className="hover-scale">
                    Pay Now ₹{inputAmt}
                  </button>

                  <button 
                    onClick={() => setActiveLedger(activeLedger === loan.loanId ? null : loan.loanId)} 
                    style={scheduleToggle}
                  >
                    {activeLedger === loan.loanId ? <><FiChevronUp/> Close Schedule</> : <><FiClock/> Full EMI Schedule</>}
                  </button>

                  {activeLedger === loan.loanId && (
                    <div style={ledgerWrapper} className="fade-in">
                        <header style={ledgerHeader}>
                            <FiInfo /> AMORTIZATION TABLE
                        </header>
                        <div style={ledgerScroll}>
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} style={ledgerRow}>
                                    <span style={periodLabel}>P-{i}</span>
                                    <div style={{flex:1, marginLeft:'10px'}}>
                                        <div style={rowAmt}>₹{emiAmt}</div>
                                        <div style={{fontSize:'9px', color:'#64748b'}}>Regular Installment</div>
                                    </div>
                                    <button onClick={() => handlePay(loan, emiAmt)} style={payMiniBtn}>Pay</button>
                                </div>
                            ))}
                        </div>
                        <footer style={penaltyBox}>
                            <FiAlertCircle /> 10% Late fine added to next cycle.
                        </footer>
                    </div>
                  )}
                </div>
              );
            }) : (
                <div style={emptyCard}>No active disbursements found in ledger.</div>
            )}
          </div>

          {/* --- TRANSACTION HISTORY --- */}
          <div style={historyCard}>
            <h3 style={tableHeading}><FiCheckCircle color="#10b981" /> Payment Intelligence History</h3>
            <div style={{overflowX: 'auto'}}>
                <table style={tableStyle}>
                    <thead>
                        <tr style={tableHead}>
                            <th style={thStyle}>PAYMENT DATE</th>
                            <th style={thStyle}>UTR / REF</th>
                            <th style={thStyle}>AMOUNT</th>
                            <th style={thStyle}>LEDGER STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.length > 0 ? payments.map((p, index) => {
                            const status = p.status?.toLowerCase();
                            return (
                                <tr key={index} style={trStyle}>
                                    <td style={tdStyle}>
                                        <div style={{fontWeight: '700'}}>{new Date(p.createdAt).toLocaleDateString()}</div>
                                        <div style={{fontSize: '10px', color: '#94a3b8'}}>{new Date(p.createdAt).toLocaleTimeString()}</div>
                                    </td>
                                    <td style={{...tdStyle, fontFamily: 'monospace', color: '#6366f1', fontWeight: '800'}}>{p.utr}</td>
                                    <td style={{...tdStyle, fontWeight: '900', fontSize:'16px'}}>₹{p.amount}</td>
                                    <td style={tdStyle}>
                                        <span style={statusBadge(
                                            status === 'approved' ? '#dcfce7' : status === 'rejected' ? '#fee2e2' : '#fef3c7',
                                            status === 'approved' ? '#166534' : status === 'rejected' ? '#991b1b' : '#92400e'
                                        )}>
                                            {p.status?.toUpperCase() || 'SYNCING'}
                                        </span>
                                    </td>
                                </tr>
                            )
                        }) : (
                            <tr><td colSpan="4" style={noData}>Secure vault empty. No payments found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
          </div>
        </>
      )}

      {showModal && selectedLoan && (
        <PaymentModal 
          loan={selectedLoan} 
          customAmount={selectedLoan.customAmount} 
          onClose={() => setShowModal(false)} 
          onRefresh={fetchData} 
        />
      )}
    </div>
  );
};

// --- STYLES ---
const masterPageStyle = { padding: '30px 5%', background: '#f8fafc', minHeight: '100vh', fontFamily: '"Plus Jakarta Sans", sans-serif' };
const headerSection = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' };
const titleStyles = { margin: 0, fontWeight: 950, fontSize: '28px', color: '#0f172a', letterSpacing: '-1px' };
const subStyles = { margin: '5px 0 0 0', color: '#64748b', fontSize: '13px', fontWeight: '600' };
const syncBtn = { background: '#0f172a', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' };

const gridStyles = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '25px', marginBottom: '50px' };
const cardStyles = { background: '#fff', padding: '30px', borderRadius: '35px', border: '1px solid #eef2f6', boxShadow: '0 20px 40px rgba(0,0,0,0.02)', position: 'relative' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const loanIdTag = { fontSize: '10px', fontWeight: '900', color: '#6366f1', background: '#f0f4ff', padding: '6px 12px', borderRadius: '8px' };
const liveBadge = { fontSize: '10px', fontWeight: '900', color: '#10b981' };

const dueInfoBox = { background: '#f0f7ff', padding: '15px 20px', borderRadius: '20px', border: '1px solid #dbeafe', marginBottom: '20px' };
const statsContainer = { display: 'flex', background: '#f8fafc', padding: '20px', borderRadius: '25px', marginBottom: '25px', border: '1px solid #f1f5f9', alignItems: 'center' };
const statBox = { flex: 1, textAlign: 'center' };
const statDivider = { width: '1px', height: '30px', background: '#e2e8f0' };
const miniLabel = { fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px', display: 'block' };
const statVal = { fontSize: '20px', fontWeight: '950', color: '#0f172a' };

const inputGroup = { marginBottom: '15px' };
const inputBox = { width: '100%', padding: '16px', borderRadius: '18px', border: '2px solid #e2e8f0', fontSize: '20px', fontWeight: '900', textAlign: 'center', outline: 'none' };
const mainPayBtn = { width: '100%', padding: '18px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '20px', fontWeight: '900', cursor: 'pointer', fontSize: '15px', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' };
const scheduleToggle = { width: '100%', background: 'none', border: 'none', marginTop: '15px', color: '#94a3b8', fontSize: '11px', fontWeight: '800', cursor: 'pointer' };

const ledgerWrapper = { marginTop: '20px', background: '#0f172a', borderRadius: '25px', padding: '20px', color: '#fff' };
const ledgerHeader = { fontSize: '10px', fontWeight: '900', color: '#475569', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' };
const ledgerScroll = { maxHeight: '200px', overflowY: 'auto' };
const ledgerRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #1e293b' };
const periodLabel = { background: '#1e293b', padding: '4px 8px', borderRadius: '6px', fontSize: '9px', fontWeight: '900' };
const rowAmt = { fontSize: '14px', fontWeight: '900', color: '#fff' };
const payMiniBtn = { background: '#fff', color: '#0f172a', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '9px', fontWeight: '900', cursor: 'pointer' };
const penaltyBox = { marginTop: '15px', fontSize: '10px', color: '#fb7185', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px' };

const historyCard = { background: '#fff', borderRadius: '40px', padding: '40px', border: '1px solid #eef2f6', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' };
const tableHeading = { marginBottom: '30px', fontSize: '18px', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '10px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const tableHead = { textAlign: 'left', borderBottom: '2px solid #f8fafc' };
const thStyle = { padding: '15px 10px', color: '#94a3b8', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' };
const trStyle = { borderBottom: '1px solid #f8fafc' };
const tdStyle = { padding: '20px 10px', fontSize: '14px' };
const statusBadge = (bg, color) => ({ background: bg, color: color, padding: '6px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: '900' });

const loaderBox = { padding: '100px', textAlign: 'center', color: '#94a3b8', fontWeight: '800' };
const emptyCard = { gridColumn: '1/-1', textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '30px', color: '#cbd5e1', fontWeight: '800' };
const noData = { textAlign: 'center', padding: '40px', color: '#cbd5e1', fontWeight: '800' };

const animations = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  .card-hover:hover { transform: translateY(-5px); box-shadow: 0 30px 60px rgba(0,0,0,0.04); transition: 0.4s; }
  .hover-scale:active { transform: scale(0.97); }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in { animation: fadeIn 0.5s ease; }
  .spinner { width: 30px; height: 30px; border: 4px solid #f3f3f3; border-top: 4px solid #0f172a; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px; }
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  @media (max-width: 768px) {
    .mobile-header { flex-direction: column; gap: 20px; align-items: flex-start !important; }
    .loan-grid { grid-template-columns: 1fr !important; }
  }
`;

export default EMIPayments;