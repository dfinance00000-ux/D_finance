import React, { useState, useEffect, useCallback, useRef } from 'react';
import API from '../../api/axios';
import { 
  FiCamera, FiUpload, FiX, FiCheckCircle, FiUser, 
  FiHome, FiShield, FiBriefcase, FiCreditCard, FiMapPin, FiInfo, FiUsers, FiPhone
} from 'react-icons/fi';

const AdvisorVerification = () => {
  const [myPendingLoans, setMyPendingLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [addressName, setAddressName] = useState('Detecting location...');
  
  const [fieldForm, setFieldForm] = useState({
    // 1. Residence & Social
    religion: 'HINDU', 
    category: 'GENERAL', 
    houseType: 'CONCRETE', // Fixed: Default value set
    areaType: 'RURAL',     // Fixed: Default value set
    residenceNature: 'Owned',
    
    // 2. Economy & Income
    monthlyIncome: '', 
    expenditure: '', 
    familyIncomeActivities: 'Business',
    memberOccupation: '', 

    // 3. Nominee Info
    nomineeName: '', nomineeDOB: '', nomineeAge: '', nomineeGender: 'MALE',
    nomineeUID: '', nomineeVoterId: '', nomineeMobile: '', 
    nomineeRelation: 'SPOUSE', nomineeAddress: '', nomineeCategory: 'GENERAL',

    // 4. Digital Documents (KYC)
    nomineePic: '', 
    custLivePhoto: '', // Required for Accountant View
    aadhaarFront: '', 
    aadhaarBack: '',
    secondaryIdFront: '', 
    secondaryIdBack: '',
    memberSignature: '',

    // 5. Auto-filled / Fetched Fields
    ifscCode: '', 
    bankAccountNumber: '', 
    confirmAccountNumber: '',
    accountHolderName: '', 
    customerMobile: '', // Fetching from user/loan record
    loanId: '',         // Fetching from loan record
    customerId: '',     // Fetching from loan record

    // 6. System
    locationName: ''
  });

  const currentAdvisor = JSON.parse(localStorage.getItem('user')) || {};

  // Reverse Geocoding to get Address
  const getPlaceName = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      const place = data.display_name || "Location Captured";
      setAddressName(place);
      setFieldForm(prev => ({ ...prev, locationName: place }));
    } catch (error) {
      setAddressName("Location captured (Address fetch failed)");
    }
  };

  const handleOpenForm = (loan) => {
    setSelectedLoan(loan);
    // 🚀 Critical: Fetching ID and Phone data into form state
    setFieldForm(prev => ({
      ...prev,
      accountHolderName: loan.accountHolderName || '',
      ifscCode: loan.ifscCode || '',
      bankAccountNumber: loan.accountNumber || '',
      confirmAccountNumber: loan.accountNumber || '',
      customerMobile: loan.customerMobile || loan.mobile || '', // Fetch Mobile
      loanId: loan.loanId || '',                                // Fetch Loan ID
      customerId: loan.customerId || '',                        // Fetch Cust ID
      houseType: loan.houseType || 'CONCRETE',
      areaType: loan.areaType || 'RURAL'
    }));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        getPlaceName(pos.coords.latitude, pos.coords.longitude);
      });
    }
  };

  const fetchMyRequests = useCallback(async () => {
    if (!currentAdvisor.id && !currentAdvisor._id) return;
    setLoading(true);
    try {
      const res = await API.get(`/loans?status=Verification Pending&sponsorId=${currentAdvisor.id || currentAdvisor._id}`);
      setMyPendingLoans(res.data.reverse());
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  }, [currentAdvisor.id, currentAdvisor._id]);

  useEffect(() => { fetchMyRequests(); }, [fetchMyRequests]);

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
      verifiedByName: currentAdvisor.fullName
    };

    try {
      await API.patch(`/loans/${selectedLoan._id || selectedLoan.id}`, finalPayload);
      alert("✅ Data & KYC Evidence Synced to Mainframe!");
      setSelectedLoan(null);
      fetchMyRequests();
    } catch (err) { alert("❌ Submission Failed."); } 
    finally { setLoading(false); }
  };

  return (
    <div style={containerStyle}>
      <style>{responsiveCSS}</style>
      <div style={headerSection}>
        <h2 style={mainTitle}>🛡️ FIELD AUDIT & KYC TERMINAL</h2>
        <p style={subTitle}>Officer: <b>{currentAdvisor?.fullName}</b></p>
      </div>
      
      {!selectedLoan ? (
        loading ? <div style={statusMsg}>🔄 Connecting to Secure Node...</div> :
        <div className="card-grid" style={gridContainer}>
          {myPendingLoans.map(loan => (
            <div key={loan._id} style={verifyCard}>
              <div style={cardBadge}>LUC PENDING</div>
              <h4 style={custName}>{loan.customerName}</h4>
              <p style={loanAmt}>₹{loan.amount.toLocaleString()}</p>
              <div style={miniInfo}>ID: {loan.loanId}</div>
              <button onClick={() => handleOpenForm(loan)} style={verifyBtn}>Conduct Field Visit</button>
            </div>
          ))}
        </div>
      ) : (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={modalHeader}>
              <div>
                 <span style={{fontSize:'10px', textTransform:'uppercase'}}>Audit Process for</span>
                 <h3 style={{ margin: 0 }}>{selectedLoan.customerName}</h3>
                 <span style={{fontSize:'10px'}}>UID: {fieldForm.customerId} | Loan: {fieldForm.loanId}</span>
              </div>
              <FiX onClick={() => setSelectedLoan(null)} style={{cursor:'pointer', fontSize:'22px'}} />
            </div>
            
            <form onSubmit={handleSOPSubmit} style={formScroll}>
              
              {/* TOP INFO BAR */}
              <div style={dataInfoBar}>
                <div style={infoItem}><FiPhone size={12}/> {fieldForm.customerMobile}</div>
                <div style={infoItem}><b>EMI:</b> ₹{selectedLoan.installmentAmount}</div>
                <div style={infoItem}><b>Type:</b> {selectedLoan.type}</div>
              </div>

              {/* 1. RESIDENTIAL & AREA */}
              <h4 style={sectionTitle}><FiHome /> 1. Residential & Area Profile</h4>
              <div className="resp-grid" style={formGrid}>
                <SelectField label="House Type *" options={['CONCRETE', 'KUTCHA', 'TILED', 'HUT']} value={fieldForm.houseType} onChange={v => setFieldForm({...fieldForm, houseType: v})} />
                <SelectField label="Area Type *" options={['RURAL', 'URBAN', 'SEMI-URBAN']} value={fieldForm.areaType} onChange={v => setFieldForm({...fieldForm, areaType: v})} />
                <InputField label="Verified Monthly Income *" type="number" value={fieldForm.monthlyIncome} onChange={v => setFieldForm({...fieldForm, monthlyIncome: v})} />
                <InputField label="Monthly Expenditure *" type="number" value={fieldForm.expenditure} onChange={v => setFieldForm({...fieldForm, expenditure: v})} />
              </div>

              {/* 2. NOMINEE */}
              <h4 style={sectionTitle}><FiUsers /> 2. Nominee Information</h4>
              <div className="resp-grid" style={formGrid}>
                <InputField label="Nominee Name" value={fieldForm.nomineeName} onChange={v => setFieldForm({...fieldForm, nomineeName: v})} />
                <InputField label="Nominee Mobile" type="number" value={fieldForm.nomineeMobile} onChange={v => setFieldForm({...fieldForm, nomineeMobile: v})} />
                <InputField label="Aadhar Redacted" value="[Aadhaar Redacted]" readOnly />
                <SelectField label="Relationship" options={['SPOUSE', 'FATHER', 'MOTHER', 'SON', 'DAUGHTER', 'BROTHER']} value={fieldForm.nomineeRelation} onChange={v => setFieldForm({...fieldForm, nomineeRelation: v})} />
              </div>

              {/* 3. KYC EVIDENCE */}
              <h4 style={sectionTitle}><FiCamera /> 3. Digital KYC Vault (Required)</h4>
              <div className="doc-resp-grid" style={docGrid}>
                <CaptureBox label="Customer Photo *" field="custLivePhoto" value={fieldForm.custLivePhoto} onInput={handleImageInput} />
                <CaptureBox label="Aadhar Front *" field="aadhaarFront" value={fieldForm.aadhaarFront} onInput={handleImageInput} />
                <CaptureBox label="Aadhar Back *" field="aadhaarBack" value={fieldForm.aadhaarBack} onInput={handleImageInput} />
                <CaptureBox label="Secondary ID Back *" field="secondaryIdBack" value={fieldForm.secondaryIdBack} onInput={handleImageInput} />
                <CaptureBox label="Signature *" field="memberSignature" value={fieldForm.memberSignature} onInput={handleImageInput} />
                <CaptureBox label="Nominee Photo *" field="nomineePic" value={fieldForm.nomineePic} onInput={handleImageInput} />
              </div>

              {/* 4. BANK (READ ONLY) */}
              <h4 style={sectionTitle}><FiShield /> 4. Settlement Bank Account</h4>
              <div className="resp-grid" style={formGrid}>
                <InputField label="A/C Holder" value={fieldForm.accountHolderName} readOnly />
                <InputField label="IFSC Code" value={fieldForm.ifscCode} readOnly />
                <InputField label="A/C Number" value={fieldForm.bankAccountNumber} readOnly />
              </div>

              {/* 5. LOCATION NAME */}
              <div style={locationBox}>
                <FiMapPin style={{fontSize: '18px'}} /> 
                <div style={{display:'flex', flexDirection:'column'}}>
                    <span style={{fontSize:'10px', opacity:0.7, textTransform:'uppercase'}}>Verified Audit Location:</span>
                    <span style={{fontSize:'13px'}}>{addressName}</span>
                </div>
              </div>

              <div style={footerAction}>
                <button type="button" onClick={() => setSelectedLoan(null)} style={cancelBtn}>DISCARD</button>
                <button type="submit" disabled={loading} style={submitBtn}>
                  {loading ? 'SYNCING...' : 'FINALIZE KYC & AUDIT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub Components ---
const InputField = ({ label, type = "text", value, onChange, readOnly = false }) => (
  <div style={inputGroup}>
    <label style={labelStyle}>{label}</label>
    <input required={!readOnly} type={type} style={{...inputStyle, background: readOnly ? '#f1f5f9' : '#fff'}} value={value} readOnly={readOnly} onChange={e => onChange && onChange(e.target.value)} />
  </div>
);

const SelectField = ({ label, options, value, onChange }) => (
  <div style={inputGroup}>
    <label style={labelStyle}>{label}</label>
    <select style={inputStyle} value={value} onChange={e => onChange(e.target.value)}>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const CaptureBox = ({ label, field, value, onInput }) => {
  const fileRef = useRef(null);
  const camRef = useRef(null);
  return (
    <div style={upBox}>
      <label style={miniLabel}>{label}</label>
      <div style={btnRow}>
        <button type="button" onClick={() => fileRef.current.click()} style={smBtn}>Gallery</button>
        <button type="button" onClick={() => camRef.current.click()} style={smBtnPrimary}>Camera</button>
      </div>
      <input type="file" ref={fileRef} hidden accept="image/*" onChange={(e) => onInput(e, field)} />
      <input type="file" ref={camRef} hidden accept="image/*" capture="environment" onChange={(e) => onInput(e, field)} />
      {value && <img src={value} style={imgPrev} alt="preview" />}
    </div>
  );
};

// --- Styles ---
const containerStyle = { padding: '20px', minHeight: '100vh', background: '#f8fafc', fontFamily: 'sans-serif' };
const headerSection = { marginBottom: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px' };
const mainTitle = { color: '#0f172a', margin: 0, fontWeight: '900', fontSize: '22px' };
const subTitle = { color: '#64748b', fontSize: '14px' };
const gridContainer = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' };
const verifyCard = { background: '#fff', padding: '20px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' };
const cardBadge = { background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' };
const custName = { margin: '10px 0', fontSize: '17px', fontWeight: '800' };
const loanAmt = { fontSize: '22px', fontWeight: '900', color: '#2563eb', marginBottom: '15px' };
const miniInfo = { fontSize: '11px', color: '#94a3b8', marginBottom: '15px' };
const verifyBtn = { width: '100%', padding: '12px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold' };

const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '10px' };
const modalContent = { background: '#fff', borderRadius: '30px', width: '100%', maxWidth: '750px', maxHeight: '95vh', overflow: 'hidden' };
const modalHeader = { background: '#0f172a', color: '#fff', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const formScroll = { padding: '25px', overflowY: 'auto', maxHeight: '80vh' };

const dataInfoBar = { background: '#f1f5f9', padding: '12px', borderRadius: '12px', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' };
const infoItem = { fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'center', gap: '5px' };

const sectionTitle = { fontSize: '11px', fontWeight: '900', color: '#2563eb', marginBottom: '15px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' };
const formGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '5px' };
const labelStyle = { fontSize: '10px', fontWeight: '800', color: '#64748b' };
const inputStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' };

const docGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '20px' };
const upBox = { background: '#f8fafc', padding: '10px', borderRadius: '15px', border: '1px solid #e2e8f0' };
const miniLabel = { fontSize: '9px', fontWeight: '800', marginBottom: '5px', display: 'block' };
const btnRow = { display: 'flex', gap: '5px' };
const smBtn = { flex: 1, padding: '6px', fontSize: '9px', borderRadius: '5px', border: '1px solid #cbd5e1', background: '#fff' };
const smBtnPrimary = { ...smBtn, background: '#0f172a', color: '#fff', border: 'none' };
const imgPrev = { width: '100%', height: '70px', objectFit: 'cover', borderRadius: '8px', marginTop: '8px' };

const locationBox = { background: '#f0f9ff', padding: '12px', borderRadius: '12px', color: '#0369a1', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' };
const footerAction = { display: 'flex', gap: '10px', marginTop: '30px' };
const submitBtn = { flex: 2, padding: '15px', background: '#059669', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold' };
const cancelBtn = { flex: 1, padding: '15px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '12px', fontWeight: 'bold' };
const statusMsg = { textAlign: 'center', marginTop: '100px', color: '#94a3b8' };

const responsiveCSS = `
  @media (max-width: 600px) {
    .resp-grid { grid-template-columns: 1fr !important; }
    .card-grid { grid-template-columns: 1fr !important; }
    .doc-resp-grid { grid-template-columns: 1fr 1fr !important; }
  }
`;

export default AdvisorVerification;