import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signupUser } from "../../api/authApi"; // Ensure this path is correct

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    password: '',
    role: 'Customer', // Default role
    referredBy: ''    // Optional Advisor Code
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Data cleaning: Email ko trim aur lower case karna
      const finalData = {
        ...formData,
        email: formData.email.toLowerCase().trim()
      };

      const res = await signupUser(finalData);
      
      if (res.data.success || res.status === 201) {
        alert("Registration Successful! Now please login.");
        navigate('/login');
      }
    } catch (err) {
      // Backend error handling
      const msg = err.response?.data?.error || "Registration Failed. Mobile might already exist.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <h2 style={{ color: '#2563eb', margin: 0, fontWeight: '900', letterSpacing: '-1px' }}>D-FINANCE</h2>
          <p style={subHeader}>Create Your Cloud Account</p>
        </div>

        <form onSubmit={handleSignup}>
          {/* Full Name */}
          <div style={inputGroup}>
            <label style={labelStyle}>Full Name</label>
            <input 
              type="text" 
              name="fullName"
              placeholder="Enter your full name" 
              style={inputStyle} 
              required 
              value={formData.fullName}
              onChange={handleInputChange} 
            />
          </div>

          {/* Role Selection */}
          <div style={inputGroup}>
            <label style={labelStyle}>I want to join as</label>
            <select 
              name="role"
              style={selectStyle} 
              value={formData.role} 
              onChange={handleInputChange}
            >
              <option value="Customer">Customer (Borrower)</option>
              <option value="User">Field Officer (Advisor)</option>
            </select>
          </div>

          {/* Mobile Number */}
          <div style={inputGroup}>
            <label style={labelStyle}>Mobile Number</label>
            <input 
              type="text" 
              name="mobile"
              placeholder="10-digit mobile number" 
              style={inputStyle} 
              required 
              maxLength="10"
              value={formData.mobile}
              onChange={handleInputChange} 
            />
          </div>

          {/* Email (Optional but Recommended) */}
          <div style={inputGroup}>
            <label style={labelStyle}>Email Address</label>
            <input 
              type="email" 
              name="email"
              placeholder="example@mail.com" 
              style={inputStyle} 
              required
              value={formData.email}
              onChange={handleInputChange} 
            />
          </div>

          {/* Password */}
          <div style={inputGroup}>
            <label style={labelStyle}>Create Password</label>
            <input 
              type="password" 
              name="password"
              placeholder="••••••••" 
              style={inputStyle} 
              required 
              value={formData.password}
              onChange={handleInputChange} 
            />
          </div>

          {/* Referral Code (Optional) */}
          <div style={inputGroup}>
            <label style={labelStyle}>Advisor Referral Code (Optional)</label>
            <input 
              type="text" 
              name="referredBy"
              placeholder="e.g. ADV1001" 
              style={inputStyle} 
              value={formData.referredBy}
              onChange={handleInputChange} 
            />
          </div>

          <button type="submit" disabled={loading} style={mainBtn}>
            {loading ? 'Processing Registration...' : 'Create Account'}
          </button>
        </form>

        <div style={footerStyle}>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Already have an account? <Link to="/login" style={{color: '#2563eb', fontWeight: 'bold', textDecoration: 'none'}}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Fintech Professional Styles ---
const containerStyle = { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', fontFamily: 'sans-serif' };
const cardStyle = { width: '450px', background: '#fff', padding: '40px', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' };
const headerStyle = { textAlign: 'center', marginBottom: '30px' };
const subHeader = { fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1px', marginTop: '8px', textTransform: 'uppercase' };
const inputGroup = { marginBottom: '15px' };
const labelStyle = { display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '8px', textTransform: 'uppercase' };
const inputStyle = { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #f1f5f9', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' };
const selectStyle = { ...inputStyle, fontWeight: '700', color: '#1e293b' };
const mainBtn = { width: '100%', padding: '16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '16px', cursor: 'pointer', marginTop: '10px', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)' };
const footerStyle = { textAlign: 'center', marginTop: '25px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' };

export default Signup;