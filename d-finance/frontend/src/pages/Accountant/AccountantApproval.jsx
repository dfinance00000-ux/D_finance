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
      
      {/* Zoom Image Overlay */}
      {zoomImg && (
        <div style={zoomOverlay} onClick={() => setZoomImg(null)}>
          <div style={zoomContent}>
            <FiX style={zoomClose} onClick={() => setZoomImg(null)} />
            <img src={zoomImg} style={fullImg} alt="KYC" />
          </div>
        </div>
      )}

      {/* Header Section */}
      <div style={headerSection} className="header-resp">
        <div>
          <h2 style={mainTitle}>🛡️ ACCOUNTANT TERMINAL</h2>
          <p style={subTitleText}>Secure Payout Node | Officer: {user.fullName}</p>
        </div>
        <button onClick={fetchVerified} style={refreshBtn}>REFRESH QUEUE</button>
      </div>

      {/* Main Grid */}
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

      {/* Audit Modal */}
      {selectedLoan && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={modalHeader}>
              <h3 style={{margin:0, fontSize: '16px'}}>FILE: {selectedLoan.loanId}</h3>
              <FiX onClick={closeModal} style={{cursor:'pointer', fontSize: '20px'}} />
            </div>

            <div style={modalBody} className="modal-body-resp">
              {/* 1. Bank Details */}
              <div style={sectionCard('#f0fdf4', '#10b981')}>
                <h4 style={sectionTitle}><FiCreditCard/> BANK SETTLEMENT</h4>
                <div className="info-grid-resp" style={infoGrid}>
                  <DataField label="A/C Holder" value={selectedLoan.accountHolderName} />
                  <DataField label="Bank Name" value={selectedLoan.bankName} />
                  <DataField label="Account No." value={selectedLoan.accountNumber} highlight />
                  <DataField label="IFSC Code" value={selectedLoan.ifscCode} highlight />
                  <DataField label="Net Payout" value={`₹${selectedLoan.netDisbursed || selectedLoan.amount}`} highlight />
                </div>
              </div>

              {/* 2. LUC Report */}
              <div style={sectionCard('#fffbeb', '#f59e0b')}>
                <h4 style={sectionTitle}><FiMapPin/> FIELD REPORT (LUC)</h4>
                <div className="info-grid-resp" style={infoGrid}>
                  <DataField label="House Type" value={selectedLoan.houseType} />
                  <DataField label="Income" value={`₹${selectedLoan.monthlyIncome}`} />
                  <DataField label="Verified By" value={selectedLoan.verifiedByName} />
                  <DataField label="Place" value={selectedLoan.locationName} />
                </div>
              </div>

              {/* 3. Nominee */}
              <div style={sectionCard('#f8fafc', '#64748b')}>
                <h4 style={sectionTitle}><FiUser/> NOMINEE INFO</h4>
                <div className="info-grid-resp" style={infoGrid}>
                  <DataField label="Name" value={selectedLoan.nomineeName} />
                  <DataField label="Relation" value={selectedLoan.nomineeRelation} />
                  <DataField label="Mobile" value={selectedLoan.nomineeMobile} />
                </div>
              </div>

              {/* 4. Digital Vault - Image Slider */}
              <div style={sectionCard('#fff', '#0f172a')}>
                <h4 style={sectionTitle}><FiCamera/> KYC VAULT</h4>
                <div style={imageScroll} className="scroll-resp">
                  <DocThumbnail label="Customer Photo" src={selectedLoan.custLivePhoto} onZoom={setZoomImg} />
                  <DocThumbnail label="Aadhaar Front" src={selectedLoan.aadhaarFront} onZoom={setZoomImg} />
                  <DocThumbnail label="Aadhaar Back" src={selectedLoan.aadhaarBack} onZoom={setZoomImg} />
                  <DocThumbnail label="Voter/PAN" src={selectedLoan.custPAN || selectedLoan.secondaryIdFront} onZoom={setZoomImg} />
                  <DocThumbnail label="Signature" src={selectedLoan.custSignature || selectedLoan.memberSignature} onZoom={setZoomImg} />
                  <DocThumbnail label="Nominee Pic" src={selectedLoan.nomineePic} onZoom={setZoomImg} />
                  <DocThumbnail label="Passbook" src={selectedLoan.passbookPic} onZoom={setZoomImg} />
                </div>
              </div>
            </div>

            {/* Modal Footer with Mobile Responsive Buttons */}
            <div style={modalFooter} className="footer-resp">
              <div style={actionRow}>
                <label style={checkboxLabel}>
                  <input type="checkbox" checked={confirmTransfer} onChange={(e) => setConfirmTransfer(e.target.checked)} />
                  <span>Verified: Payment released to bank.</span>
                </label>
              </div>
              <div style={footerButtons} className="btn-group-resp">
                <button onClick={() => handleDeleteLoan(selectedLoan._id)} style={deleteBtn}><FiTrash2 /> Delete</button>
                <button onClick={() => handleReject(selectedLoan._id)} style={rejectBtn}><FiSlash/> Reject</button>
                <button 
                  onClick={() => handleDisburse(selectedLoan._id)} 
                  disabled={!confirmTransfer} 
                  style={confirmTransfer ? disburseBtn : disabledBtn}
                >
                  <FiCheckCircle/> Release Payout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Helpers ---
const DataField = ({ label, value, highlight }) => (
  <div style={{minWidth: '100px', marginBottom: '10px'}}>
    <p style={{ margin: 0, fontSize: '8px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>{label}</p>
    <p style={{ margin: '2px 0 0 0', fontSize: '13px', fontWeight: 800, color: highlight ? '#2563eb' : '#1e293b', wordBreak: 'break-word' }}>{value || 'N/A'}</p>
  </div>
);

const DocThumbnail = ({ label, src, onZoom }) => (
  <div style={thumbContainer} onClick={() => src && onZoom(src)}>
    <p style={{fontSize: '8px', fontWeight: 900, textAlign: 'center', marginBottom: '5px', color: '#64748b'}}>{label}</p>
    {src ? (
      <div style={imgWrapper}>
        <img src={src} style={thumbImg} alt="doc" />
        <div style={zoomBadge}><FiMaximize2 size={10}/></div>
      </div>
    ) : (
      <div style={noImg}>EMPTY</div>
    )}
  </div>
);

// --- Responsive Styles ---
const containerStyle = { padding: '15px', background: '#f4f7fe', minHeight: '100vh', fontFamily: 'sans-serif' };
const headerSection = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const mainTitle = { color: '#0f172a', fontWeight: 950, fontSize: '20px' };
const subTitleText = { fontSize: '10px', color: '#64748b', fontWeight: 'bold' };
const refreshBtn = { background: '#0f172a', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '10px', fontWeight: '900', fontSize: '10px' };

const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' };
const card = { background: '#fff', padding: '20px', borderRadius: '25px', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' };
const idTag = { background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontSize: '9px', fontWeight: '900' };
const statusBadge = { fontSize: '9px', fontWeight: '900', color: '#2563eb' };
const custNameText = { fontSize: '18px', fontWeight: '900', color: '#1e293b', marginBottom: '10px' };
const miniStatsBox = { display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '15px', marginBottom: '15px' };
const auditBtn = { width: '100%', padding: '12px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900' };

const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '10px' };
const modalContent = { background: '#fff', borderRadius: '25px', width: '100%', maxWidth: '800px', maxHeight: '95vh', overflow: 'hidden' };
const modalHeader = { padding: '15px 20px', background: '#0f172a', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const modalBody = { padding: '15px 20px', overflowY: 'auto', maxHeight: '60vh' };
const modalFooter = { padding: '15px 20px', background: '#f8fafc' };

const sectionCard = (bg, border) => ({ background: bg, padding: '15px', borderRadius: '20px', marginBottom: '12px', border: `1px solid ${border}20` });
const sectionTitle = { fontSize: '10px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', color: '#475569' };
const infoGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' };

const imageScroll = { display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' };
const thumbContainer = { flex: '0 0 110px' };
const imgWrapper = { position: 'relative', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #fff' };
const thumbImg = { width: '100%', height: '100%', objectFit: 'cover' };
const zoomBadge = { position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '3px', borderRadius: '4px' };

const actionRow = { marginBottom: '12px', padding: '10px', background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0' };
const checkboxLabel = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 'bold', color: '#059669' };
const footerButtons = { display: 'flex', gap: '8px' };

const disburseBtn = { flex: 2, padding: '14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '950', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' };
const disabledBtn = { ...disburseBtn, background: '#cbd5e1' };
const rejectBtn = { flex: 1, padding: '14px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '12px' };
const deleteBtn = { padding: '14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '12px' };

const zoomOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' };
const zoomContent = { position: 'relative', width: '100%', maxWidth: '800px' };
const fullImg = { width: '100%', maxHeight: '80vh', objectFit: 'contain' };
const zoomClose = { position: 'absolute', top: '-40px', right: '0', color: '#fff', fontSize: '30px' };
const noImg = { height: '80px', background: '#f1f5f9', color: '#94a3b8', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '900' };
const noDataBox = { gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#94a3b8', fontWeight: '900' };
const loaderStyle = { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#64748b' };

const responsiveCSS = `
  @media (max-width: 600px) {
    .header-resp { flex-direction: column; align-items: flex-start !important; }
    .grid-resp { grid-template-columns: 1fr !important; }
    .info-grid-resp { grid-template-columns: 1fr 1fr !important; }
    .btn-group-resp { flex-direction: column; }
    .btn-group-resp button { width: 100% !important; margin-bottom: 8px; }
    .modal-body-resp { padding: 10px !important; }
    .footer-resp { padding: 10px !important; }
  }
`;

export default AccountantApproval;