import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ApplyLoan = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({ 
    amount: '', 
    type: 'JLG Loan', 
    tenure: '3', // Default 3 months for weekly recovery
    isPep: 'No', 
    isDisabled: 'No' 
  });

  // --- MARKET MATH LOGIC ---
  const calculateFinances = () => {
    const principal = Number(formData.amount) || 0;
    const months = Number(formData.tenure) || 0;
    
    // 1. Deductions
    const processingFee = principal * 0.01; // 1%
    const fileCharge = principal > 0 ? 200 : 0; // Fixed ₹200
    const netDisbursed = principal - (processingFee + fileCharge);

    // 2. Interest (3% Monthly)
    const totalInterest = principal * 0.03 * months;
    const totalPayable = principal + totalInterest;

    // 3. Weekly EMI (4 weeks per month)
    const totalWeeks = months * 4;
    const weeklyEMI = totalWeeks > 0 ? (totalPayable / totalWeeks).toFixed(2) : 0;

    return { processingFee, fileCharge, netDisbursed, weeklyEMI, totalWeeks, totalPayable };
  };

  const finance = calculateFinances();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const generatedLoanId = "LN-" + Math.floor(100000 + Math.random() * 900000);

    const loanRequest = {
      id: generatedLoanId,
      customerId: String(user.id),
      sponsorId: String(user.sponsorId),
      customerName: user.fullName,
      amount: formData.amount,
      type: formData.type,
      tenureMonths: formData.tenure,
      totalWeeks: finance.totalWeeks,
      processingFee: finance.processingFee,
      fileCharge: finance.fileCharge,
      netDisbursed: finance.netDisbursed,
      weeklyEMI: finance.weeklyEMI,
      totalPayable: finance.totalPayable,
      status: 'Verification Pending', 
      penaltyRate: '10% Monthly',
      appliedDate: new Date().toISOString(),
    };

    try {
      const res = await fetch('http://localhost:5000/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loanRequest)
      });

      if (res.ok) {
        alert(`Loan Applied! Net Amount to be received: ₹${finance.netDisbursed}`);
        navigate('/customer/tracking'); 
      }
    } catch (error) {
      alert("Server error!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageContainer}>
      <div style={formCard}>
        <div style={headerStyle}>
          <h2 style={{ color: '#0f172a', margin: 0 }}>New Loan Application</h2>
          <span style={advisorBadge}>Advisor ID: {user?.sponsorId}</span>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={inputGroup}>
            <label style={label}>Loan Amount (₹)</label>
            <input type="number" style={inputStyle} value={formData.amount} required 
              placeholder="e.g. 10000"
              onChange={e => setFormData({...formData, amount: e.target.value})} />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={inputGroup}>
              <label style={label}>Loan Type</label>
              <select style={inputStyle} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="JLG Loan">JLG Loan (Weekly)</option>
                <option value="Business Loan">Business Loan</option>
                <option value="Personal Loan">Personal Loan</option>
              </select>
            </div>
            <div style={inputGroup}>
              <label style={label}>Tenure (Months)</label>
              <select style={inputStyle} value={formData.tenure} onChange={e => setFormData({...formData, tenure: e.target.value})}>
                <option value="3">3 Months (12 Weeks)</option>
                <option value="6">6 Months (24 Weeks)</option>
                <option value="12">12 Months (48 Weeks)</option>
              </select>
            </div>
          </div>

          {/* --- FEE BREAKDOWN BOX --- */}
          <div style={feeBox}>
            <div style={feeRow}><span>Processing Fee (1%):</span> <span>- ₹{finance.processingFee}</span></div>
            <div style={feeRow}><span>File Charges:</span> <span>- ₹{finance.fileCharge}</span></div>
            <div style={{...feeRow, borderTop: '1px solid #dcfce7', paddingTop: '10px', fontWeight: 'bold', color: '#166534'}}>
              <span>Net Disbursement:</span> <span>₹{finance.netDisbursed}</span>
            </div>
          </div>

          <div style={emiPreview}>
            <span style={{ fontSize: '10px', fontWeight: '900', color: '#059669' }}>WEEKLY INSTALLMENT (3% INT.)</span>
            <h3 style={{ margin: '5px 0', color: '#0f172a', fontWeight: '900' }}>₹{finance.weeklyEMI} / week</h3>
            <p style={{fontSize: '9px', color: '#64748b', margin: 0}}>Total Repayable: ₹{finance.totalPayable}</p>
          </div>

          <button type="submit" disabled={loading} style={loading ? {...btnStyle, background: '#94a3b8'} : btnStyle}>
            {loading ? "Processing..." : "Submit for Field Visit"}
          </button>
        </form>
      </div>

      <div style={infoPanel}>
        <h4 style={{ margin: '0 0 15px 0', color: '#0f172a' }}>📌 Market SOP Rules</h4>
        <ul style={{ paddingLeft: '0', listStyle: 'none', fontSize: '12px', color: '#475569', lineHeight: '2' }}>
          <li>🔹 <b>Weekly Recovery:</b> Installment every week.</li>
          <li>🔹 <b>Penalty:</b> 10% month if AC Debit fails.</li>
          <li>🔹 <b>LUC Visit:</b> Mandatory home verification.</li>
          <li>🔹 <b>Disbursement:</b> Directly to Aadhaar linked AC.</li>
        </ul>
      </div>
    </div>
  );
};

// --- Styles ---
const pageContainer = { display: 'flex', gap: '20px', padding: '20px', maxWidth: '1100px', margin: '0 auto' };
const formCard = { flex: '2', background: '#fff', padding: '35px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' };
const infoPanel = { flex: '1', background: '#f0fdf4', padding: '25px', borderRadius: '24px', border: '1px solid #dcfce7', height: 'fit-content' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const advisorBadge = { background: '#f1f5f9', color: '#64748b', fontSize: '10px', fontWeight: 'bold', padding: '5px 12px', borderRadius: '6px' };
const inputGroup = { marginBottom: '15px' };
const label = { display: 'block', fontSize: '10px', fontWeight: '900', color: '#64748b', marginBottom: '5px', textTransform: 'uppercase' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', fontWeight: '600' };
const feeBox = { background: '#f8fafc', padding: '15px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' };
const feeRow = { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '5px' };
const emiPreview = { background: '#fff', padding: '15px', borderRadius: '16px', marginBottom: '20px', border: '2px dashed #059669', textAlign: 'center' };
const btnStyle = { width: '100%', padding: '16px', background: '#059669', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '900', fontSize: '14px' };

export default ApplyLoan;