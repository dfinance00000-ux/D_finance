import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

const RegisterCustomer = () => {
  const navigate = useNavigate();
  const officer = JSON.parse(localStorage.getItem('user')) || {};
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    password: '',
    email: '',
    address: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/signup', {
        ...formData,
        role: 'Customer',
        referredBy: officer.id 
      });

      if (res.data.success) {
        alert(`🎉 Success! Account Created.\nName: ${formData.fullName}\nLogin ID: ${formData.mobile}`);
        // Wapas dashboard par bhej do ya list par
        navigate('/officer/dashboard');
      }
    } catch (err) {
      alert("❌ Registration Error: " + (err.response?.data?.error || "Server Error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      <div style={formCard}>
        <button onClick={() => navigate(-1)} style={backBtn}>← Back to Portal</button>
        
        <div style={header}>
          <h2 style={{ margin: 0, fontWeight: '900', fontSize: '28px', color: '#0f172a' }}>NEW ONBOARDING</h2>
          <p style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Advisor: {officer.fullName} | Branch: Mathura
          </p>
        </div>

        <form onSubmit={handleSubmit} style={formGrid}>
          <div style={inputGroup}>
            <label style={label}>Full Name (As per Aadhar)</label>
            <input required style={input} type="text" placeholder="John Doe" 
              value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
          </div>

          <div style={inputGroup}>
            <label style={label}>Mobile Number (Primary)</label>
            <input required style={input} type="number" placeholder="98XXXXXXXX" 
              value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
          </div>

          <div style={inputGroup}>
            <label style={label}>Set Temporary Password</label>
            <input required style={input} type="text" placeholder="e.g. Pass@123" 
              value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>

          <div style={inputGroup}>
            <label style={label}>Email Address (Optional)</label>
            <input style={input} type="email" placeholder="customer@mail.com" 
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>

          <div style={{ ...inputGroup, gridColumn: 'span 2' }}>
            <label style={label}>Residential Area / Address</label>
            <textarea style={{ ...input, height: '80px', resize: 'none' }} placeholder="Village, Block, District..." 
              value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>

          <button type="submit" disabled={loading} style={submitBtn}>
            {loading ? 'REGISTERING...' : 'CREATE CUSTOMER ACCOUNT'}
          </button>
        </form>
      </div>

      <div style={sidebar}>
        <h4 style={{ color: '#0f172a', fontWeight: '900', marginBottom: '20px' }}>📌 INSTRUCTIONS</h4>
        <ul style={listStyle}>
          <li>✅ Mobile number will be the <b>Login ID</b>.</li>
          <li>✅ Note down the password for the customer.</li>
          <li>✅ Customer can apply for a loan immediately after login.</li>
          <li>✅ This account is automatically linked to your Advisor ID.</li>
        </ul>
      </div>
    </div>
  );
};

// --- Styles ---
const container = { display: 'flex', gap: '30px', padding: '40px', maxWidth: '1100px', margin: '0 auto', background: '#f8fafc', minHeight: '100vh', alignItems: 'flex-start' };
const formCard = { flex: '2', background: '#fff', padding: '40px', borderRadius: '40px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' };
const sidebar = { flex: '0.8', background: '#f0fdf4', padding: '30px', borderRadius: '40px', border: '1px solid #dcfce7', position: 'sticky', top: '20px' };
const header = { marginBottom: '35px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' };
const inputGroup = { marginBottom: '20px' };
const label = { display: 'block', fontSize: '10px', fontWeight: '900', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' };
const input = { width: '100%', padding: '16px', borderRadius: '16px', border: '1.5px solid #e2e8f0', fontSize: '14px', fontWeight: '700', outline: 'none', background: '#fcfcfc', boxSizing: 'border-box' };
const submitBtn = { gridColumn: 'span 2', padding: '20px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '20px', fontWeight: '900', fontSize: '14px', cursor: 'pointer', marginTop: '10px' };
const backBtn = { background: 'none', border: 'none', color: '#94a3b8', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', marginBottom: '20px' };
const listStyle = { padding: 0, listStyle: 'none', fontSize: '12px', color: '#475569', lineHeight: '2.5' };
const formGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' };

export default RegisterCustomer;