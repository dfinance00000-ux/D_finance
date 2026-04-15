import React, { useState, useRef, useEffect } from 'react';
import API from '../../api/axios';
import { FiX, FiShield, FiCamera, FiEdit3, FiHash, FiExternalLink, FiInfo } from 'react-icons/fi';

const PaymentModal = ({ loan, allActiveLoans = [], onClose, onRefresh }) => {
  const [manualLoanId, setManualLoanId] = useState(loan?.loanId || '');
  const [paidAmount, setPaidAmount] = useState('');
  const [utr, setUtr] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    if (loan) {
      setManualLoanId(loan.loanId);
      const emi = loan.installmentAmount || loan.weeklyEMI || loan.amount || '';
      setPaidAmount(emi.toString());
    }
  }, [loan]);

  // --- 📸 Unified Image Handler ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Bhai, photo 5MB se badi hai! Choti photo upload karein.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        // 🔥 State update confirm karein
        setScreenshot(reader.result); 
        console.log("📸 Image Ready! String length:", reader.result.length);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReceipt = async () => {
    if (!manualLoanId) return alert("⚠️ Loan ID select karein.");
    if (!paidAmount || Number(paidAmount) <= 0) return alert("⚠️ Amount bharein.");
    
    // 🚨 Critical Check: Empty screenshot bypass na ho
    if (!screenshot || screenshot.length < 100) {
        return alert("⚠️ Screenshot abhi load nahi hua ya khali hai. Dobara select karein!");
    }

    setLoading(true);

    // 🛠️ Construct Payload explicitly
    const payload = {
      utr: utr.trim().toUpperCase() || 'CASHFREE_PAY',
      amount: Number(paidAmount),
      screenshot: screenshot, // 🔥 Ensure this variable has the Base64 string
      customerId: user.id || user._id,
      customerName: user.fullName || user.name || "Walk-in Customer",
      paymentType: utr ? 'Manual QR' : 'Cashfree Online'
    };

    console.log("🚀 Submitting Payload with Image Length:", payload.screenshot.length);

    try {
      const res = await API.post(`/loans/pay-manual/${manualLoanId}`, payload);
      
      if (res.data.success) {
        alert("✅ Receipt submitted successfully!");
        onRefresh(); 
        onClose();   
      }
    } catch (err) {
      console.error("❌ Submission Error:", err.response?.data);
      const msg = err.response?.data?.error || "Submission failed. Server check karein.";
      alert("❌ Error: " + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <style>{animations}</style>
      <div style={modalCard} className="modal-animate">
        
        <div style={headerSection}>
          <div style={shieldBadge}><FiShield size={12} /> D-FINANCE SECURE</div>
          <button onClick={onClose} style={closeBtn}><FiX /></button>
        </div>

        <div style={scrollBody}>
          
          <div style={flexRow}>
             <div style={{flex: 1}}>
                <label style={inputLabel}>LOAN ID</label>
                <div style={readOnlyBox}>
                    <FiHash size={12} color="#94a3b8" />
                    <input type="text" style={noBorderInput} value={manualLoanId} readOnly />
                </div>
             </div>
             <div style={{flex: 1.2}}>
                <label style={inputLabel}>PAYING AMOUNT</label>
                <div style={editableAmtBox}>
                    <span style={{color: '#3b82f6', fontWeight: '900'}}>₹</span>
                    <input 
                        type="number" 
                        style={amtInput} 
                        value={paidAmount} 
                        onChange={(e) => setPaidAmount(e.target.value)} 
                    />
                    <FiEdit3 size={14} color="#3b82f6" />
                </div>
             </div>
          </div>

          <div style={optionBox}>
            <label style={inputLabel}>STEP 1: QUICK PAY (ONLINE)</label>
            <a href="https://payments.cashfree.com/forms/dfinance-pay" target="_blank" rel="noreferrer" style={{textDecoration:'none'}}>
                <div className="cashfree-btn">
                    <img src="https://cashfreelogo.cashfree.com/cashfreepayments/logosvgs/Group_4355.svg" width="22" alt="cf" />
                    <span>Pay with Cashfree</span>
                    <FiExternalLink size={14} />
                </div>
            </a>
          </div>

          <div style={divider}>OR SCAN MANUAL QR</div>

          <div style={manualGrid}>
             <div style={qrContainer}>
                <img src="/Payment.jpeg" alt="QR" style={qrCodeImg} />
             </div>
             <div style={{flex: 1}}>
                <label style={inputLabel}>UTR / TRANSACTION ID</label>
                <input 
                    type="text" 
                    placeholder="Enter 12-digit ID" 
                    style={utrInputField} 
                    value={utr} 
                    onChange={(e) => setUtr(e.target.value.toUpperCase())} 
                />
                <div style={infoAlert}><FiInfo size={10}/> Manual pay ke liye zaroori hai</div>
             </div>
          </div>

          <div style={{marginTop: '25px'}}>
            <label style={inputLabel}>STEP 2: UPLOAD SUCCESS SCREENSHOT</label>
            <div onClick={() => fileInputRef.current.click()} style={screenshotDropZone}>
                {screenshot ? (
                    <div style={reflexPreview}>
                        <img src={screenshot} alt="Preview" style={imgFill} />
                        <div style={overlayLabel}><FiCamera /> CHANGE PHOTO</div>
                    </div>
                ) : (
                    <div style={uploadPrompt}>
                        <div style={iconCircle}><FiCamera size={24} color="#3b82f6" /></div>
                        <p style={uploadMainText}>Tap to upload screenshot</p>
                    </div>
                )}
            </div>
          </div>

          <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleFileChange} />

          <button onClick={handleSubmitReceipt} disabled={loading} style={submitActionBtn}>
            {loading ? "SYNCING DATA..." : "SUBMIT PAYMENT RECEIPT"}
          </button>
          
          <p style={footerNote}><FiShield size={10}/> Secured by D-Finance Audit Team</p>
        </div>
      </div>
    </div>
  );
};

// --- STYLES (NO CHANGE) ---
const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' };
const modalCard = { background: '#fff', width: '100%', maxWidth: '420px', borderRadius: '45px', overflow: 'hidden', boxShadow: '0 35px 70px rgba(0,0,0,0.4)' };
const scrollBody = { padding: '25px 30px', maxHeight: '88vh', overflowY: 'auto' };
const headerSection = { padding: '18px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' };
const shieldBadge = { background: '#f0fdf4', color: '#16a34a', padding: '6px 14px', borderRadius: '12px', fontSize: '10px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px' };
const closeBtn = { background: '#f8fafc', border: 'none', width: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center' };
const flexRow = { display: 'flex', gap: '15px', marginBottom: '25px' };
const inputLabel = { fontSize: '9px', fontWeight: '950', color: '#94a3b8', marginBottom: '8px', display:'block', textTransform:'uppercase' };
const readOnlyBox = { display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '12px', borderRadius: '15px', border: '1px solid #e2e8f0' };
const noBorderInput = { border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontWeight: '800', color: '#64748b', width: '100%' };
const editableAmtBox = { display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', padding: '10px 15px', borderRadius: '15px', border: '2px solid #3b82f6' };
const amtInput = { border: 'none', outline: 'none', fontSize: '18px', fontWeight: '950', color: '#0f172a', width: '100%' };
const optionBox = { background: '#f8fafc', padding: '15px', borderRadius: '20px', border: '1px solid #f1f5f9' };
const divider = { textAlign: 'center', fontSize: '10px', fontWeight: '900', color: '#cbd5e1', margin: '25px 0', display: 'flex', alignItems: 'center', gap: '12px' };
const manualGrid = { display: 'flex', gap: '15px', alignItems: 'center' };
const qrContainer = { textAlign: 'center', background: '#fff', padding: '10px', borderRadius: '18px', border: '1px solid #f1f5f9' };
const qrCodeImg = { width: '85px', height: '85px', borderRadius: '8px' };
const utrInputField = { width: '100%', padding: '14px', borderRadius: '15px', border: '1.5px solid #e2e8f0', outline: 'none', fontWeight: '800', fontSize: '14px' };
const infoAlert = { fontSize: '8px', fontWeight: '800', color: '#3b82f6', marginTop: '6px' };
const screenshotDropZone = { width: '100%', height: '200px', background: '#f8fafc', borderRadius: '30px', border: '2px dashed #cbd5e1', cursor: 'pointer', overflow: 'hidden', position: 'relative' };
const uploadPrompt = { height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' };
const iconCircle = { width: '50px', height: '50px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', boxShadow: '0 10px 15px rgba(0,0,0,0.05)' };
const uploadMainText = { fontSize: '13px', fontWeight: '800', color: '#475569' };
const reflexPreview = { width: '100%', height: '100%', position: 'relative' };
const imgFill = { width: '100%', height: '100%', objectFit: 'cover' };
const overlayLabel = { position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(15, 23, 42, 0.8)', color: '#fff', padding: '8px 16px', borderRadius: '12px', fontSize: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' };
const submitActionBtn = { width: '100%', padding: '20px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '25px', fontWeight: '900', cursor:'pointer', marginTop:'25px', fontSize:'15px' };
const footerNote = { textAlign: 'center', fontSize: '10px', color: '#cbd5e1', marginTop: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' };

const animations = `
  .modal-animate { animation: fadeInUp 0.5s ease-out; }
  @keyframes fadeInUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .cashfree-btn { background: #fff; border: 1.5px solid #e2e8f0; padding: 14px; border-radius: 18px; display: flex; align-items: center; justify-content: center; gap: 12px; transition: 0.3s; cursor: pointer; color: #000; font-weight: 800; font-size: 14px; }
  .cashfree-btn:hover { border-color: #3b82f6; background: #f0f7ff; transform: translateY(-2px); }
  ${divider}:before, ${divider}:after { content: ""; flex: 1; height: 1px; background: #f1f5f9; }
`;

export default PaymentModal;