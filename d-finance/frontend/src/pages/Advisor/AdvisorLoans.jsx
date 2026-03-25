import React, { useState, useEffect } from 'react';

const AdvisorLoans = () => {
  const [pendingLoans, setPendingLoans] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null); // Modal for SOP verification
  
  // Field Verification Form State
  const [fieldForm, setFieldForm] = useState({ 
    houseType: 'CONCRETE', 
    subOccupation: '',
    assistanceType: 'None'
  });

  const currentAdvisor = JSON.parse(localStorage.getItem('user'));

  const fetchData = async () => {
    try {
      // Step: Fetch only loans with 'Verification Pending' status 
      const [loanRes, userRes] = await Promise.all([
        fetch('http://localhost:5000/loans?status=Verification Pending'),
        fetch('http://localhost:5000/users')
      ]);
      
      const loanData = await loanRes.json();
      const userData = await userRes.json();
      
      // Filter: Show only customers assigned to this advisor [cite: 168]
      const assignedLoans = loanData.filter(loan => {
        const customer = userData.find(u => String(u.id) === String(loan.customerId));
        return customer && String(customer.sponsorId) === String(currentAdvisor.id);
      });

      setPendingLoans(assignedLoans.reverse());
      setUsers(userData);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSOPSubmit = async (e) => {
    e.preventDefault();
    if (!fieldForm.subOccupation) return alert("Please select Occupation Sub-category[cite: 9].");

    const inspectionData = {
      status: "Field Verified", // Moves to Accountant stage [cite: 12, 30]
      houseType: fieldForm.houseType, // [cite: 119]
      occupationSubCategory: fieldForm.subOccupation, // [cite: 58]
      assistanceType: fieldForm.assistanceType, // 
      inspectionDate: new Date().toISOString(), // [cite: 160]
      advisorId: currentAdvisor.id, // [cite: 168]
      verifiedByName: currentAdvisor.fullName, // [cite: 166]
      advisorComments: "LUC inspection completed at customer site. Data points verified[cite: 13]."
    };

    try {
      await fetch(`http://localhost:5000/loans/${selectedLoan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inspectionData)
      });
      alert(`Success: Field report for ${selectedLoan.customerName} sent to Accountant[cite: 152].`);
      setSelectedLoan(null);
      fetchData();
    } catch (err) {
      alert("Error submitting field report.");
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={headerStyles}>
        <h2 style={{ color: '#1e293b', margin: 0 }}>🏠 Field Verification Queue (LUC)</h2>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Logged in as: {currentAdvisor.fullName} [cite: 166]</p>
      </div>

      {loading ? (
        <div style={messageStyle}>Syncing field records...</div>
      ) : pendingLoans.length === 0 ? (
        <div style={emptyState}>
          <h3>No Pending Field Visits</h3>
          <p>Assignments appear when customers use your ID as Sponsor ID.</p>
        </div>
      ) : (
        <div style={tableContainer}>
          <table style={tableStyle}>
            <thead>
              <tr style={headerRow}>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>PEP/Disabled Status</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingLoans.map((loan) => (
                <tr key={loan.id} style={rowStyle}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 'bold' }}>{loan.customerName}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>ID: {loan.id}</div>
                  </td>
                  <td style={{ ...tdStyle, color: '#2563eb', fontWeight: 'bold' }}>
                    ₹{Number(loan.amount).toLocaleString()}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: '12px' }}>PEP: {loan.isPep} [cite: 125]</div>
                    <div style={{ fontSize: '12px' }}>Disabled: {loan.isDisabled} [cite: 131]</div>
                  </td>
                  <td style={tdStyle}>
                    <button onClick={() => setSelectedLoan(loan)} style={verifyBtn}>
                      Verify Field (LUC)
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- SOP VERIFICATION MODAL --- */}
      {selectedLoan && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3 style={{marginTop: 0}}>LUC Inspection Report [cite: 157]</h3>
            <form onSubmit={handleSOPSubmit}>
              <label style={labelStyle}>HOUSE TYPE </label>
              <select style={inputStyle} value={fieldForm.houseType} onChange={e => setFieldForm({...fieldForm, houseType: e.target.value})}>
                <option value="CONCRETE">CONCRETE [cite: 119]</option>
                <option value="KUTCHA">KUTCHA</option>
                <option value="TILED">TILED</option>
              </select>

              <label style={labelStyle}>SUB-OCCUPATION CATEGORY </label>
              <select style={inputStyle} required value={fieldForm.subOccupation} onChange={e => setFieldForm({...fieldForm, subOccupation: e.target.value})}>
                <option value="">-- Select Master Category --</option>
                <option value="AGRICULTURE">AGRICULTURE [cite: 59]</option>
                <option value="IT CONSULTANT">IT CONSULTANT [cite: 61]</option>
                <option value="TRADER">TRADER [cite: 61]</option>
                <option value="HOME MAKER">HOME MAKER [cite: 111]</option>
              </select>

              <label style={labelStyle}>ASSISTANCE TYPE (If disabled) </label>
              <select style={inputStyle} value={fieldForm.assistanceType} onChange={e => setFieldForm({...fieldForm, assistanceType: e.target.value})}>
                <option value="None">None</option>
                <option value="Attendant">Attendant [cite: 80]</option>
                <option value="Witness">Witness [cite: 83]</option>
                <option value="Thumb Impression">Thumb Impression [cite: 82]</option>
              </select>

              <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
                <button type="button" onClick={() => setSelectedLoan(null)} style={cancelBtn}>Cancel</button>
                <button type="submit" style={submitBtn}>Submit to Accountant</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SOP Compliant Styles ---
const headerStyles = { marginBottom: '25px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' };
const tableContainer = { background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const headerRow = { background: '#f8fafc', borderBottom: '2px solid #e2e8f0' };
const thStyle = { padding: '15px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' };
const tdStyle = { padding: '15px', fontSize: '13px', color: '#1e293b' };
const rowStyle = { borderBottom: '1px solid #f1f5f9' };
const verifyBtn = { background: '#065f46', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContent = { background: '#fff', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' };
const inputStyle = { width: '100%', padding: '12px', margin: '8px 0 15px 0', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' };
const labelStyle = { fontSize: '11px', fontWeight: 'bold', color: '#475569', display: 'block' };
const submitBtn = { flex: 1, padding: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const cancelBtn = { flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const emptyState = { textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '12px', color: '#94a3b8' };
const messageStyle = { textAlign: 'center', padding: '40px', color: '#64748b' };

export default AdvisorLoans;