import React, { useState } from 'react';
import API from '../../api/axios';
import { FiX, FiShield, FiCreditCard, FiSmartphone } from 'react-icons/fi';

const PaymentModal = ({ loan, customAmount, onClose, onRefresh }) => {
  const [utr, setUtr] = useState('');
  const [loading, setLoading] = useState(false);
  const [payMode, setPayMode] = useState('online');

  const user = JSON.parse(localStorage.getItem('user')) || {};
  const finalAmount = Number(customAmount) || Number(loan?.installmentAmount) || 0;

  // --- 💳 ONLINE PAYMENT LOGIC (Using window.Cashfree to avoid build errors) ---
  const handleOnlinePayment = async () => {
    if (finalAmount <= 0) return alert("❌ Invalid Amount");
    setLoading(true);

    try {
      // 1. Backend se Session ID mangwao
      const res = await API.post('/payments/create-order', {
        amount: finalAmount,
        customerId: user.id || user._id,
        customerName: user.fullName || "Customer",
        customerPhone: user.phone || "9999999999",
        loanId: loan.loanId
      });

      const sessionId = res.data.payment_session_id;

      // 2. Initialize SDK from window
      if (!window.Cashfree) {
        return alert("⚠️ Cashfree SDK not loaded. Please refresh page.");
      }
      
      const cashfree = window.Cashfree({ mode: "production" });

      // 3. Checkout Popup Modal
      let checkoutOptions = {
        paymentSessionId: sessionId,
        redirectTarget: "_modal", 
      };

      cashfree.checkout(checkoutOptions).then(() => {
        // Window close hone par automatic refresh logic
        console.log("Payment window closed, refreshing...");
        setTimeout(() => {
          onRefresh(); 
          onClose();
        }, 2000);
      });

    } catch (err) {
      console.error("Initiation Error:", err);
      alert("❌ Payment start nahi ho payi. Backend check karein.");
    } finally {
      setLoading(false);
    }
  };

  // --- 📝 MANUAL UTR SUBMISSION ---
  const handleSubmitManual = async () => {
    if (utr.length < 10) return alert("⚠️ Enter valid UTR.");
    setLoading(true);
    try {
      await API.post(`/loans/pay-manual/${loan.loanId}`, {
        utr: utr.toUpperCase(),
        amount: finalAmount,
        customerId: user.id || user._id,
        customerName: user.fullName,
      });
      alert("✅ Receipt Submitted! Verifying shortly.");
      onRefresh();
      onClose();
    } catch (err) {
      alert("❌ Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <style>{animations}</style>
      <div style={modalCard} className="modal-animate">
        
        {/* Header */}
        <div style={headerSection}>
          <div style={shieldBadge}><FiShield size={12} /> SECURE GATEWAY</div>
          <button onClick={onClose} style={closeBtn}><FiX /></button>
        </div>

        <div style={bodyContent}>
          <p style={labelSmall}>REPAYMENT AMOUNT</p>
          <h2 style={amountNum}>₹{finalAmount.toLocaleString('en-IN')}</h2>

          {/* Mode Switcher */}
          <div style={tabGroup}>
            <button 
              onClick={() => setPayMode('online')} 
              style={payMode === 'online' ? activeTab : tab}
            >
              <FiCreditCard /> Fast Online
            </button>
            <button 
              onClick={() => setPayMode('manual')} 
              style={payMode === 'manual' ? activeTab : tab}
            >
              <FiSmartphone /> Scan QR
            </button>
          </div>

          {/* --- 💳 ONLINE SECTION (CASHFREE OFFICIAL DESIGN) --- */}
          {payMode === 'online' ? (
            <div style={onlineSection} className="fade-in">
                <p style={infoText}>Use our secure gateway for instant verification.</p>
                
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  {/* 🔥 OFFICIAL BLACK BUTTON INTEGRATED 🔥 */}
                  <div className="cf-official-btn" onClick={!loading ? handleOnlinePayment : null}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <img 
                        src="https://cashfreelogo.cashfree.com/cashfreepayments/logosvgs/Group_4355.svg" 
                        alt="logo" 
                        style={{ width: '38px', height: '38px' }} 
                      />
                    </div>
                    <div className="btn-text-container">
                      <div className="btn-main-text">
                        {loading ? "Initializing..." : "Pay Now"}
                      </div>
                      <div className="btn-sub-text">
                        <span>Powered By Cashfree</span>
                        <img src="https://cashfreelogo.cashfree.com/cashfreepayments/logosvgs/Group_4355.svg" alt="logo" style={{ width: '12px', height: '12px', marginLeft: '4px' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <p style={safeNote}>Cards, UPI, Netbanking Supported</p>
            </div>
          ) : (
            /* --- 📑 MANUAL SECTION --- */
            <div style={manualSection} className="fade-in">
                <div style={qrWrapper}>
                    <img src="/Payment.jpeg" alt="QR" style={qrImg} />
                </div>
                <div style={inputBox}>
                  <label style={inputLabel}>ENTER 12-DIGIT UTR NUMBER</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 412388..." 
                    style={fieldInput}
                    value={utr}
                    onChange={(e) => setUtr(e.target.value.toUpperCase())}
                  />
                </div>
                <button onClick={handleSubmitManual} disabled={loading} style={submitBtn}>
                    {loading ? "SUBMITTING..." : "SUBMIT RECEIPT"}
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- STYLES ---
const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' };
const modalCard = { background: '#fff', width: '100%', maxWidth: '400px', borderRadius: '40px', overflow: 'hidden' };
const headerSection = { padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' };
const shieldBadge = { background: '#eef2ff', color: '#6366f1', padding: '6px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px' };
const closeBtn = { background: '#f8fafc', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const bodyContent = { padding: '30px', textAlign: 'center' };
const labelSmall = { fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px' };
const amountNum = { fontSize: '42px', fontWeight: '950', color: '#0f172a', margin: '10px 0 25px 0' };
const tabGroup = { display: 'flex', background: '#f1f5f9', padding: '5px', borderRadius: '15px', marginBottom: '25px', gap: '5px' };
const tab = { flex: 1, padding: '12px', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', background: 'transparent', color: '#64748b' };
const activeTab = { ...tab, background: '#fff', color: '#0f172a', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' };
const onlineSection = { padding: '10px 0' };
const infoText = { fontSize: '12px', color: '#64748b', marginBottom: '20px' };
const safeNote = { fontSize: '11px', color: '#10b981', marginTop: '15px', fontWeight: '700' };
const manualSection = { display: 'flex', flexDirection: 'column', alignItems: 'center' };
const qrWrapper = { padding: '12px', border: '2px dashed #e2e8f0', borderRadius: '25px', marginBottom: '20px' };
const qrImg = { width: '140px', height: '140px', objectFit: 'contain' };
const inputBox = { width: '100%', background: '#f8fafc', padding: '15px', borderRadius: '20px', border: '1.5px solid #f1f5f9', marginBottom: '15px' };
const inputLabel = { fontSize: '8px', fontWeight: '900', color: '#94a3b8', marginBottom: '6px' };
const fieldInput = { width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '17px', fontWeight: '800' };
const submitBtn = { width: '100%', padding: '18px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '20px', fontWeight: '900' };

const animations = `
  @keyframes modalIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  .modal-animate { animation: modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
  .fade-in { animation: fadeIn 0.4s ease-in; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  
  /* OFFICIAL BUTTON STYLES */
  .cf-official-btn {
    background: #000;
    border-radius: 15px;
    display: flex;
    padding: 10px 25px;
    width: fit-content;
    cursor: pointer;
    transition: 0.3s;
    border: 1px solid black;
    align-items: center;
  }
  .cf-official-btn:hover {
    background: #111;
    transform: translateY(-2px);
  }
  .btn-text-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-left: 12px;
    justify-content: center;
  }
  .btn-main-text {
    font-family: 'Times New Roman', serif;
    color: #fff;
    margin-bottom: 2px;
    font-size: 16px;
    font-weight: 700;
  }
  .btn-sub-text {
    font-family: 'Times New Roman', serif;
    color: #fff;
    font-size: 10px;
    display: flex;
    align-items: center;
  }
`;

export default PaymentModal;