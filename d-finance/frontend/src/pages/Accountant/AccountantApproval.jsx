import React, { useState, useEffect, useCallback } from 'react';
import API from "../../api/axios"; 
import { 
  FiUser, FiHome, FiCreditCard, FiCamera, 
  FiCheckCircle, FiX, FiInfo, FiImage, FiSlash, FiMaximize2, FiTrash2, FiMapPin, FiBriefcase 
} from 'react-icons/fi';

const AccountantApproval = () => {
  const [verifiedLoans, setVerifiedLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [zoomImg, setZoomImg] = useState(null); 
  const [confirmTransfer, setConfirmTransfer] = useState(false);

  const user = JSON.parse(localStorage.getItem('user')) || {};

  const fetchVerified = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/all-loans');
      const pendingApproval = res.data.filter(loan => 
        loan.status !== 'Rejected' && 
        loan.status !== 'Disbursed' &&
        loan.status !== 'Closed' &&
        ['Field Verified', 'Verification Pending', 'Applied'].includes(loan.status)
      );
      setVerifiedLoans(pendingApproval.reverse());
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVerified(); }, [fetchVerified]);

  const handleDisburse = async (mongoId) => {
    if (!confirmTransfer) return alert("Please authorize the payment check first.");
    if (!window.confirm("Confirm: Funds have been transferred?")) return;
    try {
      const res = await API.post(`/accountant/approve/${mongoId}`);
      if (res.data.success) {
        alert("💰 DISBURSEMENT SUCCESSFUL!");
        closeModal();
        fetchVerified(); 
      }
    } catch (err) {
      alert("❌ Error: " + (err.response?.data?.error || "Sync Failed"));
    }
  };

  const handleReject = async (mongoId) => {
    const reason = window.prompt("REJECTION REASON:");
    if (!reason) return alert("Reason is mandatory.");
    try {
      await API.patch(`/loans/${mongoId}`, { status: 'Rejected', rejectionReason: reason });
      alert("🚫 LOAN REJECTED.");
      closeModal();
      fetchVerified(); 
    } catch (err) { alert("❌ Rejection Failed."); }
  };

  const handleDeleteLoan = async (mongoId) => {
    if (!window.confirm("⚠️ DANGER: PERMANENTLY DELETE THIS FILE?")) return;
    try {
      await API.delete(`/loans/${mongoId}`);
      alert("🗑️ DELETED PERMANENTLY.");
      closeModal();
      fetchVerified();
    } catch (err) { alert("❌ Delete Failed."); }
  };

  const closeModal = () => {
    setSelectedLoan(null);
    setConfirmTransfer(false);
  };

  if (loading) return <div style={loaderStyle}>🔄 ACCESSING D-FINANCE LEDGER...</div>;

  return (
    <div style={containerStyle}>
      <style>{responsiveCSS}</style>
      
      {zoomImg && (
        <div style={zoomOverlay} onClick={() => setZoomImg(null)}>
          <div style={zoomContent}>
            <FiX style={zoomClose} onClick={() => setZoomImg(null)} />
            <img src={zoomImg} style={fullImg} alt="KYC" />
          </div>
        </div>
      )}

      <div style={headerSection} className="header-resp">
        <div>
          <h2 style={mainTitle}>🛡️ ACCOUNTANT TERMINAL</h2>
          <p style={subTitleText}>Secure Payout Node | Officer: {user.fullName}</p>
        </div>
        <button onClick={fetchVerified} style={refreshBtn}>REFRESH QUEUE</button>
      </div>

      <div className="grid-resp" style={grid}>
        {verifiedLoans.length === 0 ? (
          <div style={noDataBox}><FiCheckCircle size={50} color="#10b981" /><p>No pending approvals.</p></div>
        ) : (
          verifiedLoans.map(loan => (
            <div key={loan._id} style={card}>
              <div style={cardHeader}>
                <span style={idTag}>{loan.loanId}</span>
                <span style={statusBadge}>{loan.status}</span>
              </div>
              <h3 style={custNameText}>{loan.customerName}</h3>
              <div style={miniStatsBox}>
                <div><small>PAYOUT</small><br/><b>₹{loan.netDisbursed || loan.amount}</b></div>
                <div><small>DAILY</small><br/><b>₹{loan.dailyEMI || 0}</b></div>
              </div>
              <button onClick={() => setSelectedLoan(loan)} style={auditBtn}>Open Audit File</button>
            </div>
          ))
        )}
      </div>

      {selectedLoan && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={modalHeader}>
              <h3 style={{margin:0}}>FILE AUDIT: {selectedLoan.loanId}</h3>
              <FiX onClick={closeModal} style={{cursor:'pointer'}} />
            </div>

            <div style={modalBody}>
              {/* 1. Customer Bank Details */}
              <div style={sectionCard('#f0fdf4', '#10b981')}>
                <h4 style={sectionTitle}><FiCreditCard/> BANK SETTLEMENT DETAILS</h4>
                <div className="info-grid-resp" style={infoGrid}>
                  <DataField label="A/C Holder" value={selectedLoan.accountHolderName} />
                  <DataField label="Bank Name" value={selectedLoan.bankName} />
                  <DataField label="Account No." value={selectedLoan.accountNumber} highlight />
                  <DataField label="IFSC Code" value={selectedLoan.ifscCode} highlight />
                  <DataField label="Mobile" value={selectedLoan.customerMobile} />
                  <DataField label="Net Payout" value={`₹${selectedLoan.netDisbursed || selectedLoan.amount}`} highlight />
                </div>
              </div>

              {/* 2. Field Officer LUC Report */}
              <div style={sectionCard('#fffbeb', '#f59e0b')}>
                <h4 style={sectionTitle}><FiMapPin/> FIELD VERIFICATION (LUC) REPORT</h4>
                <div className="info-grid-resp" style={infoGrid}>
                  <DataField label="House Type" value={selectedLoan.houseType} />
                  <DataField label="Religion" value={selectedLoan.religion} />
                  <DataField label="Monthly Income" value={`₹${selectedLoan.monthlyIncome}`} />
                  <DataField label="Area Type" value={selectedLoan.areaType} />
                  <DataField label="Verified By" value={selectedLoan.verifiedByName} />
                  <DataField label="Audit Date" value={new Date(selectedLoan.inspectionDate).toLocaleDateString()} />
                </div>
              </div>

              {/* 3. Nominee Info */}
              <div style={sectionCard('#f8fafc', '#64748b')}>
                <h4 style={sectionTitle}><FiUser/> NOMINEE DETAILS</h4>
                <div className="info-grid-resp" style={infoGrid}>
                  <DataField label="Name" value={selectedLoan.nomineeName} />
                  <DataField label="Relation" value={selectedLoan.nomineeRelation} />
                  <DataField label="Nominee Mob." value={selectedLoan.nomineeMobile} />
                </div>
              </div>

              {/* 4. Digital Documents Vault */}
              <div style={sectionCard('#fff', '#0f172a')}>
                <h4 style={sectionTitle}><FiCamera/> DOCUMENT VERIFICATION (KYC)</h4>
                <div style={imageScroll} className="scroll-resp">
                  <DocThumbnail label="Customer Passbook" src={selectedLoan.passbookPic} onZoom={setZoomImg} />
                  <DocThumbnail label="Aadhaar Front" src={selectedLoan.aadhaarFront} onZoom={setZoomImg} />
                  <DocThumbnail label="Aadhaar Back" src={selectedLoan.aadhaarBack} onZoom={setZoomImg} />
                  <DocThumbnail label="Secondary Front" src={selectedLoan.secondaryIdFront} onZoom={setZoomImg} />
                  <DocThumbnail label="Secondary Back" src={selectedLoan.secondaryIdBack} onZoom={setZoomImg} />
                  <DocThumbnail label="Nominee Pic" src={selectedLoan.nomineePic} onZoom={setZoomImg} />
                </div>
              </div>
            </div>

            <div style={modalFooter} className="footer-resp">
              <div style={actionRow}>
                <label style={checkboxLabel}>
                  <input type="checkbox" checked={confirmTransfer} onChange={(e) => setConfirmTransfer(e.target.checked)} />
                  <span>Authorized: Funds dispatched to verified bank account</span>
                </label>
              </div>
              <div style={footerButtons} className="btn-group-resp">
                <button onClick={() => handleDeleteLoan(selectedLoan._id)} style={deleteBtn}><FiTrash2 /> Delete</button>
                <button onClick={() => handleReject(selectedLoan._id)} style={rejectBtn}><FiSlash/> Reject</button>
                <button onClick={() => handleDisburse(selectedLoan._id)} disabled={!confirmTransfer} style={confirmTransfer ? disburseBtn : disabledBtn}>
                  <FiCheckCircle/> Release Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Helpers & Styles ---
const DataField = ({ label, value, highlight }) => (
  <div style={{minWidth: '120px'}}>
    <p style={{ margin: 0, fontSize: '9px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>{label}</p>
    <p style={{ margin: '2px 0 0 0', fontSize: '14px', fontWeight: 800, color: highlight ? '#2563eb' : '#1e293b' }}>{value || 'Not Provided'}</p>
  </div>
);

const DocThumbnail = ({ label, src, onZoom }) => (
  <div style={thumbContainer} onClick={() => src && onZoom(src)}>
    <p style={{fontSize: '9px', fontWeight: 900, textAlign: 'center', marginBottom: '8px', color: '#64748b'}}>{label}</p>
    {src ? (
      <div style={imgWrapper}>
        <img src={src} style={thumbImg} alt="doc" />
        <div style={zoomBadge}><FiMaximize2 size={10}/></div>
      </div>
    ) : (
      <div style={noImg}>MISSING</div>
    )}
  </div>
);

// --- CSS Variables ---
const containerStyle = { padding: '20px', background: '#f4f7fe', minHeight: '100vh', fontFamily: 'sans-serif' };
const headerSection = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const mainTitle = { margin: 0, fontWeight: 950, fontSize: '24px', color: '#0f172a' };
const subTitleText = { fontSize: '11px', fontWeight: '800', color: '#64748b', margin: '5px 0 0 0' };
const refreshBtn = { background: '#0f172a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '12px' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' };
const card = { background: '#fff', padding: '25px', borderRadius: '30px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: '15px' };
const idTag = { background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: '900' };
const statusBadge = { fontSize: '10px', fontWeight: '900', color: '#2563eb', textTransform: 'uppercase' };
const custNameText = { margin: '0 0 15px 0', fontSize: '20px', fontWeight: '900', color: '#1e293b' };
const miniStatsBox = { display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#f8fafc', borderRadius: '20px', marginBottom: '15px' };
const auditBtn = { width: '100%', padding: '15px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: '900', cursor: 'pointer' };

const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(10px)', padding: '10px' };
const modalContent = { background: '#fff', borderRadius: '35px', width: '100%', maxWidth: '900px', maxHeight: '95vh', overflow: 'hidden' };
const modalHeader = { padding: '20px 30px', background: '#0f172a', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const modalBody = { padding: '20px 30px', overflowY: 'auto', maxHeight: '65vh' };
const modalFooter = { padding: '20px 30px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' };

const sectionCard = (bg, border) => ({ background: bg, padding: '20px', borderRadius: '25px', marginBottom: '15px', border: `1.5px solid ${border}15` });
const sectionTitle = { fontSize: '11px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: '#475569', textTransform: 'uppercase' };
const infoGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' };
const imageScroll = { display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' };
const thumbContainer = { flex: '0 0 130px', cursor: 'pointer' };
const imgWrapper = { position: 'relative', height: '100px', borderRadius: '15px', overflow: 'hidden', border: '2px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' };
const thumbImg = { width: '100%', height: '100%', objectFit: 'cover' };
const zoomBadge = { position: 'absolute', bottom: '5px', right: '5px', background: 'rgba(0,0,0,0.5)', color: '#fff', padding: '4px', borderRadius: '6px' };

const actionRow = { marginBottom: '15px', padding: '12px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' };
const checkboxLabel = { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontWeight: '800', color: '#059669', cursor: 'pointer' };
const footerButtons = { display: 'flex', gap: '10px' };

const disburseBtn = { flex: 2, padding: '16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px' };
const disabledBtn = { ...disburseBtn, background: '#cbd5e1', cursor: 'not-allowed' };
const rejectBtn = { flex: 1, padding: '16px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px' };
const deleteBtn = { padding: '16px 20px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px' };

const zoomOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const zoomContent = { position: 'relative', width: '90%', maxWidth: '1000px' };
const fullImg = { width: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: '10px' };
const zoomClose = { position: 'absolute', top: '-40px', right: '0', color: '#fff', fontSize: '30px', cursor: 'pointer' };
const noImg = { height: '100px', background: '#f1f5f9', color: '#cbd5e1', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '900' };
const noDataBox = { gridColumn: '1/-1', textAlign: 'center', padding: '100px', background: '#fff', borderRadius: '40px', color: '#94a3b8', fontWeight: '800' };
const loaderStyle = { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#94a3b8' };

const responsiveCSS = `
  @media (max-width: 768px) {
    .header-resp { flex-direction: column; gap: 15px; align-items: flex-start !important; }
    .grid-resp { grid-template-columns: 1fr !important; }
    .info-grid-resp { grid-template-columns: 1fr 1fr !important; }
    .btn-group-resp { flex-direction: column; }
    .btn-group-resp button { width: 100%; flex: none !important; }
    .footer-resp { padding: 15px !important; }
  }
  .scroll-resp::-webkit-scrollbar { height: 6px; }
  .scroll-resp::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
`;

export default AccountantApproval;