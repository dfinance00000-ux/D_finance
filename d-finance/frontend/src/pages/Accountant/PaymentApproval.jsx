import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { 
  FiCheck, FiX, FiClock, FiSearch, FiFileText, 
  FiImage, FiMaximize2, FiTrash2, FiExternalLink, FiUser, FiCreditCard, FiEdit 
} from 'react-icons/fi';

const PaymentApproval = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoomImg, setZoomImg] = useState(null);
  
  // --- 📝 Edit States ---
  const [editingPayment, setEditingPayment] = useState(null);
  const [finalAmount, setFinalAmount] = useState('');
  const [adminNote, setAdminNote] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/pending-payments');
      setPayments(res.data || []);
    } catch (err) { console.error("Fetch Error:", err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPayments(); }, []);

  // --- 🛠️ Open Approval Modal ---
  const openApprovalModal = (payment) => {
    setEditingPayment(payment);
    setFinalAmount(payment.amount); // Screenshot wala amount default bhara aayega
    setAdminNote(''); // Clear previous note
  };

  // --- ✅ FINAL APPROVE ACTION ---
  const handleFinalApprove = async () => {
    if (!window.confirm(`Approve ₹${finalAmount} for Loan ${editingPayment.loanId}?`)) return;

    try {
      await API.post(`/admin/approve-payment/${editingPayment._id}`, {
        loanId: editingPayment.loanId,
        amount: Number(finalAmount), // Edited Amount
        utr: editingPayment.utr,
        adminNote: adminNote // Aapka comment
      });
      
      alert("✅ Verified! Customer ledger updated.");
      setEditingPayment(null);
      fetchPayments(); 
    } catch (err) {
      alert("❌ Approval Failed: " + (err.response?.data?.error || "Server Error"));
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject and Delete this proof permanently?")) return;
    try {
      await API.delete(`/admin/reject-payment/${id}`);
      alert("🚫 Receipt Rejected.");
      fetchPayments(); 
    } catch (err) { alert("❌ Error: " + err.response?.data?.error); }
  };

  if (loading) return <div style={loaderStyle}>🔄 SYNCING AUDIT TERMINAL...</div>;

  return (
    <div style={containerStyle}>
      <style>{customStyles}</style>
      
      {/* --- 📝 APPROVAL & EDIT MODAL --- */}
      {editingPayment && (
        <div style={zoomOverlay}>
            <div style={editModalCard}>
                <h3 style={{margin:'0 0 20px 0', fontSize:'18px'}}>Finalize Verification</h3>
                
                <div style={inputGroup}>
                    <label style={labelS}>EDIT AMOUNT (IF REQUIRED)</label>
                    <div style={inputBox}>
                        <span style={{fontWeight:'900'}}>₹</span>
                        <input 
                            type="number" 
                            style={cleanInput} 
                            value={finalAmount} 
                            onChange={(e) => setFinalAmount(e.target.value)} 
                        />
                    </div>
                </div>

                <div style={inputGroup}>
                    <label style={labelS}>ACCOUNTANT COMMENT / NOTE</label>
                    <textarea 
                        placeholder="Ex: Verified via HDFC Statement..." 
                        style={textArea} 
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                    />
                </div>

                <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                    <button onClick={() => setEditingPayment(null)} style={cancelBtn}>CANCEL</button>
                    <button onClick={handleFinalApprove} style={approveBtnFull}>VERIFY & SYNC</button>
                </div>
            </div>
        </div>
      )}

      {/* --- Image Zoom Modal --- */}
      {zoomImg && (
        <div style={zoomOverlay} onClick={() => setZoomImg(null)}>
          <div style={zoomContent} onClick={(e) => e.stopPropagation()}>
            <img src={zoomImg} style={fullImg} alt="Receipt Full View" />
            <div style={zoomFooter}>
               <a href={zoomImg} target="_blank" rel="noreferrer" style={openLink}><FiExternalLink /> View Original</a>
               <button style={modalCloseBtn} onClick={() => setZoomImg(null)}><FiX /></button>
            </div>
          </div>
        </div>
      )}

      <div style={header}>
        <h2 style={title}>EMI VERIFICATION TERMINAL</h2>
        <p style={subtitle}>Review and correct manual proofs before syncing</p>
      </div>

      <div style={tableCard}>
        <table style={table}>
          <thead>
            <tr style={thRow}>
              <th style={cellP}>PROOF</th>
              <th style={cellP}>CUSTOMER</th>
              <th style={cellP}>UTR</th>
              <th style={cellP}>AMOUNT</th>
              <th style={cellP}>DATE</th>
              <th style={{...cellP, textAlign: 'right'}}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
                <tr key={p._id} style={trRow} className="table-row">
                  <td style={cellP}>
                    <div style={thumbBox} onClick={() => (p.screenshot || p.receiptPic) && setZoomImg(p.screenshot || p.receiptPic)}>
                      { (p.screenshot || p.receiptPic) ? (
                        <img src={p.screenshot || p.receiptPic} style={thumbImg} alt="Receipt" />
                      ) : <div style={noImg}><FiImage size={20}/></div>}
                    </div>
                  </td>
                  <td style={cellP}>
                    <b>{p.customerName}</b><br/>
                    <span style={loanIdTag}>{p.loanId}</span>
                  </td>
                  <td style={cellP}><span style={utrText}>{p.utr || 'N/A'}</span></td>
                  <td style={amtCell}>₹{p.amount?.toLocaleString()}</td>
                  <td style={dateCell}>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td style={cellP}>
                    <div style={{display:'flex', gap:'8px', justifyContent: 'flex-end'}}>
                      <button onClick={() => openApprovalModal(p)} style={approveBtn}>
                        <FiCheck /> VERIFY
                      </button>
                      <button onClick={() => handleReject(p._id)} style={rejectBtn}>
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && <div style={emptyBox}>No pending receipts.</div>}
      </div>
    </div>
  );
};

// --- Additional Styles ---
const editModalCard = { background:'#fff', padding:'30px', borderRadius:'30px', width:'100%', maxWidth:'380px', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' };
const inputGroup = { marginBottom:'15px', textAlign:'left' };
const labelS = { fontSize:'10px', fontWeight:'900', color:'#94a3b8', marginBottom:'8px', display:'block' };
const inputBox = { display:'flex', alignItems:'center', gap:'10px', background:'#f8fafc', padding:'12px 15px', borderRadius:'12px', border:'1.5px solid #e2e8f0' };
const cleanInput = { border:'none', background:'transparent', outline:'none', fontSize:'18px', fontWeight:'900', width:'100%' };
const textArea = { width:'100%', minHeight:'80px', padding:'12px', borderRadius:'12px', border:'1.5px solid #e2e8f0', background:'#f8fafc', fontSize:'13px', outline:'none', fontFamily:'inherit' };
const approveBtnFull = { flex:2, background:'#059669', color:'#fff', border:'none', padding:'14px', borderRadius:'12px', fontWeight:'900', cursor:'pointer' };
const cancelBtn = { flex:1, background:'#f1f5f9', color:'#64748b', border:'none', padding:'14px', borderRadius:'12px', fontWeight:'900', cursor:'pointer' };

// --- Re-using existing styles from your previous code ---
const containerStyle = { padding: '40px', background: '#f4f7fe', minHeight: '100vh', fontFamily: "'Inter', sans-serif" };
const header = { marginBottom: '35px' };
const title = { margin: 0, fontWeight: 950, color: '#0f172a', fontSize: '24px' };
const subtitle = { color: '#64748b', fontSize: '14px' };
const tableCard = { background: '#fff', borderRadius: '30px', padding: '10px', border: '1px solid #e2e8f0' };
const table = { width: '100%', borderCollapse: 'collapse' };
const cellP = { padding: '15px' };
const thRow = { textAlign: 'left', borderBottom: '1px solid #f1f5f9', color: '#94a3b8', fontSize:'11px', textTransform:'uppercase' };
const trRow = { borderBottom: '1px solid #f8fafc' };
const thumbBox = { width: '60px', height: '60px', background: '#f8fafc', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer', border:'1.5px solid #eef2ff' };
const thumbImg = { width: '100%', height: '100%', objectFit: 'cover' };
const loanIdTag = { background: '#eef2ff', color: '#6366f1', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '900' };
const utrText = { fontFamily: 'monospace', fontWeight: '700', color: '#475569' };
const amtCell = { fontWeight: '900', color: '#059669', fontSize: '17px', padding:'15px' };
const dateCell = { fontSize: '12px', color: '#94a3b8' };
const approveBtn = { background: '#059669', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: '900', fontSize: '10px', display:'flex', alignItems:'center', gap:'5px' };
const rejectBtn = { background: '#fff', color: '#ef4444', border: '1.5px solid #fee2e2', width: '35px', height: '35px', borderRadius: '10px', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center' };
const zoomOverlay = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.96)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)' };
const zoomContent = { position: 'relative', textAlign: 'center' };
const fullImg = { maxWidth: '100%', maxHeight: '80vh', borderRadius: '20px', border: '4px solid #fff' };
const zoomFooter = { display: 'flex', gap: '20px', marginTop: '20px', justifyContent:'center' };
const openLink = { color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: '700' };
const modalCloseBtn = { background:'#ef4444', color:'#fff', border:'none', width:'40px', height:'40px', borderRadius:'50%', cursor:'pointer' };
const emptyBox = { padding: '100px 0', textAlign: 'center', color: '#94a3b8' };
const loaderStyle = { height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', color:'#6366f1' };
const noImg = { height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#cbd5e1' };

const customStyles = `
  .table-row:hover { background: #fcfdfe !important; }
  button:hover { transform: translateY(-2px); filter: brightness(1.1); transition: 0.2s; }
`;

export default PaymentApproval;