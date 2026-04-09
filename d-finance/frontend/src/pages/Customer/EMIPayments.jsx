import React, { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios'; 
import PaymentModal from '../Payment/PaymentModal'; 
import { FiArrowUpRight, FiArrowDownLeft, FiRefreshCw, FiChevronDown, FiChevronUp, FiCalendar } from 'react-icons/fi';

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
      active.forEach(l => { initAmt[l._id] = l.dailyEMI || 200; });
      setPayAmounts(initAmt);
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user.id, user._id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handlePay = (loan, amountOverride = null) => {
    const amt = amountOverride || Number(payAmounts[loan._id]);
    if (amt < 200) return alert("⚠️ Minimum payment allowed is ₹200");
    setSelectedLoan({ ...loan, customAmount: amt });
    setShowModal(true);
  };

  return (
    <div style={{ padding: '25px', maxWidth: '1200px', margin: '0 auto', background: '#f8fafc', minHeight: '100vh' }}>
      
      <div style={headerStyles}>
        <div>
          <h2 style={titleStyles}>🏦 D-FINANCE ACCOUNT LEDGER</h2>
          <p style={subStyles}>Track Real-Time Disbursements & Verified Repayments</p>
        </div>
        <button onClick={fetchData} style={syncBtnStyles}><FiRefreshCw /> Refresh Statement</button>
      </div>

      {loading ? (
        <div style={loaderStyles}>🔄 Verifying Cloud Ledger with Atlas...</div>
      ) : (
        <>
          <div style={gridStyles}>
            {loans.map(loan => {
              // 🔥 CRITICAL FIX: Direct calculation with Case-Insensitive Check
              const loanPayments = payments.filter(p => 
                p.loanId?.toString().trim() === loan.loanId?.toString().trim()
              );

              const totalApprovedRepaid = loanPayments
                .filter(p => p.status?.trim().toLowerCase() === 'approved')
                .reduce((sum, p) => sum + Number(p.amount), 0);
              
              const netRemaining = (Number(loan.totalPayable) || 0) - totalApprovedRepaid;
              const inputAmt = payAmounts[loan._id] || 0;

              return (
                <div key={loan._id} style={cardStyles}>
                  <div style={cardHeader}>
                    <span style={lidStyles}>LOAN ID: {loan.loanId}</span>
                    <span style={activeBadge}>● LIVE REPAYMENT</span>
                  </div>

                  <div style={statsContainer}>
                    <div style={statItem}>
                      <label style={miniLabel}>Approved EMI</label>
                      <b style={statVal}>₹{loan.dailyEMI}</b>
                    </div>
                    <div style={{...statItem, borderLeft: '1px solid #e2e8f0', paddingLeft: '15px'}}>
                      <label style={miniLabel}>Net Remaining</label>
                      <b style={{...statVal, color: netRemaining <= 0 ? '#10b981' : '#ef4444'}}>
                        ₹{netRemaining.toFixed(2)}
                      </b>
                    </div>
                  </div>

                  <div style={inputGroup}>
                    <label style={miniLabel}>Pay Manual Amount</label>
                    <input 
                      type="number" 
                      style={{...inputBox, borderColor: inputAmt < 200 ? '#ef4444' : '#e2e8f0'}}
                      value={inputAmt}
                      onChange={(e) => setPayAmounts({...payAmounts, [loan._id]: e.target.value})}
                    />
                  </div>

                  <button onClick={() => handlePay(loan)} style={payBtn}>Confirm & Pay ₹{inputAmt}</button>

                  <button onClick={() => setActiveLedger(activeLedger === loan.loanId ? null : loan.loanId)} style={ledgerToggleBtn}>
                    {activeLedger === loan.loanId ? <><FiChevronUp/> Hide Schedule</> : <><FiCalendar/> Show Full EMI Schedule</>}
                  </button>

                  {activeLedger === loan.loanId && (
                    <div style={ledgerBox}>
                        <p style={{fontSize: '9px', fontWeight: '900', color: '#64748b', marginBottom: '10px'}}>INSTALLMENT PLAN</p>
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} style={ledgerItem}>
                                <span>Installment #{i}</span>
                                <button onClick={() => handlePay(loan, loan.dailyEMI)} style={miniPayBtn}>PAY EMI</button>
                            </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={historySection}>
            <div style={{marginBottom: '50px'}}>
              <h3 style={tableTitle}><FiArrowDownLeft color="#10b981"/> 1. Disbursement History</h3>
              <div style={{overflowX: 'auto'}}>
                <table style={tableMain}>
                  <thead>
                    <tr style={tableHead}>
                      <th>DATE</th>
                      <th>LOAN ID</th>
                      <th>LOAN AMOUNT</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.map(loan => (
                      <tr key={loan._id} style={tableRow}>
                        <td style={tdStyle}>{new Date(loan.updatedAt || loan.createdAt).toLocaleDateString()}</td>
                        <td style={{...tdStyle, fontWeight: 'bold'}}>{loan.loanId}</td>
                        <td style={{...tdStyle, color: '#059669', fontWeight: '900'}}>+ ₹{loan.loanAmount}</td>
                        <td style={tdStyle}><span style={statusTag('#dcfce7', '#166534')}>✅ SUCCESS</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 style={tableTitle}><FiArrowUpRight color="#3b82f6"/> 2. Repayment History</h3>
              <div style={{overflowX: 'auto'}}>
                <table style={tableMain}>
                  <thead>
                    <tr style={tableHead}>
                      <th>DATE & TIME</th>
                      <th>UTR NUMBER</th>
                      <th>AMOUNT</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length > 0 ? payments.map((p, i) => {
                      const status = p.status?.trim().toLowerCase();
                      const isApproved = status === 'approved';
                      const isRejected = status === 'rejected';

                      return (
                        <tr key={i} style={tableRow}>
                          <td style={tdStyle}>
                            <div style={{fontWeight: '700'}}>{new Date(p.paymentDate || p.createdAt).toLocaleDateString()}</div>
                            <div style={{fontSize: '10px', color: '#94a3b8'}}>{new Date(p.paymentDate || p.createdAt).toLocaleTimeString()}</div>
                          </td>
                          <td style={{...tdStyle, fontFamily: 'monospace', fontWeight: 'bold', color: '#2563eb'}}>{p.utr}</td>
                          <td style={{...tdStyle, color: isApproved ? '#059669' : '#ef4444', fontWeight: '900'}}>₹{p.amount}</td>
                          <td style={tdStyle}>
                            <span style={statusTag(
                                isApproved ? '#dcfce7' : isRejected ? '#fee2e2' : '#fef3c7', 
                                isApproved ? '#166534' : isRejected ? '#991b1b' : '#b45309'
                            )}>
                              {p.status?.toUpperCase() || 'PENDING'}
                            </span>
                          </td>
                        </tr>
                      )
                    }) : (
                      <tr><td colSpan="4" style={{textAlign: 'center', padding: '40px', color: '#94a3b8'}}>No repayments logged yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
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

// --- STYLES (Kept exactly same for UI consistency) ---
const headerStyles = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' };
const titleStyles = { margin: 0, fontWeight: 950, fontSize: '28px', color: '#0f172a', letterSpacing: '-1.5px' };
const subStyles = { margin: '5px 0 0 0', color: '#64748b', fontSize: '13px' };
const syncBtnStyles = { background: '#0f172a', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer' };
const gridStyles = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '30px', marginBottom: '50px' };
const cardStyles = { background: '#fff', padding: '25px', borderRadius: '35px', border: '1px solid #f1f5f9', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' };
const lidStyles = { fontSize: '10px', fontWeight: '900', color: '#64748b', background: '#f8fafc', padding: '6px 12px', borderRadius: '8px' };
const activeBadge = { color: '#10b981', fontSize: '11px', fontWeight: '950' };
const statsContainer = { display: 'flex', background: '#f8fafc', padding: '20px', borderRadius: '25px', marginBottom: '20px', border: '1px solid #f1f5f9' };
const statItem = { flex: 1 };
const miniLabel = { fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '5px', display: 'block' };
const statVal = { fontSize: '22px', fontWeight: '950', color: '#0f172a' };
const inputGroup = { marginBottom: '15px' };
const inputBox = { width: '100%', padding: '15px', borderRadius: '15px', border: '2px solid #e2e8f0', fontSize: '20px', fontWeight: '900', outline: 'none', boxSizing: 'border-box' };
const payBtn = { width: '100%', padding: '18px', background: '#059669', color: '#fff', border: 'none', borderRadius: '18px', fontWeight: '900', cursor: 'pointer', marginBottom: '10px', fontSize: '14px', boxShadow: '0 10px 20px rgba(5,150,105,0.2)' };
const ledgerToggleBtn = { width: '100%', background: 'none', border: '1px solid #f1f5f9', padding: '12px', borderRadius: '14px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' };
const ledgerBox = { marginTop: '15px', padding: '20px', background: '#f8fafc', borderRadius: '25px', border: '1px solid #e2e8f0' };
const ledgerItem = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #e2e8f0', fontSize: '12px', fontWeight: '700' };
const miniPayBtn = { background: '#0f172a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '10px', cursor: 'pointer', fontWeight: '900' };
const historySection = { marginTop: '50px', background: '#fff', padding: '40px', borderRadius: '45px', border: '1px solid #f1f5f9', boxShadow: '0 4px 25px rgba(0,0,0,0.02)' };
const tableTitle = { fontSize: '18px', fontWeight: '950', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px', color: '#0f172a' };
const tableMain = { width: '100%', borderCollapse: 'collapse' };
const tableHead = { textAlign: 'left', borderBottom: '2.5px solid #f8fafc', color: '#94a3b8', fontSize: '11px', paddingBottom: '15px' };
const tableRow = { borderBottom: '1.5px solid #f8fafc' };
const tdStyle = { padding: '20px 0', fontSize: '14px' };
const statusTag = (bg, color) => ({ background: bg, color: color, padding: '6px 14px', borderRadius: '10px', fontSize: '10px', fontWeight: '950' });
const loaderStyles = { textAlign: 'center', padding: '100px', fontWeight: '900', color: '#94a3b8' };

export default EMIPayments;