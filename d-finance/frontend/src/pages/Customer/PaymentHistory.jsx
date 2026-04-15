import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { 
  FiClock, FiCheckCircle, FiXCircle, FiInfo, FiHash, 
  FiUser, FiCalendar, FiMaximize2, FiX, FiChevronDown 
} from 'react-icons/fi';

const PaymentHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [selectedPay, setSelectedPay] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get('/loans/my-payments');
        setHistory(res.data);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Approved': return { bg: '#f0fdf4', text: '#16a34a', icon: <FiCheckCircle />, border: '#bcf0da' };
      case 'Rejected': return { bg: '#fef2f2', text: '#dc2626', icon: <FiXCircle />, border: '#fecaca' };
      default: return { bg: '#fff7ed', text: '#ea580c', icon: <FiClock />, border: '#fed7aa' };
    }
  };

  const displayedHistory = showAll ? history : history.slice(0, 3);

  if (loading) return <div style={loaderStyle}>🔄 SYNCING PAYMENT RECORDS...</div>;

  return (
    <div style={containerStyle}>
      <style>{customAnims}</style>
      <h2 style={titleStyle}>💳 Payment History</h2>
      <p style={subTitle}>Track your deposits and verification status from Mathura Branch.</p>

      <div style={listContainer}>
        {history.length > 0 ? (
          <>
            {displayedHistory.map((item) => {
              const style = getStatusStyle(item.status);
              return (
                <div key={item._id} style={{...cardStyle, borderLeft: `6px solid ${style.text}`}} onClick={() => setSelectedPay(item)} className="history-card">
                  <div style={cardHeader}>
                    <div style={amountSection}>
                      <span style={amtText}>₹{item.amount.toLocaleString('en-IN')}</span>
                      <span style={dateText}>{new Date(item.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })}</span>
                    </div>
                    <div style={{ ...statusBadge, background: style.bg, color: style.text, border: `1px solid ${style.border}` }}>
                      {style.icon} {item.status.toUpperCase()}
                    </div>
                  </div>
                  <div style={clickHint}><FiMaximize2 size={10} /> View Verification Details</div>
                </div>
              );
            })}

            {history.length > 3 && !showAll && (
              <button onClick={() => setShowAll(true)} style={viewMoreBtn}>
                View All Transactions ({history.length}) <FiChevronDown />
              </button>
            )}
          </>
        ) : (
          <div style={emptyState}>No transaction history available.</div>
        )}
      </div>

      {/* --- 🔍 ENHANCED DETAIL MODAL --- */}
      {selectedPay && (
        <div style={modalOverlay} onClick={() => setSelectedPay(null)}>
          <div style={modalContent} onClick={e => e.stopPropagation()} className="modal-pop">
            <div style={modalHeader}>
              <h3 style={{margin:0, fontSize:'16px'}}>Audit Trail: {selectedPay.loanId}</h3>
              <FiX style={{cursor:'pointer', fontSize:'20px'}} onClick={() => setSelectedPay(null)} />
            </div>

            <div style={modalBody}>
               <div style={imgContainer}>
                  <label style={labelS}>SUBMITTED PROOF</label>
                  {selectedPay.screenshot ? (
                    <div style={receiptWrapper}>
                        <img src={selectedPay.screenshot} alt="Receipt" style={receiptImg} />
                    </div>
                  ) : (
                    <div style={noImgBox}>No Screenshot Available</div>
                  )}
               </div>

               <div style={infoGrid}>
                  <div style={infoBox}>
                    <FiHash color="#3b82f6" />
                    <div>
                      <small>UTR/TXN ID</small>
                      <p>{selectedPay.utr || 'N/A'}</p>
                    </div>
                  </div>
                  <div style={infoBox}>
                    <FiUser color="#3b82f6" />
                    <div>
                      <small>Verification Status</small>
                      {/* 🔥 FIXED LOGIC: Displays real auditor name if approved, else status */}
                      <p>
                        {selectedPay.status === 'Pending' 
                          ? "Under Review" 
                          : (selectedPay.verifiedBy || selectedPay.status)}
                      </p>
                    </div>
                  </div>
               </div>

               <div style={{marginTop:'15px'}}>
                  <label style={labelS}>ACCOUNTANT REMARKS</label>
                  <div style={{...commentBox, borderLeft: `4px solid ${getStatusStyle(selectedPay.status).text}`}}>
                    <FiInfo size={14} style={{marginTop:'2px'}} />
                    <span>{selectedPay.adminNote || "Your payment is being verified by the finance team."}</span>
                  </div>
               </div>

               <button style={closeBtn} onClick={() => setSelectedPay(null)}>Back to Portal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- STYLES ---
const containerStyle = { padding: '20px', maxWidth: '480px', margin: '0 auto', fontFamily: 'Inter, sans-serif' };
const titleStyle = { margin: '0', fontSize: '24px', fontWeight: '950', color: '#0f172a', letterSpacing:'-0.5px' };
const subTitle = { color: '#64748b', fontSize: '12px', marginBottom: '25px', fontWeight:'500' };
const listContainer = { display: 'flex', flexDirection: 'column', gap: '15px' };
const cardStyle = { background: '#fff', padding: '18px', borderRadius: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', cursor: 'pointer', transition: '0.3s', position: 'relative' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const amountSection = { display: 'flex', flexDirection: 'column' };
const amtText = { fontSize: '20px', fontWeight: '900', color: '#0f172a' };
const dateText = { fontSize: '11px', color: '#94a3b8', fontWeight: '800', marginTop:'2px' };
const statusBadge = { padding: '6px 12px', borderRadius: '12px', fontSize: '9px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '5px' };
const clickHint = { fontSize: '9px', color: '#3b82f6', marginTop: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', textTransform:'uppercase' };
const viewMoreBtn = { width:'100%', background: '#f8fafc', border: '1.5px solid #e2e8f0', padding: '14px', borderRadius: '18px', color: '#475569', fontWeight: '900', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop:'10px' };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.92)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px', backdropFilter: 'blur(8px)' };
const modalContent = { background: '#fff', borderRadius: '35px', width: '100%', maxWidth: '400px', overflow: 'hidden', boxShadow:'0 25px 50px rgba(0,0,0,0.3)' };
const modalHeader = { padding: '20px 25px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', color: '#fff' };
const modalBody = { padding: '25px', maxHeight: '85vh', overflowY: 'auto' };
const receiptWrapper = { background:'#f8fafc', padding:'10px', borderRadius:'20px', border:'1px solid #e2e8f0' };
const receiptImg = { width: '100%', borderRadius: '15px', maxHeight: '250px', objectFit: 'contain' };
const labelS = { fontSize: '10px', fontWeight: '950', color: '#94a3b8', marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing:'1px' };
const infoGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px', marginTop:'20px' };
const infoBox = { background: '#f8fafc', padding: '12px', borderRadius: '15px', display: 'flex', gap: '10px', alignItems: 'center', border:'1px solid #f1f5f9' };
const commentBox = { background: '#f8fafc', padding: '15px', borderRadius: '18px', fontSize: '12px', color: '#475569', display: 'flex', gap: '10px', lineHeight:'1.5' };
const imgContainer = { width: '100%' };
const closeBtn = { width: '100%', padding: '18px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '20px', fontWeight: '900', marginTop: '25px', cursor: 'pointer', fontSize:'14px' };
const noImgBox = { height: '120px', background: '#f1f5f9', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '12px', fontWeight:'700' };
const loaderStyle = { height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', color:'#6366f1', background:'#f8fafc' };
const emptyState = { textAlign: 'center', padding: '60px 20px', color: '#94a3b8', fontWeight: '700' };

const customAnims = `
  .history-card:active { transform: scale(0.98); }
  .modal-pop { animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
  @keyframes modalIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  small { font-size: 9px; font-weight: 900; color: #94a3b8; text-transform: uppercase; display: block; }
  p { margin: 2px 0 0 0; font-size: 13px; font-weight: 800; color: #0f172a; }
`;

export default PaymentHistory;