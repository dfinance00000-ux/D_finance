import React, { useState } from 'react';

const CustomerEntry = () => {
  const [formData, setFormData] = useState({
    fullName: '', mobile: '', email: '', dob: '',
    address: '', city: '', pincode: '',
    idType: 'Aadhaar', idNumber: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Customer ${formData.fullName} saved successfully (Demo Mode)`);
    console.log(formData);
  };

  const inputStyle = {
    width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', marginTop: '5px'
  };

  const labelStyle = {
    fontSize: '13px', fontWeight: 'bold', color: '#475569'
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ background: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        <h2 style={{ marginBottom: '25px', color: '#1e293b', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
          👤 New Customer Enrollment
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Section 1: Basic Info */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input type="text" required style={inputStyle} value={formData.fullName} 
                onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
            </div>
            <div>
              <label style={labelStyle}>Mobile Number *</label>
              <input type="number" required style={inputStyle} value={formData.mobile}
                onChange={(e) => setFormData({...formData, mobile: e.target.value})} />
            </div>
            <div>
              <label style={labelStyle}>Email ID</label>
              <input type="email" style={inputStyle} value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <label style={labelStyle}>Date of Birth</label>
              <input type="date" style={inputStyle} value={formData.dob}
                onChange={(e) => setFormData({...formData, dob: e.target.value})} />
            </div>
          </div>

          {/* Section 2: Address */}
          <h4 style={{ color: '#3b82f6', marginBottom: '15px' }}>📍 Address Details</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div>
              <label style={labelStyle}>Full Address</label>
              <input type="text" style={inputStyle} value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})} />
            </div>
            <div>
              <label style={labelStyle}>City</label>
              <input type="text" style={inputStyle} value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})} />
            </div>
            <div>
              <label style={labelStyle}>Pincode</label>
              <input type="number" style={inputStyle} value={formData.pincode}
                onChange={(e) => setFormData({...formData, pincode: e.target.value})} />
            </div>
          </div>

          {/* Section 3: KYC */}
          <h4 style={{ color: '#3b82f6', marginBottom: '15px' }}>🆔 KYC Verification</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div>
              <label style={labelStyle}>ID Proof Type</label>
              <select style={inputStyle} value={formData.idType} 
                onChange={(e) => setFormData({...formData, idType: e.target.value})}>
                <option>Aadhaar Card</option>
                <option>PAN Card</option>
                <option>Voter ID</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>ID Number</label>
              <input type="text" style={inputStyle} value={formData.idNumber}
                onChange={(e) => setFormData({...formData, idNumber: e.target.value})} />
            </div>
          </div>

          <button type="submit" style={{ 
            width: '100%', padding: '15px', background: '#10b981', color: '#fff', 
            border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' 
          }}>
            ✅ Register Customer & Create Ledger
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerEntry;