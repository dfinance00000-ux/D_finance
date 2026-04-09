import React, { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios'; 
import PaymentModal from '../Payment/PaymentModal'; // Path as per your structure

const EMIPayments = () => {
  const [loans, setLoans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const fetchData = useCallback(async () => {
    if (!user.id && !user._id) return;
    
    try {
      const [loanRes, payRes] = await Promise.all([
        API.get(`/loans?customerId=${user.id || user._id}`),
        API.get(`/payments?customerId=${user.id || user._id}`)
      ]);
      
      const activeLoans = loanRes.data.filter(l => l.status === 'Approved' || l.status === 'Disbursed' || l.status === 'Pending Verification');
      setLoans(activeLoans);
      setPayments(payRes.data.reverse());
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user.id, user._id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getWeeklyBillingInfo = (loan) => {
    const nextDue = new Date(loan.nextEmiDate || Date.now());
    const today = new Date();
    
    const isPaidThisWeek = loan.totalPaid >= loan.amount || payments.some(p => {
      const pDate = new Date(p.paymentDate || p.date);
      const startOfWeek = new Date(nextDue);
      startOfWeek.setDate(startOfWeek.getDate() - 7);
      return p.loanId === loan.loanId && pDate >= startOfWeek && pDate <= nextDue;
    });

    let fine = 0;
    let isOverdue = today > nextDue && !isPaidThisWeek;
    if (isOverdue) fine = loan.lateFee || 200; 

    return { nextDue, isOverdue, fine, isPaidThisWeek };
  };

  // ---------------------------------------------------------
  // 💳 OPTION 1: RAZORPAY LOGIC (Currently Commented)
  // ---------------------------------------------------------
  /*
  const handleRazorpayPayment = async (loan) => {
    try {
      const orderRes = await API.post('/payments/create-emi-order', { loanId: loan.loanId });
      const { orderId, amount, key } = orderRes.data;

      const options = {
        key: key,
        amount: amount * 100, 
        currency: "INR",
        name: "D-FINANCE",
        description: `EMI Payment for Loan #${loan.loanId}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            const verifyRes = await API.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              loanId: loan.loanId
            });
            if (verifyRes.data.success) {
              alert("Payment Verified!");
              fetchData();
            }
          } catch (err) {
            alert("Verification Failed.");
          }
        },
        prefill: { name: user.fullName, contact: user.mobile || "" },
        theme: { color: "#2563eb" }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert(err.response?.data?.error || "Gateway Error.");
    }
  };
  */

  // ---------------------------------------------------------
  // 🏦 OPTION 2: MANUAL QR LOGIC (Currently Active)
  // ---------------------------------------------------------
  const handleOpenQR = (loan) => {
    setSelectedLoan(loan);
    setShowModal(true);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={headerSection}>
        <h2 style={{ color: '#0f172a', margin: 0, fontWeight: '900' }}>💳 Weekly Repayment Portal</h2>
        <p style={{ color: '#64748b', fontSize: '13px' }}>Pay your installments securely via UPI QR.</p>
      </div>

      {loading ? (
        <div style={noDataBox}>🔄 Syncing with Atlas Cloud...</div>
      ) : loans.length === 0 ? (
        <div style={noDataBox}>
          <h3>No Active Loans Found</h3>
          <p>Approved loans will appear here for weekly repayment.</p>
        </div>
      ) : (
        <div style={gridContainer}>
          {loans.map(loan => {
            const { nextDue, isOverdue, fine, isPaidThisWeek } = getWeeklyBillingInfo(loan);
            return (
              <div key={loan._id} style={{...paymentCard, borderTop: isOverdue ? '6px solid #ef4444' : '6px solid #2563eb'}}>
                <div style={cardHeader}>
                  <span style={idTag}>LOAN ID: {loan.loanId}</span>
                  {isOverdue ? (
                    <span style={overdueBadge}>⚠️ OVERDUE</span>
                  ) : isPaidThisWeek ? (
                    <span style={paidBadge}>✅ PROCESSING</span>
                  ) : (
                    <span style={pendingBadge}>⏳ DUE</span>
                  )}
                </div>
                
                <div style={billingCycleBox}>
                  <div style={cycleItem}>
                    <label style={miniLabel}>EMI Amount</label>
                    <p style={cycleVal}>₹{loan.emiAmount || loan.weeklyEMI}</p>
                  </div>
                  <div style={{...cycleItem, borderLeft: '1px solid #e2e8f0', paddingLeft: '15px'}}>
                    <label style={miniLabel}>Due Date</label>
                    <p style={cycleVal}>{new Date(nextDue).toLocaleDateString()}</p>
                  </div>
                </div>

                {isOverdue && (
                  <div style={fineAlert}>
                    <strong>Late Fee:</strong> ₹{fine} added.
                  </div>
                )}

                <div style={actionRow}>
                  <button 
                    disabled={isPaidThisWeek}
                    // 👇 Switch functions here when Razorpay is live
                    onClick={() => handleOpenQR(loan)} 
                    // onClick={() => handleRazorpayPayment(loan)} 
                    style={isPaidThisWeek ? disabledBtn : payBtn}
                  >
                    {isPaidThisWeek ? "Verification Pending" : `Pay Now (₹${(loan.emiAmount || loan.weeklyEMI) + (isOverdue ? fine : 0)})`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TRANSACTION HISTORY */}
      <div style={historySection}>
        <h3 style={{fontWeight: '800', marginBottom: '20px'}}>Recent Payments</h3>
        <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
            <thead>
                <tr style={tableHeader}>
                    <th>DATE</th>
                    <th>UTR / RECEIPT</th>
                    <th>AMOUNT</th>
                    <th>STATUS</th>
                </tr>
            </thead>
            <tbody>
                {payments.length > 0 ? payments.slice(0, 10).map(p => (
                <tr key={p._id} style={tableRow}>
                    <td style={{padding: '12px 0'}}>{new Date(p.paymentDate || p.date).toLocaleDateString()}</td>
                    <td style={{fontSize: '11px'}}>{p.utr || p.razorpay_payment_id || 'N/A'}</td>
                    <td style={{fontWeight: 'bold'}}>₹{p.amount}</td>
                    <td>
                        <span style={{
                            color: p.status === 'Approved' ? '#059669' : '#d97706',
                            background: p.status === 'Approved' ? '#dcfce7' : '#fef3c7',
                            padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold'
                        }}>
                           ● {p.status?.toUpperCase()}
                        </span>
                    </td>
                </tr>
                )) : (
                    <tr><td colSpan="4" style={{textAlign:'center', padding:'20px', color:'#94a3b8'}}>No history found</td></tr>
                )}
            </tbody>
            </table>
        </div>
      </div>

      {/* Manual Payment Modal */}
      {showModal && selectedLoan && (
        <PaymentModal 
          loan={selectedLoan} 
          onClose={() => setShowModal(false)} 
          onRefresh={fetchData}
        />
      )}
    </div>
  );
};

// --- Styles ---
const headerSection = { marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' };
const gridContainer = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' };
const paymentCard = { background: '#fff', padding: '25px', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' };
const billingCycleBox = { display: 'flex', background: '#f8fafc', padding: '15px', borderRadius: '15px', marginBottom: '20px' };
const cycleItem = { flex: 1 };
const miniLabel = { fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' };
const cycleVal = { fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: '4px 0' };
const fineAlert = { background: '#fef2f2', color: '#991b1b', padding: '10px', borderRadius: '12px', fontSize: '12px', marginBottom: '20px', textAlign: 'center' };
const overdueBadge = { background: '#fee2e2', color: '#b91c1c', padding: '5px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: '900' };
const paidBadge = { background: '#dcfce7', color: '#166534', padding: '5px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: '900' };
const pendingBadge = { background: '#fef9c3', color: '#854d0e', padding: '5px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: '900' };
const idTag = { fontSize: '11px', color: '#94a3b8', fontWeight: '900' };
const actionRow = { display: 'flex', gap: '10px' };
const payBtn = { flex: 1, padding: '16px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', transition: '0.3s', fontSize: '11px', textTransform: 'uppercase' };
const disabledBtn = { ...payBtn, background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' };
const historySection = { marginTop: '50px', background: '#fff', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const tableHeader = { textAlign: 'left', color: '#94a3b8', fontSize: '10px', fontWeight: '900', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' };
const tableRow = { borderBottom: '1px solid #f8fafc', fontSize: '13px' };
const noDataBox = { gridColumn: '1/-1', textAlign: 'center', padding: '60px', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0', color: '#94a3b8' };

export default EMIPayments;