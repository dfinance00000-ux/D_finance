import React, { useState, useEffect, useCallback } from 'react';
import API from "../../api/axios"; 
import { 
  FiBriefcase, FiUser, FiHome, FiCreditCard, FiCamera, 
  FiInfo, FiCheckCircle, FiX, FiSmartphone, FiMapPin 
} from 'react-icons/fi';

const AccountantApproval = () => {
  const [verifiedLoans, setVerifiedLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);

  const user = JSON.parse(localStorage.getItem('user')) || {};

  const fetchVerified = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/all-loans');
      const pendingApproval = res.data.filter(loan => 
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

  const handleAction = async (mongoId) => {
    if (!selectedLoan) return;
    const confirmMsg = `CAUTION: RELEASE FUNDS?\nAmount: ₹${selectedLoan.netDisbursed}\nTo: ${selectedLoan.customerName}`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await API.post(`/accountant/approve/${mongoId}`);
      if (res.data.success || res.status === 200) {
        alert("💰 DISBURSEMENT SUCCESSFUL!");
        setSelectedLoan(null);
        fetchVerified(); 
      }
    } catch (err) {
      alert("❌ Error: " + (err.response?.data?.error || "Sync Failed"));
    }
  };

  if (loading) return <div style={loaderStyle}>🔄 ACCESSING D-FINANCE LEDGER...</div>;

  return (
    <div style={containerStyle}>
      
      {/* Header */}
      <div style={headerSection}>
        <div>
          <h2 style={mainTitle}>🛡️ ACCOUNTANT TERMINAL</h2>
          <p style={subTitleText}>Branch Control: Mathura | Auditor: {user.fullName}</p>
        </div>
        <button onClick={fetchVerified} style={refreshBtn}>SYNC RECORDS</button>
      </div>

      {/* Grid List */}
      <div style={grid}>
        {verifiedLoans.map(loan => (
          <div key={loan._id} style={card}>
            <div style={cardHeader}>
              <span style={idTag}>{loan.loanId}</span>
              <span style={statusBadge(loan.status)}>{loan.status}</span>
            </div>
            <h3 style={custNameText}>{loan.customerName}</h3>
            <div style={miniStatsBox}>
              <div><small>PAYOUT</small><br/><b>₹{loan.netDisbursed}</b></div>
              <div><small>EMI</small><br/><b>₹{loan.weeklyEMI}</b></div>
            </div>
            <button onClick={() => setSelectedLoan(loan)} style={auditBtn}>Audit & Disburse</button>
          </div>
        ))}
      </div>

      {/* --- MASTER AUDIT MODAL --- */}
      {selectedLoan && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={modalHeader}>
              <h3>FULL FILE AUDIT: {selectedLoan.loanId}</h3>
              <FiX onClick={() => setSelectedLoan(null)} style={{cursor:'pointer'}} size={24}/>
            </div>

            <div style={modalBody}>
              
              {/* 1. BANK & DISBURSEMENT (TOP PRIORITY) */}
              <div style={sectionCard('#eff6ff', '#2563eb')}>
                <h4 style={sectionTitle}><FiCreditCard/> DISBURSEMENT BANK DETAILS</h4>
                <div style={infoGrid}>
                  <DataField label="Account Holder" value={selectedLoan.accountHolderName || selectedLoan.customerName} />
                  <DataField label="Bank Name" value={selectedLoan.bankName} />
                  <DataField label="A/C Number" value={selectedLoan.accountNumber} highlight />
                  <DataField label="IFSC Code" value={selectedLoan.ifscCode} />
                  <DataField label="Branch" value={selectedLoan.branchName} />
                  <DataField label="Last Trans Date" value={selectedLoan.lastTransactionDate} />
                </div>
              </div>

              {/* 2. CUSTOMER & NOMINEE INFO */}
              <div style={sectionCard('#f8fafc', '#475569')}>
                <h4 style={sectionTitle}><FiUser/> NOMINEE & RELATION</h4>
                <div style={infoGrid}>
                  <DataField label="Nominee Name" value={selectedLoan.nomineeName} />
                  <DataField label="Relationship" value={selectedLoan.nomineeRelation} />
                  <DataField label="Nominee Mobile" value={selectedLoan.nomineeMobile} />
                  <DataField label="Field Officer" value={selectedLoan.verifiedByName || 'System'} highlight />
                </div>
              </div>

              {/* 3. KYC DOCUMENT VIEWER */}
              <div style={sectionCard('#fff', '#0f172a')}>
                <h4 style={sectionTitle}><FiCamera/> KYC DOCUMENT VERIFICATION</h4>
                <div style={imageScroll}>
                  <DocThumbnail label="Passbook" src={selectedLoan.passbookPic} />
                  <DocThumbnail label="Aadhaar Front" src={selectedLoan.aadhaarFront} />
                  <DocThumbnail label="Aadhaar Back" src={selectedLoan.aadhaarBack} />
                  <DocThumbnail label="Nominee Pic" src={selectedLoan.nomineePic} />
                </div>
              </div>

              {/* 4. HOUSE & INCOME REPORT */}
              <div style={sectionCard('#f0fdf4', '#16a34a')}>
                <h4 style={sectionTitle}><FiHome/> FIELD INSPECTION (LUC)</h4>
                <div style={infoGrid}>
                  <DataField label="House Type" value={selectedLoan.houseType} />
                  <DataField label="Monthly Income" value={`₹${selectedLoan.monthlyIncome}`} />
                  <DataField label="Religion" value={selectedLoan.religion} />
                  <DataField label="Address" value={selectedLoan.nomineeAddress || selectedLoan.address} fullWidth />
                </div>
              </div>

            </div>

            <div style={modalFooter}>
              <button onClick={() => setSelectedLoan(null)} style={holdBtn}>HOLD FILE</button>
              <button onClick={() => handleAction(selectedLoan._id)} style={disburseBtn}>AUTHORIZE DISBURSEMENT</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Helper Components ---
const DataField = ({ label, value, highlight, fullWidth }) => (
  <div style={{ gridColumn: fullWidth ? '1/-1' : 'span 1', marginBottom: '10px' }}>
    <p style={{ margin: 0, fontSize: '9px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>{label}</p>
    <p style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: highlight ? '#2563eb' : '#1e293b' }}>{value || 'N/A'}</p>
  </div>
);

const DocThumbnail = ({ label, src }) => (
  <div style={thumbContainer}>
    <p style={{fontSize: '9px', fontWeight: 900, textAlign: 'center', marginBottom: '5px'}}>{label}</p>
    {src ? (
      <img src={src} style={thumbImg} onClick={() => window.open(src, '_blank')} title="Click to enlarge" />
    ) : (
      <div style={noImg}>MISSING</div>
    )}
  </div>
);

// --- Styles ---
const containerStyle = { padding: '30px', background: '#f4f7fe', minHeight: '100vh', fontFamily: 'Inter, sans-serif' };
const headerSection = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px' };
const mainTitle = { margin: 0, fontWeight: 900, fontSize: '28px', letterSpacing: '-1px' };
const subTitleText = { margin: '5px 0 0 0', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' };
const refreshBtn = { background: '#0f172a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' };

const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' };
const card = { background: '#fff', padding: '25px', borderRadius: '25px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px rgba(0,0,0,0.02)' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: '15px' };
const idTag = { background: '#f1f5f9', padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '900' };
const statusBadge = (s) => ({ fontSize: '9px', fontWeight: '900', color: s.includes('Verified') ? '#2563eb' : '#f59e0b' });
const custNameText = { margin: '0 0 15px 0', fontSize: '20px', fontWeight: '900' };
const miniStatsBox = { display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#f8fafc', borderRadius: '15px', marginBottom: '15px' };
const auditBtn = { width: '100%', padding: '14px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' };

const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' };
const modalContent = { background: '#fff', borderRadius: '35px', width: '95%', maxWidth: '850px', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' };
const modalHeader = { padding: '25px 30px', background: '#0f172a', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const modalBody = { padding: '30px', overflowY: 'auto', maxHeight: '65vh' };
const modalFooter = { padding: '20px 30px', background: '#f8fafc', display: 'flex', gap: '15px' };

const sectionCard = (bg, color) => ({ background: bg, padding: '20px', borderRadius: '25px', marginBottom: '20px', border: `1px solid ${color}20` });
const sectionTitle = { margin: '0 0 15px 0', fontSize: '12px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' };
const infoGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' };

const imageScroll = { display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' };
const thumbContainer = { flex: '0 0 140px' };
const thumbImg = { width: '100%', height: '100px', objectFit: 'cover', borderRadius: '15px', border: '3px solid #fff', boxShadow: '0 5px 10px rgba(0,0,0,0.1)', cursor: 'pointer' };
const noImg = { height: '100px', background: '#fee2e2', color: '#ef4444', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '900' };

const disburseBtn = { flex: 2, padding: '18px', background: '#059669', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: '900', cursor: 'pointer' };
const holdBtn = { flex: 1, padding: '18px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '15px', fontWeight: '900', cursor: 'pointer' };
const loaderStyle = { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#94a3b8' };

export default AccountantApproval;