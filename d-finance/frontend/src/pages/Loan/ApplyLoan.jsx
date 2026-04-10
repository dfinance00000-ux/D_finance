import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios'; 
import { 
  FiCamera, FiAlertCircle, FiMapPin, FiCalendar, 
  FiDollarSign, FiUser, FiHome, FiCreditCard, FiHash, FiActivity, FiClock // 👈 FIXED: FiClock added here
} from 'react-icons/fi';

const ApplyLoan = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({ 
    amount: '10000', 
    type: 'Daily EMI', 
    tenure: '1', 
    accountHolderName: '',
    bankName: '',
    branchName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    passbookPic: ''
  });

  const calculateFinances = () => {
    const principal = Number(formData.amount) || 0;
    const months = Number(formData.tenure) || 0;
    const processingFee = principal * 0.02; 
    const netDisbursed = principal - processingFee;
    const totalInterest = principal * 0.10 * months;
    const totalPayable = principal + totalInterest;
    let totalInstallments = formData.type === 'Daily EMI' ? months * 30 : months * 4;
    const installmentAmount = totalInstallments > 0 ? (totalPayable / totalInstallments) : 0;
    const lateFinePerEmi = installmentAmount * 0.10;

    return { 
      processingFee, netDisbursed, 
      installmentAmount: installmentAmount.toFixed(2), 
      totalInstallments, totalPayable,
      lateFinePerEmi: lateFinePerEmi.toFixed(2)
    };
  };

  const finance = calculateFinances();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, passbookPic: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(formData.amount) < 10000) return alert("⚠️ Minimum loan amount must be ₹10,000.");
    if (formData.accountNumber !== formData.confirmAccountNumber) return alert("❌ Account Numbers do not match!");
    if (!formData.passbookPic) return alert("📸 Please upload your bank passbook photo.");
    if (!formData.branchName) return alert("🏦 Please enter your Branch Name.");
    
    setLoading(true);
    const generatedLoanId = "LN-" + Math.floor(100000 + Math.random() * 900000);

    const loanRequest = {
      ...formData,
      loanId: generatedLoanId,
      customerId: user.id || user._id,
      customerName: user.fullName,
      amount: Number(formData.amount),
      tenureMonths: Number(formData.tenure),
      emiType: formData.type,
      installmentAmount: Number(finance.installmentAmount),
      totalInstallments: finance.totalInstallments,
      processingFee: finance.processingFee,
      totalPayable: finance.totalPayable,
      netDisbursed: finance.netDisbursed,
      status: "Verification Pending",
      appliedDate: new Date().toISOString(),
    };

    try {
      const res = await API.post('/loans', loanRequest);
      if (res.data.success) {
        alert(`🎉 Loan Request Generated: LN-${generatedLoanId}`);
        navigate('/customer/tracking'); 
      }
    } catch (error) {
      alert(error.response?.data?.error || "Ledger sync failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portal-container">
      <style>{professionalStyles}</style>

      <div className="application-frame">
        <header className="terminal-header">
          <div>
            <h1 className="main-title">Disbursement Application</h1>
            <p className="sub-title">Initialize your credit facility within Mathura Branch network</p>
          </div>
          <div className="security-tag"><FiActivity /> Encrypted Session</div>
        </header>

        <form onSubmit={handleSubmit} className="terminal-form">
          <div className="form-section">
            <h3 className="section-heading">01. Loan Configuration</h3>
            <div className="input-grid">
              <div className="field-box">
                <label className="field-label">Loan Principal (₹)</label>
                <div className="input-with-icon">
                  <FiDollarSign className="icon-main" />
                  <input type="number" className="premium-input" value={formData.amount} required 
                    min="10000" onChange={e => setFormData({...formData, amount: e.target.value})} />
                </div>
              </div>
              <div className="field-box">
                <label className="field-label">Repayment Structure</label>
                <div className="input-with-icon">
                  <FiCalendar className="icon-main" />
                  <select className="premium-input" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="Daily EMI">Daily Recovery</option>
                    <option value="Weekly EMI">Weekly Recovery</option>
                  </select>
                </div>
              </div>
              <div className="field-box">
                <label className="field-label">Facility Tenure (Months)</label>
                <div className="input-with-icon">
                  <FiClock className="icon-main" />
                  <select className="premium-input" value={formData.tenure} onChange={e => setFormData({...formData, tenure: e.target.value})}>
                    {[1,2,3,4,5,6].map(m => <option key={m} value={m}>{m} Month Term</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-heading">02. Settlement Destination (Bank Account)</h3>
            <div className="stacked-fields">
              <div className="field-box">
                <label className="field-label">Account Holder Name</label>
                <div className="input-with-icon">
                  <FiUser className="icon-main" />
                  <input className="premium-input" placeholder="Legal name as per bank records" required value={formData.accountHolderName} 
                    onChange={e => setFormData({...formData, accountHolderName: e.target.value})} />
                </div>
              </div>

              <div className="input-grid">
                <div className="field-box">
                  <label className="field-label">Full Bank Name</label>
                  <div className="input-with-icon">
                    <FiHome className="icon-main" />
                    <input className="premium-input" placeholder="e.g. HDFC Bank Ltd" required value={formData.bankName} 
                      onChange={e => setFormData({...formData, bankName: e.target.value})} />
                  </div>
                </div>
                <div className="field-box">
                  <label className="field-label">Branch & Location</label>
                  <div className="input-with-icon">
                    <FiMapPin className="icon-main" />
                    <input className="premium-input" placeholder="e.g. Krishna Nagar, Mathura" required value={formData.branchName} 
                      onChange={e => setFormData({...formData, branchName: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="input-grid">
                <div className="field-box">
                  <label className="field-label">Bank IFSC Code</label>
                  <div className="input-with-icon">
                    <FiHash className="icon-main" />
                    <input className="premium-input" placeholder="ABCD0123456" required value={formData.ifscCode} 
                      onChange={e => setFormData({...formData, ifscCode: e.target.value.toUpperCase()})} />
                  </div>
                </div>
                <div className="field-box">
                  <label className="field-label">Primary Account Number</label>
                  <div className="input-with-icon">
                    <FiCreditCard className="icon-main" />
                    <input type="password" className="premium-input" placeholder="Enter bank account number" required value={formData.accountNumber} 
                      onChange={e => setFormData({...formData, accountNumber: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="field-box">
                <label className="field-label">Re-Confirm Account Number</label>
                <input className="premium-input plain" placeholder="Verify your account number" required value={formData.confirmAccountNumber} 
                  onChange={e => setFormData({...formData, confirmAccountNumber: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-heading">03. Digital Evidence (KYC)</h3>
            <div className="evidence-vault">
              <label className="upload-trigger">
                <FiCamera size={24} />
                <span>Capture Bank Passbook or Cancelled Cheque</span>
                <input type="file" accept="image/*" onChange={handleImageChange} hidden />
              </label>
              {formData.passbookPic && (
                <div className="preview-container">
                  <img src={formData.passbookPic} className="image-preview" alt="Document Preview" />
                  <div className="success-badge">Document Uploaded</div>
                </div>
              )}
            </div>
          </div>

          <button type="submit" disabled={loading} className="master-submit-btn">
            {loading ? "Authenticating Request..." : "Finalize Application & Submit"}
          </button>
        </form>
      </div>

      <aside className="financial-terminal">
        <div className="terminal-sticky">
          <div className="emi-insight-card">
            <header>
              <span className="type-label">{formData.type.toUpperCase()}</span>
              <FiActivity color="#10b981" />
            </header>
            <div className="amount-display">
              <h2 className="curr-amount">₹{finance.installmentAmount}</h2>
              <span className="curr-cycle">/ per {formData.type === 'Daily EMI' ? 'day' : 'week'}</span>
            </div>
            <footer className="late-info">
              <FiAlertCircle /> Late Penalty: ₹{finance.lateFinePerEmi}
            </footer>
          </div>

          <div className="ledger-summary">
            <h4 className="ledger-title">Facility Ledger</h4>
            <div className="ledger-row highlight">
              <span>Disbursement (Net)</span>
              <span>₹{finance.netDisbursed}</span>
            </div>
            <div className="ledger-row">
              <span>Principal Amount</span>
              <span>₹{Number(formData.amount).toLocaleString()}</span>
            </div>
            <div className="ledger-row">
              <span>Interest (10% Flat)</span>
              <span>₹{(finance.totalPayable - Number(formData.amount)).toFixed(0)}</span>
            </div>
            <div className="ledger-row">
              <span>Service Fee (2%)</span>
              <span>₹{finance.processingFee}</span>
            </div>
            <div className="ledger-row total">
              <span>Total Payable</span>
              <span>₹{finance.totalPayable.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

const professionalStyles = `
  .portal-container { display: flex; gap: 40px; padding: 40px; max-width: 1440px; margin: 0 auto; background: #f8fafc; min-height: 100vh; font-family: 'Plus Jakarta Sans', sans-serif; }
  .application-frame { flex: 1; background: #fff; border-radius: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.03); border: 1px solid #eef2f6; overflow: hidden; }
  .terminal-header { background: #0f172a; padding: 40px; color: #fff; display: flex; justify-content: space-between; align-items: center; }
  .main-title { margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -1px; }
  .sub-title { margin: 5px 0 0 0; color: #94a3b8; font-size: 14px; }
  .security-tag { background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 8px 16px; border-radius: 100px; font-size: 11px; font-weight: 800; display: flex; align-items: center; gap: 8px; text-transform: uppercase; }
  .terminal-form { padding: 40px; }
  .form-section { margin-bottom: 40px; }
  .section-heading { font-size: 13px; font-weight: 900; color: #6366f1; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1.5px solid #f1f5f9; padding-bottom: 15px; margin-bottom: 25px; }
  .input-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
  .field-box { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
  .field-label { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
  .input-with-icon { position: relative; display: flex; align-items: center; }
  .icon-main { position: absolute; left: 16px; color: #cbd5e1; font-size: 20px; }
  .premium-input { width: 100%; padding: 16px 16px 16px 52px; border-radius: 16px; border: 2px solid #f1f5f9; outline: none; background: #fff; font-weight: 800; font-size: 15px; transition: 0.3s; box-sizing: border-box; color: #0f172a; }
  .premium-input.plain { padding: 16px; }
  .premium-input:focus { border-color: #6366f1; box-shadow: 0 0 0 5px rgba(99, 102, 241, 0.05); }
  .evidence-vault { border: 2px dashed #e2e8f0; border-radius: 24px; padding: 40px; text-align: center; background: #fafafa; }
  .upload-trigger { cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 10px; color: #64748b; font-weight: 700; }
  .preview-container { margin-top: 25px; }
  .image-preview { width: 100%; max-height: 300px; object-fit: contain; border-radius: 20px; }
  .success-badge { background: #10b981; color: #fff; padding: 6px 12px; border-radius: 8px; font-size: 10px; font-weight: 900; display: inline-block; margin-top: 15px; }
  .master-submit-btn { width: 100%; padding: 24px; background: #0f172a; color: #fff; border: none; border-radius: 20px; font-weight: 900; cursor: pointer; font-size: 16px; transition: 0.4s; }
  .master-submit-btn:hover { background: #6366f1; transform: translateY(-3px); }
  .financial-terminal { flex: 0 0 380px; }
  .terminal-sticky { position: sticky; top: 120px; }
  .emi-insight-card { background: #0f172a; color: #fff; padding: 35px; border-radius: 35px; margin-bottom: 25px; }
  .emi-insight-card header { display: flex; justify-content: space-between; margin-bottom: 20px; }
  .type-label { font-size: 10px; font-weight: 950; letter-spacing: 2px; color: #6366f1; }
  .curr-amount { margin: 0; font-size: 48px; font-weight: 950; letter-spacing: -2px; }
  .curr-cycle { font-size: 14px; color: #94a3b8; font-weight: 700; }
  .late-info { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #fb7185; font-weight: 800; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px; margin-top: 20px; }
  .ledger-summary { background: #fff; border-radius: 30px; padding: 30px; border: 1px solid #eef2f6; }
  .ledger-title { margin: 0 0 20px 0; font-size: 14px; font-weight: 900; color: #0f172a; text-transform: uppercase; }
  .ledger-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f8fafc; font-size: 13px; font-weight: 700; color: #64748b; }
  .ledger-row.highlight { color: #10b981; }
  .ledger-row span:last-child { color: #0f172a; font-weight: 900; }
  .ledger-row.total { border-top: 2px solid #f1f5f9; border-bottom: none; margin-top: 10px; font-size: 16px; color: #0f172a; }

  @media (max-width: 1100px) {
    .portal-container { flex-direction: column; padding: 20px; }
    .financial-terminal { flex: none; width: 100%; }
    .terminal-header { flex-direction: column; gap: 20px; text-align: center; }
  }
`;

export default ApplyLoan;