import React, { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios'; // Professional API instance

const EMIPayments = () => {
  const [loans, setLoans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const fetchData = useCallback(async () => {
    if (!user.id && !user._id) return;
    
    try {
      // Atlas API Calls
      const [loanRes, payRes] = await Promise.all([
        API.get(`/loans?customerId=${user.id || user._id}`),
        API.get(`/payments?customerId=${user.id || user._id}`)
      ]);
      
      // Filter only Active or Overdue loans
      const activeLoans = loanRes.data.filter(l => l.status === 'Approved' || l.status === 'Overdue');
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

  // Logic to calculate Weekly Due and Overdue Penalty
  const getWeeklyBillingInfo = (loan) => {
    const nextDue = new Date(loan.nextEmiDate || Date.now());
    const today = new Date();
    
    // Check if paid for the current week
    const isPaidThisWeek = payments.some(p => {
      const pDate = new Date(p.date);
      const startOfWeek = new Date(nextDue);
      startOfWeek.setDate(startOfWeek.getDate() - 7);
      return p.loanId === loan.loanId && pDate >= startOfWeek && pDate <= nextDue;
    });

    let fine = 0;
    let isOverdue = today > nextDue && !isPaidThisWeek;
    if (isOverdue) fine = 200; // Fixed Weekly Late Fee for Mathura Model

    return { nextDue, isOverdue, fine, isPaidThisWeek };
  };

  const handleRazorpayPayment = async (loan, isFullSettlement) => {
    const { fine } = getWeeklyBillingInfo(loan);
    const amountToPay = isFullSettlement ? loan.amount : (Number(loan.weeklyEMI) + fine);

    try {
      // 1. Backend se Razorpay Order ID lena
      const orderRes = await API.post('/loans/create-order', { amount: amountToPay });
      const { orderId } = orderRes.data;

      // 2. Razorpay Window Options
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID, 
        amount: amountToPay * 100, // Paise
        currency: "INR",
        name: "D-FINANCE",
        description: isFullSettlement ? "Full Loan Settlement" : "Weekly EMI Payment",
        order_id: orderId,
        handler: async (response) => {
          // 3. Success: Update Atlas Database
          const paymentPayload = {
            loanId: loan.loanId,
            customerId: user.id || user._id,
            customerName: user.fullName,
            amount: amountToPay,
            lateFee: fine,
            razorpay_payment_id: response.razorpay_payment_id,
            date: new Date().toISOString(),
            status: "Success",
            type: isFullSettlement ? "Full Settlement" : "Weekly EMI"
          };

          await API.post('/payments', paymentPayload);
          
          if (isFullSettlement) {
            await API.patch(`/loans/${loan._id}`, { status: 'Closed' });
          }

          alert("Payment Successful! Database Updated.");
          fetchData();
        },
        prefill: { name: user.fullName, contact: user.mobile },
        theme: { color: "#0f172a" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Payment Gateway Error. Please try again.");
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={headerSection}>
        <h2 style={{ color: '#0f172a', margin: 0, fontWeight: '900' }}>💳 Weekly Repayment Portal</h2>
        <p style={{ color: '#64748b', fontSize: '13px' }}>Manage your weekly installments and clear dues via Razorpay.</p>
      </div>

      {loading ? (
        <div style={noDataBox}>🔄 Syncing with Atlas Cloud...</div>
      ) : loans.length === 0 ? (
        <div style={noDataBox}>
          <h3>No Active Installments</h3>
          <p>Approved loans will appear here for weekly repayment.</p>
        </div>
      ) : (
        <div style={gridContainer}>
          {loans.map(loan => {
            const { nextDue, isOverdue, fine, isPaidThisWeek } = getWeeklyBillingInfo(loan);
            return (
              <div key={loan._id} style={{...paymentCard, borderTop: isOverdue ? '6px solid #ef4444' : '6px solid #059669'}}>
                <div style={cardHeader}>
                  <span style={idTag}>LOAN ID: #{loan.loanId}</span>
                  {isOverdue && <span style={overdueBadge}>⚠️ OVERDUE</span>}
                  {isPaidThisWeek && <span style={paidBadge}>✅ WEEKLY DUE CLEAR</span>}
                </div>
                
                <div style={billingCycleBox}>
                  <div style={cycleItem}>
                    <label style={miniLabel}>Weekly EMI</label>
                    <p style={cycleVal}>₹{loan.weeklyEMI}</p>
                  </div>
                  <div style={{...cycleItem, borderLeft: '1px solid #e2e8f0', paddingLeft: '15px'}}>
                    <label style={miniLabel}>Next Due Date</label>
                    <p style={cycleVal}>{nextDue.toLocaleDateString()}</p>
                  </div>
                </div>

                {isOverdue && (
                  <div style={fineAlert}>
                    <strong>Late Fee Applied:</strong> ₹{fine} added due to delayed weekly payment.
                  </div>
                )}

                <div style={actionRow}>
                  <button 
                    disabled={isPaidThisWeek}
                    onClick={() => handleRazorpayPayment(loan, false)} 
                    style={isPaidThisWeek ? disabledBtn : payBtn}
                  >
                    {isPaidThisWeek ? "Weekly Paid" : `Pay Week EMI (₹${(Number(loan.weeklyEMI) + fine)})`}
                  </button>
                  <button onClick={() => handleRazorpayPayment(loan, true)} style={settleBtn}>Close Loan</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- PAYMENT HISTORY TABLE --- */}
      <div style={historySection}>
        <h3 style={{fontWeight: '800', marginBottom: '20px'}}>Transaction History</h3>
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
            {payments.slice(0, 10).map(p => (
              <tr key={p._id} style={tableRow}>
                <td style={{padding: '12px 0'}}>{new Date(p.date).toLocaleDateString()}</td>
                <td>{p.type}</td>
                <td style={{fontWeight: 'bold'}}>₹{p.amount}</td>
                <td><span style={{color: '#059669', fontWeight: 'bold'}}>● {p.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Styles Update ---
const headerSection = { marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' };
const gridContainer = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' };
const paymentCard = { background: '#fff', padding: '25px', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' };
const billingCycleBox = { display: 'flex', background: '#f8fafc', padding: '15px', borderRadius: '15px', marginBottom: '20px' };
const cycleItem = { flex: 1 };
const miniLabel = { fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' };
const cycleVal = { fontSize: '15px', fontWeight: '800', color: '#1e293b', margin: '4px 0' };
const fineAlert = { background: '#fef2f2', border: '1px solid #fee2e2', color: '#991b1b', padding: '12px', borderRadius: '12px', fontSize: '11px', marginBottom: '20px' };
const overdueBadge = { background: '#fee2e2', color: '#b91c1c', padding: '5px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '900' };
const paidBadge = { background: '#dcfce7', color: '#166534', padding: '5px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '900' };
const idTag = { fontSize: '11px', color: '#94a3b8', fontWeight: '900' };
const actionRow = { display: 'flex', gap: '10px' };
const payBtn = { flex: 2, padding: '14px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' };
const disabledBtn = { ...payBtn, background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' };
const settleBtn = { flex: 1, padding: '14px', background: '#fff', color: '#1e293b', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' };
const historySection = { marginTop: '50px', background: '#fff', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const tableHeader = { textAlign: 'left', color: '#94a3b8', fontSize: '10px', fontWeight: '900', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' };
const tableRow = { borderBottom: '1px solid #f8fafc', fontSize: '13px' };
const noDataBox = { gridColumn: '1/-1', textAlign: 'center', padding: '80px', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0', color: '#94a3b8' };

export default EMIPayments;