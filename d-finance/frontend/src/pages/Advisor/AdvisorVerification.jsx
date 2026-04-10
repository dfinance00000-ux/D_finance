import React, { useState, useEffect, useCallback, useRef } from 'react';
import API from '../../api/axios';
import { 
  FiCamera, FiUpload, FiX, FiCheckCircle, FiUser, 
  FiHome, FiShield, FiBriefcase, FiCreditCard 
} from 'react-icons/fi';

const AdvisorVerification = () => {
  const [myPendingLoans, setMyPendingLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);
  
  // --- Sabse Detailed Form State (Max Info) ---
  const [fieldForm, setFieldForm] = useState({
    // 1. Religion & Social
    religion: 'HINDU', category: 'GENERAL', education: 'GRADUATE',
    
    // 2. Residence & Area
    residenceNature: 'Own', houseType: 'CONCRETE', areaType: 'RURAL',
    
    // 3. Economy
    vehicle: 'Yes', vehicleType: 'TWO WHEELER', familyIncomeActivity: 'Business',
    monthlyIncome: '', expenditure: '', financialInclusion: [],
    
    // 4. Detailed Nominee Info (As requested)
    nomineeName: '', 
    nomineeDOB: '', 
    nomineeGender: 'MALE',
    nomineeMobile: '', 
    nomineeRelation: 'SPOUSE', 
    nomineeAddress: '',
    nomineeCategory: 'GENERAL',

    // 5. Digital Documents (Front & Back)
    nomineePic: '', 
    aadhaarFront: '', 
    aadhaarBack: '',
    secondaryIdFront: '', 
    secondaryIdBack: '' 
  });

  const currentAdvisor = JSON.parse(localStorage.getItem('user')) || {};

  const fetchMyRequests = useCallback(async () => {
    if (!currentAdvisor.id && !currentAdvisor._id) return;
    setLoading(true);
    try {
      const res = await API.get(`/loans?status=Verification Pending&sponsorId=${currentAdvisor.id || currentAdvisor._id}`);
      setMyPendingLoans(res.data.reverse());
    } catch (err) { 
      console.error("Fetch error:", err); 
    } finally { 
      setLoading(false); 
    }
  }, [currentAdvisor.id, currentAdvisor._id]);

  useEffect(() => { fetchMyRequests(); }, [fetchMyRequests]);

  // --- Image Handler (Camera/Gallery) ---
  const handleImageInput = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFieldForm(prev => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSOPSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const finalPayload = {
      ...fieldForm,
      status: "Field Verified",
      inspectionDate: new Date().toISOString(),
      advisorId: currentAdvisor.id || currentAdvisor._id,
      verifiedByName: currentAdvisor.fullName,
    };

    try {
      await API.patch(`/loans/${selectedLoan._id || selectedLoan.id}`, finalPayload);
      alert("🚀 LUC Intelligence Report Submitted Successfully!");
      setSelectedLoan(null);
      fetchMyRequests();
    } catch (err) {
      alert("❌ Submission Failed. Check server logs.");
    } finally { setLoading(false); }
  };

  return (
    <div style={containerStyle}>
      <style>{responsiveCSS}</style>
      
      <div style={headerSection}>
        <h2 style={mainTitle}>🏠 FIELD AUDIT & LUC TERMINAL</h2>
        <p style={subTitle}>Authorized Officer: <b>{currentAdvisor?.fullName}</b></p>
      </div>
      
      {loading && !selectedLoan ? (
        <div style={statusMsg}>🔄 Accessing Secure Nodes...</div>
      ) : myPendingLoans.length === 0 ? (
        <div style={emptyState}>No Pending Field Assignments.</div>
      ) : (
        <div className="card-grid" style={gridContainer}>
          {myPendingLoans.map(loan => (
            <div key={loan._id} style={verifyCard}>
              <div style={cardBadge}>LUC PENDING</div>
              <h4 style={custName}>{loan.customerName}</h4>
              <p style={loanAmt}>₹{loan.amount.toLocaleString()}</p>
              <button onClick={() => setSelectedLoan(loan)} style={verifyBtn}>Start Field Inspection</button>
            </div>
          ))}
        </div>
      )}

      {selectedLoan && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={modalHeader}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>LUC: {selectedLoan.customerName}</h3>
              <FiX onClick={() => setSelectedLoan(null)} style={{cursor:'pointer'}} />
            </div>
            
            <form onSubmit={handleSOPSubmit} style={formScroll}>
              
              {/* --- SECTION: NOMINEE --- */}
              <h4 style={sectionTitle}><FiUser /> Nominee Comprehensive Details</h4>
              <div className="resp-grid" style={formGrid}>
                <div style={inputGroup}>
                   <label style={labelStyle}>Nominee Full Name</label>
                   <input required style={inputStyle} value={fieldForm.nomineeName} onChange={e => setFieldForm({...fieldForm, nomineeName: e.target.value})} />
                </div>
                <div style={inputGroup}>
                   <label style={labelStyle}>Date of Birth</label>
                   <input type="date" required style={inputStyle} value={fieldForm.nomineeDOB} onChange={e => setFieldForm({...fieldForm, nomineeDOB: e.target.value})} />
                </div>
                <div style={inputGroup}>
                   <label style={labelStyle}>Gender</label>
                   <select style={inputStyle} value={fieldForm.nomineeGender} onChange={e => setFieldForm({...fieldForm, nomineeGender: e.target.value})}>
                      <option>MALE</option><option>FEMALE</option><option>OTHER</option>
                   </select>
                </div>
                <div style={inputGroup}>
                   <label style={labelStyle}>Nominee Category</label>
                   <select style={inputStyle} value={fieldForm.nomineeCategory} onChange={e => setFieldForm({...fieldForm, nomineeCategory: e.target.value})}>
                      <option>GENERAL</option><option>OBC</option><option>SC</option><option>ST</option>
                   </select>
                </div>
                <div style={inputGroup}>
                   <label style={labelStyle}>Relationship</label>
                   <select style={inputStyle} value={fieldForm.nomineeRelation} onChange={e => setFieldForm({...fieldForm, nomineeRelation: e.target.value})}>
                      <option>SPOUSE</option><option>FATHER</option><option>MOTHER</option><option>SON</option><option>DAUGHTER</option><option>BROTHER</option>
                   </select>
                </div>
                <div style={inputGroup}>
                   <label style={labelStyle}>Mobile Number</label>
                   <input type="number" required style={inputStyle} value={fieldForm.nomineeMobile} onChange={e => setFieldForm({...fieldForm, nomineeMobile: e.target.value})} />
                </div>
              </div>
              <div style={inputGroup}>
                  <label style={labelStyle}>Permanent Address</label>
                  <input style={inputStyle} value={fieldForm.nomineeAddress} onChange={e => setFieldForm({...fieldForm, nomineeAddress: e.target.value})} />
              </div>

              {/* --- SECTION: DOCUMENTS --- */}
              <h4 style={sectionTitle}><FiCreditCard /> Digital Evidence Capture (Front & Back)</h4>
              <div className="doc-resp-grid" style={docGrid}>
                <CaptureBox label="Nominee Live Photo" field="nomineePic" value={fieldForm.nomineePic} onInput={handleImageInput} />
                <CaptureBox label="Aadhaar Front" field="aadhaarFront" value={fieldForm.aadhaarFront} onInput={handleImageInput} />
                <CaptureBox label="Aadhaar Back" field="aadhaarBack" value={fieldForm.aadhaarBack} onInput={handleImageInput} />
                <CaptureBox label="Voter/PAN Front" field="secondaryIdFront" value={fieldForm.secondaryIdFront} onInput={handleImageInput} />
                <CaptureBox label="Voter/PAN Back" field="secondaryIdBack" value={fieldForm.secondaryIdBack} onInput={handleImageInput} />
              </div>

              {/* --- SECTION: SOCIO-ECONOMIC --- */}
              <h4 style={sectionTitle}><FiBriefcase /> Socio-Economic Survey</h4>
              <div className="resp-grid" style={formGrid}>
                <div style={inputGroup}>
                   <label style={labelStyle}>House Type</label>
                   <select style={inputStyle} value={fieldForm.houseType} onChange={e => setFieldForm({...fieldForm, houseType: e.target.value})}>
                      <option>CONCRETE</option><option>KUTCHA</option><option>TILED</option><option>HUT</option>
                   </select>
                </div>
                <div style={inputGroup}>
                   <label style={labelStyle}>Area Nature</label>
                   <select style={inputStyle} value={fieldForm.areaType} onChange={e => setFieldForm({...fieldForm, areaType: e.target.value})}>
                      <option>RURAL</option><option>URBAN</option><option>SEMI-URBAN</option>
                   </select>
                </div>
                <div style={inputGroup}>
                   <label style={labelStyle}>Verified Monthly Income</label>
                   <input type="number" required style={inputStyle} placeholder="₹" value={fieldForm.monthlyIncome} onChange={e => setFieldForm({...fieldForm, monthlyIncome: e.target.value})} />
                </div>
                <div style={inputGroup}>
                   <label style={labelStyle}>Income Activity</label>
                   <input style={inputStyle} placeholder="e.g. Shop, Farming" value={fieldForm.familyIncomeActivity} onChange={e => setFieldForm({...fieldForm, familyIncomeActivity: e.target.value})} />
                </div>
              </div>

              <div style={footerAction}>
                <button type="button" onClick={() => setSelectedLoan(null)} style={cancelBtn}>DISCARD</button>
                <button type="submit" disabled={loading} style={submitBtn}>
                  {loading ? 'SYNCING DATA...' : 'COMPLETE VERIFICATION'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Helper Component for Camera + Gallery ---
const CaptureBox = ({ label, field, value, onInput }) => {
  const galRef = useRef(null);
  const camRef = useRef(null);

  return (
    <div style={upBox}>
      <label style={miniLabel}>{label}</label>
      <div style={btnRow}>
        <button type="button" onClick={() => galRef.current.click()} style={smBtn}>Gallery</button>
        <button type="button" onClick={() => camRef.current.click()} style={smBtnPrimary}>Camera</button>
      </div>

      <input type="file" ref={galRef} hidden accept="image/*" onChange={(e) => onInput(e, field)} />
      <input type="file" ref={camRef} hidden accept="image/*" capture="environment" onChange={(e) => onInput(e, field)} />

      {value && (
        <div style={prevContainer}>
          <img src={value} style={imgPrev} alt="preview" />
          <div style={doneBadge}><FiCheckCircle /> Captured</div>
        </div>
      )}
    </div>
  );
};

// --- Styles ---
const containerStyle = { padding: '20px', minHeight: '100vh', background: '#f8fafc', fontFamily: 'sans-serif' };
const headerSection = { marginBottom: '25px', borderBottom: '2.5px solid #e2e8f0', paddingBottom: '15px' };
const mainTitle = { color: '#0f172a', margin: 0, fontWeight: '900', fontSize: '20px' };
const subTitle = { color: '#64748b', fontSize: '12px', marginTop: '5px' };

const gridContainer = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' };
const verifyCard = { background: '#fff', padding: '25px', borderRadius: '25px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' };
const cardBadge = { background: '#fef3c7', padding: '4px 10px', borderRadius: '8px', fontSize: '9px', fontWeight: '950', color: '#92400e', display: 'inline-block' };
const custName = { margin: '15px 0 5px 0', fontSize: '18px', fontWeight: '800', color: '#1e293b' };
const loanAmt = { fontSize: '24px', fontWeight: '900', color: '#059669', marginBottom: '15px' };
const verifyBtn = { width: '100%', padding: '14px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' };

const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(10px)', padding: '10px' };
const modalContent = { background: '#fff', borderRadius: '30px', width: '100%', maxWidth: '700px', maxHeight: '92vh', overflow: 'hidden' };
const modalHeader = { background: '#0f172a', color: '#fff', padding: '20px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const formScroll = { padding: '20px 25px', overflowY: 'auto', maxHeight: '78vh' };
const sectionTitle = { fontSize: '11px', fontWeight: '900', color: '#2563eb', margin: '25px 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', borderLeft: '4px solid #2563eb', paddingLeft: '10px' };

const formGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '5px' };
const labelStyle = { fontSize: '9px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase' };
const inputStyle = { padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', fontWeight: '600', outline: 'none' };

const docGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' };
const upBox = { background: '#f1f5f9', padding: '12px', borderRadius: '20px', border: '1px solid #e2e8f0' };
const miniLabel = { fontSize: '9px', fontWeight: '900', color: '#475569', marginBottom: '8px', display: 'block' };
const btnRow = { display: 'flex', gap: '5px', marginBottom: '10px' };
const smBtn = { flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '10px', fontWeight: '800', cursor: 'pointer' };
const smBtnPrimary = { ...smBtn, background: '#0f172a', color: '#fff', border: 'none' };
const prevContainer = { position: 'relative' };
const imgPrev = { width: '100%', height: '120px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #fff' };
const doneBadge = { position: 'absolute', bottom: '5px', right: '5px', background: '#059669', color: '#fff', fontSize: '8px', padding: '3px 8px', borderRadius: '8px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '3px' };

const footerAction = { display: 'flex', gap: '10px', marginTop: '30px', paddingBottom: '20px' };
const submitBtn = { flex: 2, padding: '16px', background: '#059669', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: '900', cursor: 'pointer' };
const cancelBtn = { flex: 1, padding: '16px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '15px', fontWeight: '900', cursor: 'pointer' };
const statusMsg = { textAlign: 'center', padding: '50px', color: '#94a3b8', fontWeight: 'bold' };
const emptyState = { textAlign: 'center', padding: '60px', color: '#cbd5e1', fontWeight: '800', background: '#fff', borderRadius: '25px' };

const responsiveCSS = `
  @media (max-width: 600px) {
    .resp-grid { grid-template-columns: 1fr !important; }
    .doc-resp-grid { grid-template-columns: 1fr !important; }
    .card-grid { grid-template-columns: 1fr !important; }
  }
`;

export default AdvisorVerification;