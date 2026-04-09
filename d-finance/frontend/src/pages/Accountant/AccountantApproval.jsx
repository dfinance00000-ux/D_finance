  import React, { useState, useEffect, useCallback } from 'react';
  import API from "../../api/axios"; 
  import { 
    FiUser, FiHome, FiCreditCard, FiCamera, 
    FiCheckCircle, FiX, FiInfo, FiImage, FiSlash, FiMaximize2, FiTrash2 
  } from 'react-icons/fi';

  const AccountantApproval = () => {
    const [verifiedLoans, setVerifiedLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [zoomImg, setZoomImg] = useState(null); 
    const [confirmTransfer, setConfirmTransfer] = useState(false);

    const user = JSON.parse(localStorage.getItem('user')) || {};

    // --- FETCH DATA ---
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

    // --- RELEASE PAYMENT ---
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

    // --- REJECT LOAN (Customer ko message dikhega) ---
    const handleReject = async (mongoId) => {
      const reason = window.prompt("REJECTION REASON (Customer will see this):");
      if (!reason) return alert("Reason is mandatory for rejection.");

      try {
        const res = await API.patch(`/loans/${mongoId}`, { 
          status: 'Rejected', 
          rejectionReason: reason 
        });
        
        if (res.status === 200 || res.data.success) {
          alert("🚫 LOAN REJECTED: Status updated for customer.");
          closeModal();
          fetchVerified(); 
        }
      } catch (err) {
        alert("❌ Rejection Failed.");
      }
    };

    // --- 🔥 SUPER POWER: PERMANENT DELETE FROM DATABASE ---
    const handleDeleteLoan = async (mongoId) => {
      const confirmDelete = window.confirm("⚠️ DANGER: Are you sure you want to PERMANENTLY DELETE this application from the database? This cannot be undone.");
      
      if (!confirmDelete) return;

      try {
        // Backend par Delete request bhej rahe hain
        const res = await API.delete(`/loans/${mongoId}`);
        
        if (res.status === 200 || res.data.success) {
          alert("🗑️ APPLICATION DELETED PERMANENTLY from Finance Ledger.");
          closeModal();
          fetchVerified(); // Queue se hatane ke liye
        }
      } catch (err) {
        console.error("Delete Error:", err);
        alert("❌ Delete Failed. Check if backend supports DELETE /loans/:id");
      }
    };

    const closeModal = () => {
      setSelectedLoan(null);
      setConfirmTransfer(false);
    };

    if (loading) return <div style={loaderStyle}>🔄 ACCESSING D-FINANCE LEDGER...</div>;

    return (
      <div style={containerStyle}>
        
        {/* Zoom Modal */}
        {zoomImg && (
          <div style={zoomOverlay} onClick={() => setZoomImg(null)}>
            <div style={zoomContent}>
              <FiX style={zoomClose} onClick={() => setZoomImg(null)} />
              <img src={zoomImg} style={fullImg} alt="KYC" />
            </div>
          </div>
        )}

        <div style={headerSection}>
          <div>
            <h2 style={mainTitle}>🛡️ ACCOUNTANT TERMINAL</h2>
            <p style={subTitleText}>Super Power Mode Active | Officer: {user.fullName}</p>
          </div>
          <button onClick={fetchVerified} style={refreshBtn}>REFRESH QUEUE</button>
        </div>

        <div style={grid}>
          {verifiedLoans.length === 0 ? (
            <div style={noDataBox}>
              <FiCheckCircle size={50} style={{marginBottom: '15px', color: '#10b981'}} />
              <p>All Clean! No pending approvals.</p>
            </div>
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
                <button onClick={() => setSelectedLoan(loan)} style={auditBtn}>Audit File</button>
              </div>
            ))
          )}
        </div>

        {selectedLoan && (
          <div style={modalOverlay}>
            <div style={modalContent}>
              <div style={modalHeader}>
                <h3 style={{margin:0}}>LOAN AUDIT: {selectedLoan.loanId}</h3>
                <FiX onClick={closeModal} style={{cursor:'pointer'}} />
              </div>

              <div style={modalBody}>
                {/* Bank Details */}
                <div style={sectionCard('#eff6ff', '#2563eb')}>
                  <h4 style={sectionTitle}><FiCreditCard/> BANK & PAYOUT INFO</h4>
                  <div style={infoGrid}>
                    <DataField label="A/C Holder" value={selectedLoan.accountHolderName} />
                    <DataField label="Bank Name" value={selectedLoan.bankName} />
                    <DataField label="Account No." value={selectedLoan.accountNumber} highlight />
                    <DataField label="Daily EMI" value={`₹${selectedLoan.dailyEMI}`} />
                  </div>
                </div>

                {/* Docs */}
                <div style={sectionCard('#fff', '#0f172a')}>
                  <h4 style={sectionTitle}><FiCamera/> DOCUMENTS</h4>
                  <div style={imageScroll}>
                    <DocThumbnail label="Passbook" src={selectedLoan.passbookPic} onZoom={setZoomImg} />
                    <DocThumbnail label="Aadhaar F" src={selectedLoan.aadhaarFront} onZoom={setZoomImg} />
                    <DocThumbnail label="Nominee" src={selectedLoan.nomineePic} onZoom={setZoomImg} />
                  </div>
                </div>
              </div>

              <div style={modalFooter}>
                <div style={actionRow}>
                  <label style={checkboxLabel}>
                    <input type="checkbox" checked={confirmTransfer} onChange={(e) => setConfirmTransfer(e.target.checked)} />
                    <span>Verified: Payment sent to customer account</span>
                  </label>
                </div>
                <div style={footerButtons}>
                  {/* 🔥 Super Power Button Added */}
                  <button onClick={() => handleDeleteLoan(selectedLoan._id)} style={deleteBtn} title="Delete from Database">
                    <FiTrash2 /> Delete
                  </button>
                  
                  <button onClick={() => handleReject(selectedLoan._id)} style={rejectBtn}>
                    <FiSlash/> Reject
                  </button>
                  
                  <button 
                    onClick={() => handleDisburse(selectedLoan._id)} 
                    disabled={!confirmTransfer}
                    style={confirmTransfer ? disburseBtn : disabledBtn}
                  >
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
    <div>
      <p style={{ margin: 0, fontSize: '9px', fontWeight: 900, color: '#94a3b8' }}>{label}</p>
      <p style={{ margin: '2px 0 0 0', fontSize: '14px', fontWeight: 800, color: highlight ? '#2563eb' : '#1e293b' }}>{value || 'N/A'}</p>
    </div>
  );

  const DocThumbnail = ({ label, src, onZoom }) => (
    <div style={thumbContainer} onClick={() => src && onZoom(src)}>
      <p style={{fontSize: '9px', fontWeight: 900, textAlign: 'center', marginBottom: '5px'}}>{label}</p>
      {src ? <div style={imgWrapper}><img src={src} style={thumbImg} /><FiMaximize2 style={zoomIcon}/></div> : <div style={noImg}>MISSING</div>}
    </div>
  );

  const containerStyle = { padding: '30px', background: '#f4f7fe', minHeight: '100vh' };
  const headerSection = { display: 'flex', justifyContent: 'space-between', marginBottom: '30px' };
  const mainTitle = { margin: 0, fontWeight: 950, fontSize: '28px', color: '#0f172a' };
  const subTitleText = { fontSize: '11px', fontWeight: '800', color: '#64748b' };
  const refreshBtn = { background: '#0f172a', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' };
  const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' };
  const card = { background: '#fff', padding: '25px', borderRadius: '30px', border: '1px solid #e2e8f0' };
  const cardHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: '15px' };
  const idTag = { background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: '900' };
  const statusBadge = { fontSize: '10px', fontWeight: '900', color: '#2563eb' };
  const custNameText = { margin: '0 0 15px 0', fontSize: '22px', fontWeight: '900' };
  const miniStatsBox = { display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#f8fafc', borderRadius: '20px', marginBottom: '15px' };
  const auditBtn = { width: '100%', padding: '15px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: '900', cursor: 'pointer' };

  const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(10px)' };
  const modalContent = { background: '#fff', borderRadius: '40px', width: '95%', maxWidth: '850px', maxHeight: '95vh', overflow: 'hidden' };
  const modalHeader = { padding: '20px 40px', background: '#0f172a', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
  const modalBody = { padding: '30px 40px', overflowY: 'auto', maxHeight: '60vh' };
  const modalFooter = { padding: '25px 40px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' };

  const sectionCard = (bg, border) => ({ background: bg, padding: '20px', borderRadius: '25px', marginBottom: '20px', border: `1px solid ${border}20` });
  const sectionTitle = { fontSize: '12px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' };
  const infoGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' };
  const imageScroll = { display: 'flex', gap: '15px', overflowX: 'auto' };
  const thumbContainer = { flex: '0 0 140px', cursor: 'pointer' };
  const imgWrapper = { position: 'relative' };
  const thumbImg = { width: '100%', height: '100px', objectFit: 'cover', borderRadius: '15px', border: '3px solid #fff' };
  const zoomIcon = { position: 'absolute', bottom: '10px', right: '10px', color: '#fff' };

  const actionRow = { marginBottom: '20px', padding: '15px', background: '#fff', borderRadius: '15px', border: '1px solid #e2e8f0' };
  const checkboxLabel = { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', fontWeight: '800', color: '#059669', cursor: 'pointer' };
  const footerButtons = { display: 'flex', gap: '10px' };

  const disburseBtn = { flex: 2, padding: '18px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' };
  const disabledBtn = { ...disburseBtn, background: '#cbd5e1', cursor: 'not-allowed' };
  const rejectBtn = { flex: 1, padding: '18px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' };
  const deleteBtn = { padding: '18px 25px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };

  const zoomOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' };
  const zoomContent = { position: 'relative' };
  const fullImg = { maxWidth: '90vw', maxHeight: '85vh', borderRadius: '10px' };
  const zoomClose = { position: 'absolute', top: '-40px', right: '0', color: '#fff', fontSize: '30px', cursor: 'pointer' };
  const noImg = { height: '100px', background: '#f1f5f9', color: '#cbd5e1', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '900' };
  const noDataBox = { gridColumn: '1/-1', textAlign: 'center', padding: '100px', background: '#fff', borderRadius: '40px', color: '#94a3b8', fontWeight: '800' };
  const loaderStyle = { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#94a3b8' };

  export default AccountantApproval;