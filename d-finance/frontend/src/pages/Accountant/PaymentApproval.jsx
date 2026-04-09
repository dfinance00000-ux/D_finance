import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { FiCheck, FiX, FiClock, FiSearch, FiFileText } from 'react-icons/fi';

const PaymentApproval = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/pending-payments');
      setPayments(res.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const handleApprove = async (id) => {
    if (!window.confirm("Did you check the UTR in the statement?")) return;
    try {
      await API.post(`/admin/approve-payment/${id}`);
      alert("✅ Payment Approved! User balance updated.");
      fetchPayments();
    } catch (err) {
      alert("Error approving payment");
    }
  };

  if (loading) return <div style={loaderStyle}>Checking Cloud Ledger...</div>;

  return (
    <div style={containerStyle}>
      <div style={header}>
        <h2 style={title}>💰 EMI PAYMENT VERIFICATION</h2>
        <p style={subtitle}>Verify Customer UTRs & Update Loan Ledgers</p>
      </div>

      <div style={tableCard}>
        <table style={table}>
          <thead>
            <tr style={thRow}>
              <th>CUSTOMER & LOAN ID</th>
              <th>UTR / REF NUMBER</th>
              <th>AMOUNT</th>
              <th>DATE</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p._id} style={trRow}>
                <td>
                  <b style={{fontSize: '15px'}}>{p.customerName}</b><br/>
                  <small style={{color: '#64748b'}}>{p.loanId}</small>
                </td>
                <td style={utrCell}>{p.utr}</td>
                <td style={amtCell}>₹{p.amount}</td>
                <td style={dateCell}>{new Date(p.createdAt).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleApprove(p._id)} style={approveBtn}>
                    <FiCheck /> Approve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && <div style={emptyBox}>No pending payments to verify.</div>}
      </div>
    </div>
  );
};

// --- Styles ---
const containerStyle = { padding: '30px', background: '#f8fafc', minHeight: '100vh' };
const header = { marginBottom: '30px' };
const title = { margin: 0, fontWeight: 900, color: '#0f172a' };
const subtitle = { margin: '5px 0', color: '#64748b', fontSize: '13px' };
const tableCard = { background: '#fff', borderRadius: '25px', padding: '25px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' };
const table = { width: '100%', borderCollapse: 'collapse' };
const thRow = { textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#94a3b8', fontSize: '11px', padding: '15px' };
const trRow = { borderBottom: '1px solid #f8fafc' };
const utrCell = { fontFamily: 'monospace', fontWeight: 'bold', color: '#2563eb' };
const amtCell = { fontWeight: '900', color: '#10b981' };
const dateCell = { fontSize: '12px', color: '#64748b' };
const approveBtn = { background: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px' };
const emptyBox = { padding: '50px', textAlign: 'center', color: '#94a3b8', fontWeight: '700' };
const loaderStyle = { padding: '100px', textAlign: 'center', fontWeight: '900' };

export default PaymentApproval;