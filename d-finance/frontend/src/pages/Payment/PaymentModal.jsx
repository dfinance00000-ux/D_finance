import React, { useState } from 'react';
import API from '../../api/axios';
import { FiX, FiCheckCircle, FiAlertCircle, FiCamera, FiShield } from 'react-icons/fi';

const PaymentModal = ({ loan, customAmount, onClose, onRefresh }) => {
  const [utr, setUtr] = useState('');
  const [loading, setLoading] = useState(false);

  // User details safely extracted
  const user = JSON.parse(localStorage.getItem('user')) || {};

  // Priority: Dashboard amount > Loan Daily EMI > Default 0
  const finalAmount = Number(customAmount) || Number(loan?.installmentAmount) || Number(loan?.dailyEMI) || 0;

  const handleSubmitManualPayment = async () => {
    // 1. Strict Validations
    const cleanUtr = utr.trim();
    if (!cleanUtr || cleanUtr.length < 10) {
      return alert("⚠️ Please enter a valid Transaction UTR (10-12 digits).");
    }

    if (finalAmount < 100) {
      return alert("⚠️ Minimum payment allowed is ₹100.");
    }
    
    try {
      setLoading(true);
      
      // 🔥 Consistent Payload for Backend
      const payload = { 
        utr: cleanUtr, 
        amount: finalAmount,
        customerId: user.id || user._id,
        customerName: user.fullName,
        loanId: loan.loanId,
        paymentDate: new Date().toISOString(),
        status: 'Pending' // Initial state
      };

      // API call to the specific manual payment endpoint
      const res = await API.post(`/loans/pay-manual/${loan.loanId}`, payload);
      
      if (res.data.success || res.status === 200) {
        alert(`✅ Receipt Submitted!\n\nUTR: ${cleanUtr}\nAmount: ₹${finalAmount}\n\nOur accountant will verify this shortly.`);
        onRefresh(); 
        onClose();   
      }
    } catch (err) {
      console.error("Payment Sync Error:", err.response?.data);
      
      const serverError = err.response?.data?.error || "";
      let errorMessage = "❌ Server failed to log payment. Try again.";

      if (serverError.includes("E11000") || serverError.includes("duplicate")) {
        errorMessage = "❌ This UTR/Transaction ID has already been submitted.";
      } else if (serverError) {
        errorMessage = "❌ " + serverError;
      }

      alert(errorMessage);
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
          <div style={shieldBadge}>
            <FiShield size={12} /> SECURE GATEWAY
          </div>
          <button onClick={onClose} style={closeBtn}><FiX /></button>
        </div>

        <div style={bodyContent}>
          <p style={labelSmall}>PAYABLE INSTALLMENT</p>
          <div style={amountDisplay}>
            <span style={currency}>₹</span>
            <h2 style={amountNum}>{finalAmount.toLocaleString('en-IN')}</h2>
          </div>

          {/* QR Code Section */}
          <div style={qrContainer}>
            <div style={qrWrapper}>
              <img 
                src="/Payment.jpeg" 
                alt="Scan to Pay" 
                style={qrImg}
                onError={(e) => { e.target.src = "https://placehold.co/400?text=QR+NOT+FOUND"; }}
              />
            </div>
            <p style={qrTip}>Scan using PhonePe, GPay or Paytm</p>
          </div>

          {/* Form Area */}
          <div style={formArea}>
            <div style={inputBox}>
              <label style={inputLabel}>ENTER TRANSACTION UTR / ID</label>
              <input 
                type="text" 
                placeholder="12-digit UTR Number"
                style={fieldInput}
                value={utr}
                onChange={(e) => setUtr(e.target.value.toUpperCase().replace(/\s/g, ''))}
              />
            </div>

            <button 
              onClick={handleSubmitManualPayment}
              disabled={loading || utr.length < 8}
              style={loading || utr.length < 8 ? disabledBtn : activeBtn}
            >
              {loading ? "AUTHENTICATING..." : "SUBMIT PAYMENT RECEIPT"}
            </button>
            
            <div style={securityNote}>
              <FiCheckCircle color="#10b981" size={14} />
              <span>Funds are held in escrow until verified by D-Finance.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MODERN STYLES ---
const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.95)',
  backdropFilter: 'blur(10px)', zIndex: 10000, display: 'flex',
  alignItems: 'center', justifyContent: 'center', padding: '15px'
};

const modalCard = {
  background: '#fff', width: '100%', maxWidth: '400px',
  borderRadius: '40px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
};

const headerSection = {
  padding: '20px 25px', display: 'flex', justifyContent: 'space-between',
  alignItems: 'center', borderBottom: '1px solid #f1f5f9'
};

const shieldBadge = {
  background: '#eef2ff', color: '#6366f1', padding: '6px 12px',
  borderRadius: '10px', fontSize: '10px', fontWeight: '900',
  display: 'flex', alignItems: 'center', gap: '6px'
};

const closeBtn = {
  background: '#f8fafc', border: 'none', width: '32px', height: '32px',
  borderRadius: '50%', cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center', color: '#64748b'
};

const bodyContent = { padding: '30px', textAlign: 'center' };
const labelSmall = { fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px' };
const amountDisplay = { display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '10px 0 30px 0' };
const currency = { fontSize: '20px', fontWeight: '900', color: '#cbd5e1', marginTop: '5px' };
const amountNum = { fontSize: '48px', fontWeight: '950', color: '#0f172a', letterSpacing: '-2px', margin: 0 };

const qrContainer = { marginBottom: '30px' };
const qrWrapper = {
  background: '#fff', padding: '12px', borderRadius: '25px',
  border: '2px dashed #e2e8f0', display: 'inline-block'
};
const qrImg = { width: '160px', height: '160px', objectFit: 'contain', borderRadius: '15px' };
const qrTip = { fontSize: '11px', color: '#64748b', marginTop: '12px', fontWeight: '600' };

const formArea = { textAlign: 'left' };
const inputBox = {
  background: '#f8fafc', padding: '15px 20px', borderRadius: '20px',
  border: '1.5px solid #f1f5f9', marginBottom: '20px'
};
const inputLabel = { fontSize: '9px', fontWeight: '900', color: '#94a3b8', display: 'block', marginBottom: '8px' };
const fieldInput = {
  width: '100%', background: 'transparent', border: 'none', outline: 'none',
  fontSize: '18px', fontWeight: '900', color: '#0f172a', letterSpacing: '1px'
};

const activeBtn = {
  width: '100%', padding: '20px', background: '#0f172a', color: '#fff',
  border: 'none', borderRadius: '20px', fontWeight: '900', cursor: 'pointer',
  fontSize: '14px', letterSpacing: '1px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
};
const disabledBtn = { ...activeBtn, background: '#f1f5f9', color: '#cbd5e1', cursor: 'not-allowed', boxShadow: 'none' };

const securityNote = {
  display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px',
  fontSize: '10px', color: '#64748b', fontWeight: '600', lineHeight: '1.4'
};

const animations = `
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.9) translateY(20px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  .modal-animate { animation: modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
`;

export default PaymentModal;