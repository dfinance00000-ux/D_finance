import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { 
  FiCheck, FiX, FiClock, FiSearch, FiFileText, 
  FiImage, FiMaximize2, FiTrash2, FiExternalLink, FiUser, FiCreditCard 
} from 'react-icons/fi';

const PaymentApproval = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoomImg, setZoomImg] = useState(null);

  // --- 🔄 Fetch All Pending Receipts ---
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

  useEffect(() => {
    fetchPayments();
  }, []);

  // --- ✅ APPROVE: Deduct Balance & Sync History ---
  const handleApprove = async (payment) => {
    const confirmMsg = `Confirm Approval: ₹${payment.amount} for Loan ${payment.loanId}?\n\nThis will automatically deduct the balance from the customer's account.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await API.post(`/admin/approve-payment/${payment._id}`, {
        loanId: payment.loanId,
        amount: Number(payment.amount),
        utr: payment.utr
      });
      
      alert("✅ Verified! Customer balance adjusted successfully.");
      fetchPayments(); 
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Server connection failed";
      alert("❌ Approval Failed: " + errorMsg);
    }
  };

  // --- ❌ REJECT: Delete Proof & Notify ---
  const handleReject = async (id) => {
    const confirmMsg = "Are you sure you want to REJECT and PERMANENTLY DELETE this proof?\n\nThe customer will need to resubmit their request.";
    if (!window.confirm(confirmMsg)) return;
    
    try {
      const res = await API.delete(`/admin/reject-payment/${id}`);
      
      if (res.status === 200 || res.data.success) {
        alert("🚫 Receipt Rejected & Entry Removed.");
        fetchPayments(); 
      }
    } catch (err) {
      console.error("Reject Error:", err.response?.data);
      const msg = err.response?.data?.error || "Check if backend route /admin/reject-payment/:id exists.";
      alert("❌ Error: " + msg);
    }
  };

  if (loading) return <div style={loaderStyle}>🔄 SYNCING AUDIT TERMINAL...</div>;

  return (
    <div style={containerStyle}>
      <style>{customStyles}</style>
      
      {/* --- Image Zoom Modal --- */}
      {zoomImg && (
        <div style={zoomOverlay} onClick={() => setZoomImg(null)}>
          <div style={zoomContent} onClick={(e) => e.stopPropagation()}>
            <img src={zoomImg} style={fullImg} alt="Receipt Full View" />
            <div style={zoomCloseHint}>Click anywhere outside to close</div>
            <div style={zoomFooter}>
               <a href={zoomImg} target="_blank" rel="noreferrer" style={openLink}><FiExternalLink /> Open in New Tab</a>
               <button style={modalCloseBtn} onClick={() => setZoomImg(null)}><FiX /></button>
            </div>
          </div>
        </div>
      )}

      {/* --- Header Section --- */}
      <div style={header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={titleIcon}>💰</div>
            <div>
                <h2 style={title}>EMI VERIFICATION TERMINAL</h2>
                <p style={subtitle}>Review manual proofs to sync customer accounts</p>
            </div>
        </div>
      </div>

      {/* --- Ledger Table --- */}
      <div style={tableCard}>
        <table style={table}>
          <thead>
            <tr style={thRow}>
              <th style={cellP}>PROOF / RECEIPT</th>
              <th style={cellP}>CUSTOMER INFO</th>
              <th style={cellP}>UTR / REFERENCE</th>
              <th style={cellP}>AMOUNT</th>
              <th style={cellP}>SUBMITTED ON</th>
              <th style={{...cellP, textAlign: 'right'}}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => {
              // 🔥 Key Mapping Fix: Backend 'screenshot' key ko priority de rahe hain
              const currentProof = p.screenshot || p.receiptPic || p.proof;

              return (
                <tr key={p._id} style={trRow} className="table-row">
                  <td style={cellP}>
                    <div 
                      style={thumbBox} 
                      onClick={() => currentProof && setZoomImg(currentProof)}
                    >
                      { currentProof ? (
                        <>
                          <img 
                            src={currentProof} 
                            style={thumbImg} 
                            alt="Receipt" 
                            onError={(e) => { e.target.src="https://via.placeholder.com/150?text=Error+Loading"; }}
                          />
                          <div style={zoomHint} className="zoom-hover"><FiMaximize2 size={12}/></div>
                        </>
                      ) : (
                        <div style={noImg}><FiImage size={20}/> <span style={{fontSize:'8px', marginTop:'4px'}}>NO PIC</span></div>
                      )}
                    </div>
                  </td>
                  <td style={cellP}>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <div style={userAvatar}><FiUser /></div>
                        <div>
                            <b style={{fontSize: '14px', color:'#0f172a', textTransform: 'uppercase'}}>{p.customerName || 'Walk-in'}</b><br/>
                            <span style={loanIdTag}>{p.loanId}</span>
                        </div>
                    </div>
                  </td>
                  <td style={cellP}>
                    <div style={utrContainer}>
                        <FiCreditCard size={12} color="#94a3b8" />
                        <span style={utrText}>{p.utr || 'N/A'}</span>
                    </div>
                  </td>
                  <td style={{...cellP, ...amtCell}}>₹{p.amount?.toLocaleString('en-IN')}</td>
                  <td style={{...cellP, ...dateCell}}>{new Date(p.createdAt).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})}</td>
                  <td style={cellP}>
                    <div style={{display:'flex', gap:'10px', justifyContent: 'flex-end'}}>
                      <button onClick={() => handleApprove(p)} style={approveBtn} title="Approve & Adjust Balance">
                        <FiCheck /> APPROVE
                      </button>
                      <button onClick={() => handleReject(p._id)} style={rejectBtn} title="Reject Proof">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {payments.length === 0 && (
          <div style={emptyBox}>
            <div style={{fontSize: '40px', marginBottom: '15px'}}>✨</div>
            No pending receipts. All customer ledgers are in sync.
          </div>
        )}
      </div>
    </div>
  );
};

// --- Updated Styles ---
const containerStyle = { padding: '40px', background: '#f4f7fe', minHeight: '100vh', fontFamily: "'Inter', sans-serif" };
const header = { marginBottom: '35px' };
const titleIcon = { fontSize: '32px', background: '#fff', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '20px', boxShadow: '0 10px 20px rgba(0,0,0,0.02)' };
const title = { margin: 0, fontWeight: 950, color: '#0f172a', letterSpacing: '-0.8px', fontSize: '24px' };
const subtitle = { margin: '5px 0', color: '#64748b', fontSize: '14px', fontWeight: '500' };

const tableCard = { background: '#fff', borderRadius: '30px', padding: '10px', border: '1px solid #e2e8f0', boxShadow: '0 15px 35px rgba(0,0,0,0.03)', overflow:'hidden' };
const table = { width: '100%', borderCollapse: 'collapse' };
const thRow = { textAlign: 'left', borderBottom: '1px solid #f1f5f9', color: '#94a3b8', fontSize:'11px', textTransform:'uppercase', letterSpacing:'1px' };
const cellP = { padding: '15px' };
const trRow = { borderBottom: '1px solid #f8fafc', transition: '0.2s' };

const thumbBox = { width: '65px', height: '65px', background: '#f8fafc', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer', position: 'relative', border:'1.5px solid #eef2ff', transition: '0.3s' };
const thumbImg = { width: '100%', height: '100%', objectFit: 'cover' };
const zoomHint = { position:'absolute', inset:0, background:'rgba(15, 23, 42, 0.4)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', opacity:0, transition:'0.3s' };
const noImg = { height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#cbd5e1' };

const userAvatar = { width:'35px', height:'35px', background:'#f1f5f9', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b' };
const loanIdTag = { background: '#eef2ff', color: '#6366f1', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '900', marginTop: '4px', display: 'inline-block' };

const utrContainer = { display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '6px 10px', borderRadius: '8px', border: '1px solid #f1f5f9', width: 'fit-content' };
const utrText = { fontFamily: 'monospace', fontWeight: '700', color: '#475569', fontSize: '12px' };

const amtCell = { fontWeight: '900', color: '#059669', fontSize: '17px' };
const dateCell = { fontSize: '12px', color: '#94a3b8', fontWeight: '700' };

const approveBtn = { background: '#059669', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: '900', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s', boxShadow:'0 4px 12px rgba(5, 150, 105, 0.2)' };
const rejectBtn = { background: '#fff', color: '#ef4444', border: '1.5px solid #fee2e2', width: '38px', height: '38px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition:'0.2s' };

const zoomOverlay = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.96)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)' };
const zoomContent = { position: 'relative', textAlign: 'center', maxWidth:'95%' };
const fullImg = { maxWidth: '100%', maxHeight: '80vh', borderRadius: '20px', boxShadow: '0 0 50px rgba(0,0,0,0.5)', border: '4px solid #fff' };
const zoomCloseHint = { color: '#94a3b8', marginTop: '12px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' };
const zoomFooter = { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '20px' };
const openLink = { color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' };
const modalCloseBtn = { background:'#ef4444', color:'#fff', border:'none', width:'40px', height:'40px', borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' };

const emptyBox = { padding: '100px 0', textAlign: 'center', color: '#94a3b8', fontWeight: '700', fontSize:'15px' };
const loaderStyle = { height:'100vh', background: '#f4f7fe', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', color:'#6366f1', letterSpacing:'2px', fontSize: '12px' };

const customStyles = `
  .table-row:hover { background: #fcfdfe !important; }
  .table-row:hover .zoom-hover { opacity: 1 !important; }
  .table-row:hover .thumbBox { transform: scale(1.05); border-color: #6366f1; }
  button:hover { transform: translateY(-2px); filter: brightness(1.1); }
  button:active { transform: translateY(0); }
`;

export default PaymentApproval;