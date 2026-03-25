import React, { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios'; // Hamara naya Axios instance

const AdvisorVerification = () => {
  const [myPendingLoans, setMyPendingLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);
  
  const [fieldForm, setFieldForm] = useState({
    religion: 'HINDU', category: 'GENERAL', education: 'GRADUATE',
    residenceNature: 'Own', houseType: 'CONCRETE', areaType: 'RURAL',
    vehicle: 'Yes', vehicleType: 'CAR', familyIncomeActivity: 'Paddy',
    monthlyIncome: '', expenditure: '', financialInclusion: [] 
  });

  // LocalStorage se Advisor ki details nikalna
  const currentAdvisor = JSON.parse(localStorage.getItem('user')) || {};

  const fetchMyRequests = useCallback(async () => {
    if (!currentAdvisor.id && !currentAdvisor._id) return;
    setLoading(true);
    try {
      // Atlas API call: Sirf 'Verification Pending' status wale loans mangwana
      // Backend par hum query filter use karenge
      const res = await API.get(`/loans?status=Verification Pending&sponsorId=${currentAdvisor.id || currentAdvisor._id}`);
      
      setMyPendingLoans(res.data.reverse());
    } catch (err) { 
      console.error("Fetch error:", err); 
    } finally { 
      setLoading(false); 
    }
  }, [currentAdvisor.id, currentAdvisor._id]);

  useEffect(() => {
    fetchMyRequests();
  }, [fetchMyRequests]);

  const handleCheckbox = (item) => {
    const updated = fieldForm.financialInclusion.includes(item)
      ? fieldForm.financialInclusion.filter(i => i !== item)
      : [...fieldForm.financialInclusion, item];
    setFieldForm({ ...fieldForm, financialInclusion: updated });
  };

  const handleSOPSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const inspectionData = {
      ...fieldForm,
      status: "Field Verified", // Moves to Accountant stage
      inspectionDate: new Date().toISOString(),
      advisorId: currentAdvisor.id || currentAdvisor._id,
      verifiedByName: currentAdvisor.fullName,
    };

    try {
      // Atlas Update Call (Patch request using Axios)
      await API.patch(`/loans/${selectedLoan._id || selectedLoan.id}`, inspectionData);
      
      alert("✅ LUC Report Submitted to Accountant!");
      setSelectedLoan(null);
      fetchMyRequests();
    } catch (err) {
      alert("❌ Submission failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={headerSection}>
        <h2 style={{ color: '#0f172a', margin: 0, fontWeight: '900' }}>🏠 MY FIELD ASSIGNMENTS (LUC)</h2>
        <p style={{ color: '#64748b', fontSize: '13px' }}>Advisor: <b>{currentAdvisor?.fullName}</b></p>
      </div>
      
      {loading && !selectedLoan ? (
        <p style={statusMsg}>🔄 Syncing assignments from Cloud...</p>
      ) : myPendingLoans.length === 0 ? (
        <div style={emptyState}>
          <p>No Pending Visits Found</p>
          <small>Assignments appear when customers apply under your ID.</small>
        </div>
      ) : (
        <div style={gridContainer}>
          {myPendingLoans.map(loan => (
            <div key={loan._id || loan.id} style={verifyCard}>
              <div style={cardBadge}>LUC PENDING</div>
              <h4 style={{margin: '10px 0 5px 0', color: '#1e293b'}}>{loan.customerName}</h4>
              <p style={{color: '#059669', fontWeight: '900', fontSize: '20px'}}>₹{loan.amount}</p>
              <p style={{fontSize: '11px', color: '#94a3b8', fontWeight: '700'}}>LOAN ID: {loan.loanId}</p>
              <button onClick={() => setSelectedLoan(loan)} style={verifyBtn}>Start Field Audit</button>
            </div>
          ))}
        </div>
      )}

      {selectedLoan && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={modalHeader}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>LUC Audit: {selectedLoan.customerName}</h3>
              <button onClick={() => setSelectedLoan(null)} style={closeBtn}>✕</button>
            </div>
            
            <form onSubmit={handleSOPSubmit} style={formScroll}>
              <div style={summaryBox}>
                <p style={{fontSize: '10px', fontWeight: '900', color: '#059669', marginBottom: '10px', letterSpacing: '1px'}}>LOAN SUMMARY</p>
                <div style={summaryGrid}>
                   <div><span style={tinyLabel}>Applied:</span> <br/><b>₹{selectedLoan.amount}</b></div>
                   <div><span style={tinyLabel}>Weekly EMI:</span> <br/><b style={{color: '#2563eb'}}>₹{selectedLoan.weeklyEMI}</b></div>
                   <div><span style={tinyLabel}>Tenure:</span> <br/><b>{selectedLoan.totalWeeks} Weeks</b></div>
                </div>
              </div>

              <div style={formGrid}>
                <section>
                  <label style={labelStyle}>RELIGION</label>
                  <select style={inputStyle} value={fieldForm.religion} onChange={e => setFieldForm({...fieldForm, religion: e.target.value})}>
                    <option>HINDU</option><option>MUSLIM</option><option>CHRISTIAN</option><option>OTHERS</option>
                  </select>
                  <label style={labelStyle}>CATEGORY</label>
                  <select style={inputStyle} value={fieldForm.category} onChange={e => setFieldForm({...fieldForm, category: e.target.value})}>
                    <option>GENERAL</option><option>OBC</option><option>SC</option><option>ST</option>
                  </select>
                </section>
                <section>
                  <label style={labelStyle}>HOUSE TYPE</label>
                  <select style={inputStyle} value={fieldForm.houseType} onChange={e => setFieldForm({...fieldForm, houseType: e.target.value})}>
                    <option>CONCRETE</option><option>KUTCHA</option><option>TILED</option>
                  </select>
                  <label style={labelStyle}>MONTHLY INCOME</label>
                  <input type="number" style={inputStyle} placeholder="₹ 0.00" value={fieldForm.monthlyIncome} onChange={e => setFieldForm({...fieldForm, monthlyIncome: e.target.value})} />
                </section>
              </div>

              <label style={labelStyle}>FINANCIAL INCLUSION (Multiple)</label>
              <div style={checkboxGroup}>
                {['Loans', 'Bank Account', 'Insurance', 'Chits'].map(item => (
                  <label key={item} style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={fieldForm.financialInclusion.includes(item)} onChange={() => handleCheckbox(item)} /> {item}
                  </label>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                <button type="button" onClick={() => setSelectedLoan(null)} style={cancelBtn}>CANCEL</button>
                <button type="submit" disabled={loading} style={loading ? {...submitBtn, opacity: 0.7} : submitBtn}>
                  {loading ? 'Submitting...' : 'COMPLETE AUDIT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Updated Styles ---
const headerSection = { marginBottom: '30px', borderBottom: '2.5px solid #f1f5f9', paddingBottom: '15px' };
const summaryBox = { background: '#f0fdf4', padding: '20px', borderRadius: '18px', border: '1px solid #dcfce7', marginBottom: '25px' };
const summaryGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' };
const tinyLabel = { fontSize: '9px', color: '#059669', fontWeight: '900', textTransform: 'uppercase' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' };
const modalContent = { background: '#fff', borderRadius: '32px', width: '95%', maxWidth: '600px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' };
const modalHeader = { background: '#0f172a', color: '#fff', padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const closeBtn = { background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer' };
const formScroll = { padding: '25px', overflowY: 'auto', maxHeight: '70vh' };
const formGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const inputStyle = { width: '100%', padding: '14px', margin: '10px 0 20px 0', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', background: '#f8fafc' };
const labelStyle = { fontSize: '10px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' };
const checkboxGroup = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: '#f8fafc', padding: '20px', borderRadius: '15px', border: '1.5px solid #e2e8f0', marginTop: '10px' };
const submitBtn = { flex: 2, padding: '18px', background: '#059669', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: '900', cursor: 'pointer', fontSize: '14px' };
const cancelBtn = { flex: 1, padding: '18px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '16px', fontWeight: '900', cursor: 'pointer' };
const gridContainer = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' };
const verifyCard = { background: '#fff', padding: '30px', borderRadius: '28px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)' };
const cardBadge = { display: 'inline-block', background: '#fef3c7', padding: '5px 12px', borderRadius: '8px', fontSize: '9px', fontWeight: '900', color: '#92400e' };
const verifyBtn = { width: '100%', marginTop: '20px', padding: '15px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '900', cursor: 'pointer' };
const emptyState = { textAlign: 'center', padding: '80px 20px', color: '#94a3b8', background: '#fff', borderRadius: '30px', border: '2px dashed #e2e8f0' };
const statusMsg = { textAlign: 'center', color: '#64748b', padding: '20px', fontWeight: 'bold' };

export default AdvisorVerification;