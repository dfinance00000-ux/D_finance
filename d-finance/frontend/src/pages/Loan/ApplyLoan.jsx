import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios'; 
import { FiBriefcase, FiCamera, FiCheckCircle, FiInfo, FiSmartphone } from 'react-icons/fi';

const ApplyLoan = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({ 
    amount: '', 
    type: 'JLG Loan', 
    tenure: '3', 
    isPep: 'No', 
    isDisabled: 'No',
    // 🆕 Expanded Bank & Passbook Fields
    accountHolderName: '',
    bankName: '',
    branchName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    lastTransactionDate: '',
    lastTransactionAmount: '',
    // 📸 Document Base64
    passbookPic: ''
  });

  // --- MARKET MATH LOGIC ---
  const calculateFinances = () => {
    const principal = Number(formData.amount) || 0;
    const months = Number(formData.tenure) || 0;
    
    const processingFee = principal * 0.01; 
    const fileCharge = principal > 0 ? 200 : 0; 
    const netDisbursed = principal - (processingFee + fileCharge);

    const totalInterest = principal * 0.03 * months;
    const totalPayable = principal + totalInterest;

    const totalWeeks = months * 4;
    const weeklyEMI = totalWeeks > 0 ? (totalPayable / totalWeeks).toFixed(2) : 0;

    return { processingFee, fileCharge, netDisbursed, weeklyEMI, totalWeeks, totalPayable };
  };

  const finance = calculateFinances();

  // Image to Base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, passbookPic: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.accountNumber !== formData.confirmAccountNumber) {
        return alert("Account Numbers do not match!");
    }
    if (!formData.passbookPic) return alert("Please upload Bank Passbook/Cheque photo.");
    
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
      totalWeeks: finance.totalWeeks,
      weeklyEMI: Number(finance.weeklyEMI), 
      totalPayable: finance.totalPayable,
      status: "Verification Pending",
      appliedDate: new Date().toISOString(),
    };

    try {
      const res = await API.post('/loans', loanRequest);
      if (res.data.success) {
        alert(`Loan Applied! Ref ID: ${generatedLoanId}`);
        navigate('/customer/tracking'); 
      }
    } catch (error) {
      alert(error.response?.data?.error || "Server error!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageContainer}>
      <div style={formCard}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0, fontWeight: 900 }}>🚀 Digital Loan Application</h2>
          <span style={advisorBadge}>OFFICER ID: {user?.referredBy || 'DIRECT'}</span>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Amount & Month-wise Tenure */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={inputGroup}>
                <label style={label}>Loan Amount (₹)</label>
                <input type="number" style={inputStyle} value={formData.amount} required 
                    onChange={e => setFormData({...formData, amount: e.target.value})} />
            </div>
            <div style={inputGroup}>
                <label style={label}>Tenure (Months)</label>
                <select style={inputStyle} value={formData.tenure} onChange={e => setFormData({...formData, tenure: e.target.value})}>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                        <option key={m} value={m}>{m} Month{m > 1 ? 's' : ''}</option>
                    ))}
                </select>
            </div>
          </div>

          {/* 🏦 Detailed Bank Section */}
          <div style={bankSection}>
            <h4 style={bankTitle}>🏦 Disbursement Bank Account Details</h4>
            <div style={inputGroup}>
                <label style={label}>Account Holder Name (As per Bank)</label>
                <input style={inputStyle} required value={formData.accountHolderName} onChange={e => setFormData({...formData, accountHolderName: e.target.value})} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={inputGroup}>
                    <label style={label}>Bank Name</label>
                    <input style={inputStyle} required value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} />
                </div>
                <div style={inputGroup}>
                    <label style={label}>Branch Name</label>
                    <input style={inputStyle} required value={formData.branchName} onChange={e => setFormData({...formData, branchName: e.target.value})} />
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={inputGroup}>
                    <label style={label}>Account Number</label>
                    <input type="password" style={inputStyle} required value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} />
                </div>
                <div style={inputGroup}>
                    <label style={label}>Confirm Account Number</label>
                    <input type="text" style={inputStyle} required value={formData.confirmAccountNumber} onChange={e => setFormData({...formData, confirmAccountNumber: e.target.value})} />
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={inputGroup}>
                    <label style={label}>IFSC Code</label>
                    <input style={inputStyle} required value={formData.ifscCode} onChange={e => setFormData({...formData, ifscCode: e.target.value.toUpperCase()})} />
                </div>
                <div style={inputGroup}>
                    <label style={label}>Last Transaction Date</label>
                    <input type="date" style={inputStyle} value={formData.lastTransactionDate} onChange={e => setFormData({...formData, lastTransactionDate: e.target.value})} />
                </div>
            </div>

            {/* 📸 Passbook Upload */}
            <div style={uploadBox}>
                <label style={label}><FiCamera /> Upload Passbook/Cancel Cheque</label>
                <input type="file" accept="image/*" onChange={handleImageChange} style={{marginTop: '10px'}} />
                {formData.passbookPic && <img src={formData.passbookPic} style={previewImg} alt="Passbook Preview" />}
            </div>
          </div>

          <div style={emiPreview}>
            <span style={{ fontSize: '10px', fontWeight: '900', color: '#059669' }}>ESTIMATED WEEKLY RECOVERY</span>
            <h3 style={{ margin: '5px 0', fontSize: '26px', fontWeight: '900' }}>₹{finance.weeklyEMI} <small style={{fontSize: '12px', color: '#94a3b8'}}>/ week</small></h3>
          </div>

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? "Processing Ledger..." : "Submit Application"}
          </button>
        </form>
      </div>

      <div style={infoPanel}>
        <h4 style={{ margin: '0 0 15px 0', fontWeight: '900' }}>📌 AUDIT NOTICE</h4>
        <p style={{fontSize: '12px', color: '#475569', lineHeight: '1.6'}}>
            This data will be cross-verified by <b>Field Officer</b> during LUC and <b>Accountant</b> before disbursement. 
            Wrong bank details will lead to immediate rejection.
        </p>
      </div>
    </div>
  );
};

// --- Styles ---
const pageContainer = { display: 'flex', gap: '20px', padding: '20px', maxWidth: '1200px', margin: '0 auto', background: '#f8fafc', minHeight: '100vh' };
const formCard = { flex: '2', background: '#fff', padding: '30px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' };
const infoPanel = { flex: '1', background: '#f0fdf4', padding: '25px', borderRadius: '25px', height: 'fit-content', border: '1px solid #dcfce7' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', marginBottom: '25px' };
const advisorBadge = { background: '#f1f5f9', padding: '5px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: '900' };
const inputGroup = { marginBottom: '15px' };
const label = { display: 'block', fontSize: '11px', fontWeight: '900', color: '#64748b', marginBottom: '5px', textTransform: 'uppercase' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', background: '#fcfcfc', fontWeight: '700', boxSizing: 'border-box' };
const bankSection = { padding: '20px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '20px' };
const bankTitle = { margin: '0 0 15px 0', fontSize: '14px', color: '#0f172a', fontWeight: '900' };
const uploadBox = { marginTop: '10px', padding: '15px', border: '2px dashed #cbd5e1', borderRadius: '15px', textAlign: 'center' };
const previewImg = { width: '100%', maxHeight: '200px', objectFit: 'contain', marginTop: '15px', borderRadius: '10px' };
const emiPreview = { background: '#f0fdf4', padding: '20px', borderRadius: '20px', textAlign: 'center', marginBottom: '20px', border: '1px solid #dcfce7' };
const btnStyle = { width: '100%', padding: '18px', background: '#059669', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: '900', cursor: 'pointer' };

export default ApplyLoan;