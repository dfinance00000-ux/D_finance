import React, { useState } from 'react';
import { 
  FiUser, FiPhone, FiMail, FiCalendar, FiMapPin, 
  FiCreditCard, FiCheckCircle, FiUploadCloud, FiArrowRight 
} from 'react-icons/fi';

const CustomerEntry = () => {
  const [formData, setFormData] = useState({
    fullName: '', mobile: '', email: '', dob: '',
    address: '', city: '', pincode: '',
    idType: 'Aadhaar', idNumber: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Yahan aap apni API call (axios) daal sakte hain
    setTimeout(() => {
      alert(`🎉 Customer ${formData.fullName} has been successfully registered in the Atlas Registry!`);
      console.log("Registered Data:", formData);
      setIsSubmitting(false);
      // Optional: Form reset
      setFormData({
        fullName: '', mobile: '', email: '', dob: '',
        address: '', city: '', pincode: '',
        idType: 'Aadhaar', idNumber: ''
      });
    }, 1500);
  };

  return (
    <div style={containerStyle}>
      <div style={formCard}>
        
        {/* --- HEADER SECTION --- */}
        <div style={headerStyle}>
          <div style={iconBox}><FiUser size={24} color="#fff"/></div>
          <div>
            <h2 style={titleStyle}>Customer Enrollment</h2>
            <p style={subTitleStyle}>Create new financial ledger & KYC profile</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* --- SECTION 1: PERSONAL DETAILS --- */}
          <div style={sectionHeader}>
            <FiUser color="#2563eb" /> <span>Basic Information</span>
          </div>
          <div style={grid3}>
            <div style={inputGroup}>
              <label style={labelStyle}>Full Name *</label>
              <div style={inputWrapper}>
                <FiUser style={fieldIcon} />
                <input type="text" required style={inputStyle} placeholder="John Doe" 
                  value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
              </div>
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Mobile Number *</label>
              <div style={inputWrapper}>
                <FiPhone style={fieldIcon} />
                <input type="number" required style={inputStyle} placeholder="9876543210"
                  value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} />
              </div>
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Email ID</label>
              <div style={inputWrapper}>
                <FiMail style={fieldIcon} />
                <input type="email" style={inputStyle} placeholder="john@example.com"
                  value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Date of Birth</label>
              <div style={inputWrapper}>
                <FiCalendar style={fieldIcon} />
                <input type="date" style={inputStyle} 
                  value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} />
              </div>
            </div>
          </div>

          {/* --- SECTION 2: ADDRESS --- */}
          <div style={{...sectionHeader, marginTop: '30px'}}>
            <FiMapPin color="#2563eb" /> <span>Communication Address</span>
          </div>
          <div style={gridAddress}>
            <div style={inputGroup}>
              <label style={labelStyle}>Full House/Street Address</label>
              <input type="text" style={inputStyle} placeholder="Flat no, Building name, Area"
                value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>City</label>
              <input type="text" style={inputStyle} placeholder="Mathura"
                value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>Pincode</label>
              <input type="number" style={inputStyle} placeholder="281001"
                value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} />
            </div>
          </div>

          {/* --- SECTION 3: KYC --- */}
          <div style={{...sectionHeader, marginTop: '30px'}}>
            <FiCreditCard color="#2563eb" /> <span>KYC & Identification</span>
          </div>
          <div style={grid2}>
            <div style={inputGroup}>
              <label style={labelStyle}>ID Proof Type</label>
              <select style={inputStyle} value={formData.idType} 
                onChange={(e) => setFormData({...formData, idType: e.target.value})}>
                <option>Aadhaar Card</option>
                <option>PAN Card</option>
                <option>Voter ID</option>
                <option>Driving License</option>
              </select>
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>ID Number (Last 4 or Full)</label>
              <input type="text" style={inputStyle} placeholder="XXXX-XXXX-XXXX"
                value={formData.idNumber} onChange={(e) => setFormData({...formData, idNumber: e.target.value})} />
            </div>
          </div>

          {/* --- SUBMIT BUTTON --- */}
          <button type="submit" disabled={isSubmitting} style={isSubmitting ? {...btnStyle, opacity: 0.7} : btnStyle}>
            {isSubmitting ? 'Processing Enrollment...' : (
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
                <FiCheckCircle /> Register & Generate Ledger <FiArrowRight />
              </div>
            )}
          </button>
        </form>

        <p style={footerNote}>* Ensure all KYC documents are physically verified before submission.</p>
      </div>
    </div>
  );
};

// --- STYLES (Modern & Professional) ---
const containerStyle = { padding: '40px 20px', background: '#f8fafc', minHeight: '100vh', fontFamily: '"Inter", sans-serif' };
const formCard = { maxWidth: '900px', margin: '0 auto', background: '#fff', padding: '40px', borderRadius: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' };
const headerStyle = { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' };
const iconBox = { width: '50px', height: '50px', background: '#2563eb', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)' };
const titleStyle = { margin: 0, fontSize: '24px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' };
const subTitleStyle = { margin: 0, fontSize: '13px', color: '#64748b', fontWeight: '500' };

const sectionHeader = { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: '#2563eb', letterSpacing: '1px', marginBottom: '20px' };

const grid3 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '25px' };
const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' };
const gridAddress = { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '25px' };

const inputGroup = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { fontSize: '12px', fontWeight: '700', color: '#475569', marginLeft: '2px' };
const inputWrapper = { position: 'relative', display: 'flex', alignItems: 'center' };
const fieldIcon = { position: 'absolute', left: '15px', color: '#94a3b8' };

const inputStyle = { 
  width: '100%', padding: '14px 15px', paddingLeft: '45px', borderRadius: '14px', 
  border: '1.5px solid #e2e8f0', outline: 'none', background: '#f8fafc', 
  fontSize: '14px', fontWeight: '600', transition: '0.3s focus' 
};

const btnStyle = { 
  marginTop: '40px', width: '100%', padding: '18px', background: '#0f172a', color: '#fff', 
  border: 'none', borderRadius: '18px', fontWeight: '800', fontSize: '15px', 
  cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', transition: '0.3s' 
};

const footerNote = { textAlign: 'center', marginTop: '20px', fontSize: '11px', color: '#94a3b8', fontWeight: '600' };

export default CustomerEntry;