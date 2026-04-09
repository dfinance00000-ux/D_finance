import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios'; 
import { FiCamera, FiAlertCircle, FiChevronRight } from 'react-icons/fi';

const ApplyLoan = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({ 
    amount: '10000', 
    type: 'JLG Loan', 
    tenure: '1', 
    accountHolderName: '',
    bankName: '',
    branchName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    passbookPic: ''
  });

  // --- 🔥 UPDATED MARKET MATH (MIN 10K, 2% FEE, 10% INTEREST, DAILY EMI) ---
  const calculateFinances = () => {
    const principal = Number(formData.amount) || 0;
    const months = Number(formData.tenure) || 0;
    
    // 1. Processing Fee @ 2%
    const processingFee = principal * 0.02; 
    const fileCharge = principal > 0 ? 200 : 0; 
    const netDisbursed = principal - (processingFee + fileCharge);

    // 2. Interest @ 10% Monthly
    const totalInterest = principal * 0.10 * months;
    const totalPayable = principal + totalInterest;

    // 3. Daily EMI Logic (Assume 30 days per month)
    const totalDays = months * 30;
    const dailyEMI = totalDays > 0 ? (totalPayable / totalDays).toFixed(2) : 0;

    return { processingFee, fileCharge, netDisbursed, dailyEMI, totalDays, totalPayable };
  };

  const finance = calculateFinances();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2000000) return alert("File size too large! Max 2MB.");
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, passbookPic: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if (Number(formData.amount) < 10000) return alert("Minimum loan amount is ₹10,000.");
    if (formData.accountNumber !== formData.confirmAccountNumber) return alert("Account Numbers do not match!");
    if (!formData.passbookPic) return alert("Please upload Bank Passbook photo.");
    
    setLoading(true);
    const generatedLoanId = "LN-" + Math.floor(100000 + Math.random() * 900000);

    const loanRequest = {
      ...formData,
      loanId: generatedLoanId,
      customerId: user.id || user._id,
      customerName: user.fullName,
      fieldOfficerId: user.referredBy || user.sponsorId || null, 
      amount: Number(formData.amount),
      tenureMonths: Number(formData.tenure),
      totalDays: finance.totalDays,
      
      // 🔥 FIX: Backend 'weeklyEMI' mang raha hai, par hum 'dailyEMI' bhej rahe hain.
      // Hum dono bhej dete hain taaki error na aaye.
      dailyEMI: Number(finance.dailyEMI), 
      weeklyEMI: Number(finance.dailyEMI), // 👈 Ye line add kardo backend ke liye
      
      processingFee: finance.processingFee,
      totalPayable: finance.totalPayable,
      netDisbursed: finance.netDisbursed,
      status: "Verification Pending",
      appliedDate: new Date().toISOString(),
    };
    try {
      const res = await API.post('/loans', loanRequest);
      if (res.data.success) {
        alert(`Success! Loan Ref: ${generatedLoanId}. Wait for Field Verification.`);
        navigate('/customer/tracking'); 
      }
    } catch (error) {
      alert(error.response?.data?.error || "Server sync failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageContainer}>
      <div style={formCard}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0, fontWeight: 900, color: '#0f172a' }}>💰 Smart Daily Loan</h2>
          <div style={minLimitBadge}><FiAlertCircle /> Min: ₹10,000</div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={inputGroup}>
                <label style={label}>Apply Amount (₹)</label>
                <input type="number" style={inputStyle} value={formData.amount} required 
                    min="10000" onChange={e => setFormData({...formData, amount: e.target.value})} />
            </div>
            <div style={inputGroup}>
                <label style={label}>Tenure (Months)</label>
                <select style={inputStyle} value={formData.tenure} onChange={e => setFormData({...formData, tenure: e.target.value})}>
                    {[1,2,3,4,5,6].map(m => (
                        <option key={m} value={m}>{m} Month ({m * 30} Days)</option>
                    ))}
                </select>
            </div>
          </div>

          <div style={bankSection}>
            <h4 style={bankTitle}>🏦 Bank Disbursement Details</h4>
            <div style={inputGroup}>
                <label style={label}>Account Holder Name</label>
                <input style={inputStyle} required value={formData.accountHolderName} onChange={e => setFormData({...formData, accountHolderName: e.target.value})} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={inputGroup}>
                    <label style={label}>Bank Name</label>
                    <input style={inputStyle} required value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} />
                </div>
                <div style={inputGroup}>
                    <label style={label}>Account Number</label>
                    <input type="password" style={inputStyle} required value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} />
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={inputGroup}>
                    <label style={label}>IFSC Code</label>
                    <input style={inputStyle} required value={formData.ifscCode} onChange={e => setFormData({...formData, ifscCode: e.target.value.toUpperCase()})} />
                </div>
                <div style={inputGroup}>
                    <label style={label}>Confirm Account No.</label>
                    <input style={inputStyle} required value={formData.confirmAccountNumber} onChange={e => setFormData({...formData, confirmAccountNumber: e.target.value})} />
                </div>
            </div>

            <div style={uploadBox}>
                <label style={label}><FiCamera /> Upload Passbook/Cheque Photo</label>
                <input type="file" accept="image/*" onChange={handleImageChange} style={{marginTop: '8px'}} />
                {formData.passbookPic && <img src={formData.passbookPic} style={previewImg} alt="KYS Doc" />}
            </div>
          </div>

          {/* Real-time Math Summary */}
          <div style={financeGrid}>
              <div style={finItem}><span>Processing Fee (2%)</span><b>₹{finance.processingFee}</b></div>
              <div style={finItem}><span>Total Interest (10%/mo)</span><b>₹{finance.totalPayable - Number(formData.amount)}</b></div>
              <div style={finItem}><span>Net in A/C</span><b style={{color: '#10b981'}}>₹{finance.netDisbursed}</b></div>
          </div>

          <div style={emiPreview}>
            <span style={{ fontSize: '10px', fontWeight: '900', color: '#6366f1' }}>DAILY COLLECTION RECOVERY</span>
            <h3 style={{ margin: '5px 0', fontSize: '32px', fontWeight: '950', color: '#0f172a' }}>₹{finance.dailyEMI} <small style={{fontSize: '14px', color: '#94a3b8'}}>/ day</small></h3>
          </div>

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? "Registering in Ledger..." : "Apply & Submit Report"}
          </button>
        </form>
      </div>

      <div style={infoPanel}>
        <h4 style={{ margin: '0 0 15px 0', fontWeight: '900' }}>📌 PRODUCT SOP</h4>
        <div style={sopCard}>
           <p>• <b>Recovery:</b> Doorstep daily collection.</p>
           <p>• <b>Interest:</b> Flat 10% monthly.</p>
           <p>• <b>Verification:</b> Physical LUC within 24hrs.</p>
        </div>
        <div style={{marginTop: '20px', fontSize: '11px', color: '#ef4444', fontWeight: 'bold'}}>
            ⚠️ Note: Ensure account number is correct. Funds once disbursed cannot be reversed.
        </div>
      </div>
    </div>
  );
};

// --- Modern UI Styles ---
const pageContainer = { display: 'flex', gap: '20px', padding: '25px', maxWidth: '1200px', margin: '0 auto', background: '#f4f7fe', minHeight: '100vh' };
const formCard = { flex: '2', background: '#fff', padding: '35px', borderRadius: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' };
const minLimitBadge = { background: '#fef2f2', color: '#ef4444', padding: '6px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '5px' };
const inputGroup = { marginBottom: '18px' };
const label = { display: 'block', fontSize: '10px', fontWeight: '900', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' };
const inputStyle = { width: '100%', padding: '14px', borderRadius: '12px', border: '1.5px solid #f1f5f9', outline: 'none', background: '#f8fafc', fontWeight: '700', boxSizing: 'border-box' };
const bankSection = { padding: '20px', background: '#f8fafc', borderRadius: '24px', border: '1px solid #f1f5f9', marginBottom: '20px' };
const bankTitle = { margin: '0 0 15px 0', fontSize: '14px', fontWeight: '900' };
const uploadBox = { marginTop: '15px', padding: '20px', border: '2px dashed #cbd5e1', borderRadius: '15px', textAlign: 'center' };
const previewImg = { width: '100%', maxHeight: '180px', objectFit: 'contain', marginTop: '15px', borderRadius: '10px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' };
const financeGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' };
const finItem = { background: '#fff', padding: '15px', borderRadius: '15px', border: '1px solid #f1f5f9', textAlign: 'center' };
const emiPreview = { background: '#e0e7ff', padding: '25px', borderRadius: '25px', textAlign: 'center', marginBottom: '20px' };
const btnStyle = { width: '100%', padding: '20px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '18px', fontWeight: '900', cursor: 'pointer', fontSize: '16px' };
const infoPanel = { flex: '1', background: '#fff', padding: '30px', borderRadius: '30px', height: 'fit-content', border: '1px solid #e2e8f0' };
const sopCard = { background: '#f8fafc', padding: '20px', borderRadius: '20px', fontSize: '13px', color: '#475569', lineHeight: '2' };

export default ApplyLoan;