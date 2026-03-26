import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios'; 

const ApplyLoan = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({ 
    amount: '', 
    type: 'JLG Loan', 
    tenure: '3', 
    isPep: 'No', 
    isDisabled: 'No' 
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) return alert("Please enter a valid amount.");
    if (!user.id) return alert("Session expired. Please login again.");
    
    setLoading(true);

    const generatedLoanId = "LN-" + Math.floor(100000 + Math.random() * 900000);

    const loanRequest = {
      loanId: generatedLoanId,
      customerId: user.id,
      customerName: user.fullName || "Unknown Customer",
      // 🚀 AGAR Officer linked nahi hai toh null bhejenge taaki Hold par jaye
      fieldOfficerId: user.referredBy || user.sponsorId || null, 
      amount: Number(formData.amount),
      type: formData.type,
      tenureMonths: Number(formData.tenure),
      totalWeeks: finance.totalWeeks,
      processingFee: finance.processingFee,
      fileCharge: finance.fileCharge,
      netDisbursed: finance.netDisbursed,
      weeklyEMI: Number(finance.weeklyEMI), 
      totalPayable: finance.totalPayable,
      // Status backend ka middleware handle karega
      appliedDate: new Date().toISOString(),
    };

    try {
      const res = await API.post('/loans', loanRequest);

      if (res.data.success) {
        alert(`Loan Applied! Ref ID: ${generatedLoanId}. Status: ${res.data.loan.status}`);
        navigate('/customer/tracking'); 
      }
    } catch (error) {
      console.error("Loan Request Error:", error);
      alert(error.response?.data?.details || error.response?.data?.error || "Server error!");
    } finally {
      setLoading(false);
    }
  };

  if (!user.id) {
    return <div className="p-10 text-center font-black text-slate-400">SESSION EXPIRED. PLEASE LOGIN.</div>;
  }

  return (
    <div style={pageContainer} className="animate-fadeIn">
      <div style={formCard}>
        <div style={headerStyle}>
          <div>
             <h2 style={{ color: '#0f172a', margin: 0, fontWeight: '900', letterSpacing: '-1px' }}>New Loan Application</h2>
             <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>D-Finance Digital Processing</p>
          </div>
          <span style={advisorBadge}>OFFICER ID: {user?.referredBy || user?.sponsorId || 'UNASSIGNED'}</span>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={inputGroup}>
            <label style={label}>Loan Amount (₹)</label>
            <input type="number" style={inputStyle} value={formData.amount} required 
              placeholder="Min ₹2,000 - Max ₹1,00,000"
              onChange={e => setFormData({...formData, amount: e.target.value})} />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={inputGroup}>
              <label style={label}>Loan Category</label>
              <select style={inputStyle} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="JLG Loan">JLG Loan (Weekly Recovery)</option>
                <option value="Business Loan">Business Loan (Monthly)</option>
                <option value="Personal Loan">Personal Loan</option>
              </select>
            </div>
            <div style={inputGroup}>
              <label style={label}>Tenure Period</label>
              <select style={inputStyle} value={formData.tenure} onChange={e => setFormData({...formData, tenure: e.target.value})}>
                <option value="3">3 Months (12 Weeks)</option>
                <option value="6">6 Months (24 Weeks)</option>
                <option value="12">12 Months (48 Weeks)</option>
              </select>
            </div>
          </div>

          <div style={feeBox}>
            <div style={feeRow}><span>Processing Fee (1%):</span> <span>- ₹{finance.processingFee.toFixed(2)}</span></div>
            <div style={feeRow}><span>File Verification Charges:</span> <span>- ₹{finance.fileCharge}</span></div>
            <div style={{...feeRow, borderTop: '1px solid #dcfce7', paddingTop: '10px', fontWeight: 'bold', color: '#166534', fontSize: '14px'}}>
              <span>Net Disbursement Amt:</span> <span>₹{finance.netDisbursed.toFixed(2)}</span>
            </div>
          </div>

          <div style={emiPreview}>
            <span style={{ fontSize: '10px', fontWeight: '900', color: '#059669', letterSpacing: '1px' }}>ESTIMATED WEEKLY EMI</span>
            <h3 style={{ margin: '5px 0', color: '#0f172a', fontWeight: '900', fontSize: '24px' }}>₹{finance.weeklyEMI} <small style={{fontSize: '12px', color: '#94a3b8'}}>/ week</small></h3>
            <p style={{fontSize: '10px', color: '#64748b', margin: 0, fontWeight: 'bold'}}>Total Repayment: ₹{finance.totalPayable.toFixed(2)}</p>
          </div>

          <button type="submit" disabled={loading} style={loading ? {...btnStyle, background: '#94a3b8'} : btnStyle}>
            {loading ? "Registering Application..." : "Submit for Field Verification"}
          </button>
        </form>
      </div>

      <div style={infoPanel}>
        <h4 style={{ margin: '0 0 15px 0', color: '#0f172a', fontWeight: '900', fontSize: '14px' }}>📌 SOP COMPLIANCE</h4>
        <ul style={{ paddingLeft: '0', listStyle: 'none', fontSize: '12px', color: '#475569', lineHeight: '2.2' }}>
          <li>✅ <b>Recovery:</b> Weekly doorstep or AC debit.</li>
          <li>✅ <b>Penalty:</b> 10% monthly on overdue amount.</li>
          <li>✅ <b>Verification:</b> LUC & Neighborhood check.</li>
          <li>✅ <b>Assignment:</b> Unassigned loans go to the Open Pool.</li>
        </ul>
        <div style={{ marginTop: '20px', padding: '15px', background: '#fff', borderRadius: '12px', fontSize: '11px', color: '#b91c1c', fontWeight: 'bold', border: '1px dashed #fca5a5' }}>
            ⚠️ Notice: If you don't have an Advisor ID, your loan will be placed in the Open Pool for officers to claim.
        </div>
      </div>
    </div>
  );
};

// --- Styles stay exactly as you had them ---
const pageContainer = { display: 'flex', gap: '25px', padding: '30px', maxWidth: '1200px', margin: '0 auto', background: '#f8fafc', minHeight: '100vh', alignItems: 'flex-start' };
const formCard = { flex: '2', background: '#fff', padding: '40px', borderRadius: '32px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' };
const infoPanel = { flex: '1', background: '#f0fdf4', padding: '30px', borderRadius: '32px', border: '1px solid #dcfce7', position: 'sticky', top: '20px' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' };
const advisorBadge = { background: '#f1f5f9', color: '#64748b', fontSize: '9px', fontWeight: '900', padding: '6px 14px', borderRadius: '8px', letterSpacing: '0.5px' };
const inputGroup = { marginBottom: '20px' };
const label = { display: 'block', fontSize: '10px', fontWeight: '900', color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' };
const inputStyle = { width: '100%', padding: '14px', borderRadius: '14px', border: '1.5px solid #e2e8f0', fontSize: '14px', fontWeight: '700', outline: 'none', background: '#fcfcfc', color: '#1e293b', boxSizing: 'border-box' };
const feeBox = { background: '#f8fafc', padding: '20px', borderRadius: '20px', marginBottom: '25px', border: '1px solid #f1f5f9' };
const feeRow = { display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', marginBottom: '8px', fontWeight: '600' };
const emiPreview = { background: '#f0fdf4', padding: '25px', borderRadius: '24px', marginBottom: '25px', border: '2px dashed #059669', textAlign: 'center' };
const btnStyle = { width: '100%', padding: '18px', background: '#059669', color: '#fff', border: 'none', borderRadius: '18px', cursor: 'pointer', fontWeight: '900', fontSize: '15px', transition: 'all 0.3s', boxShadow: '0 10px 15px -3px rgba(5, 150, 105, 0.3)' };

export default ApplyLoan;