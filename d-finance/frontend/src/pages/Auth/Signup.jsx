import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// import API from '../api/axios'; // Hamara naya Axios instance
import API from "../../api/axios";

const Signup = () => {
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [kycDetails, setKycDetails] = useState({ adhaar: '', pan: '' });
  const [userData, setUserData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    password: '',
    sponsorId: '', 
    role: 'Customer', 
    cibilScore: 0
  });

  const navigate = useNavigate();

  // Step 1: CIBIL Eligibility (Simulation)
  const handleVerifyKYC = (e) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      const score = Math.floor(Math.random() * (900 - 300 + 1)) + 300;
      if (score < 700) {
        alert(`Rejected! CIBIL Score is ${score}. Minimum 700 required for D-Finance.`);
        setLoading(false);
      } else {
        setUserData({ ...userData, cibilScore: score });
        setStep(2);
        setLoading(false);
        alert(`Eligible! CIBIL Score: ${score}. Fill your account details.`);
      }
    }, 1200);
  };

  // Step 2: Final Registration (Atlas Database)
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Advisor (Sponsor) Validate karna (Atlas se)
      const advisorRes = await API.get(`/auth/check-advisor/${userData.sponsorId}`);
      
      if (!advisorRes.data.exists) {
        alert("Error: Invalid Sponsor ID. Advisor not found in our system.");
        setLoading(false);
        return;
      }

      // 2. Atlas Database mein User create karna
      const signupData = {
        ...userData,
        adhaar: kycDetails.adhaar,
        pan: kycDetails.pan,
      };

      const res = await API.post('/auth/signup', signupData);

      if (res.status === 201) {
        alert("Registration Successful! Welcome to D-Finance.");
        navigate('/login');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Registration Failed. Email might already exist.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <h2 style={{ color: '#059669', margin: 0 }}>D-FINANCE</h2>
          <p style={subHeader}>SECURE CUSTOMER ONBOARDING</p>
        </div>

        {step === 1 && (
          <form onSubmit={handleVerifyKYC}>
            <p style={stepText}>Step 1: Credit & ID Check</p>
            <input type="text" placeholder="Aadhaar Number (12 Digit)" style={inputStyle} required maxLength="12"
              onChange={(e) => setKycDetails({...kycDetails, adhaar: e.target.value})} />
            <input type="text" placeholder="PAN Number" style={inputStyle} required maxLength="10"
              onChange={(e) => setKycDetails({...kycDetails, pan: e.target.value.toUpperCase()})} />
            <button type="submit" disabled={loading} style={mainBtn}>
              {loading ? 'Verifying CIBIL...' : 'Check My Eligibility'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleFinalSubmit}>
            <p style={stepText}>Step 2: Account Details</p>
            <div style={badge}>Verified CIBIL Score: {userData.cibilScore}</div>

            <input type="text" placeholder="Full Name" style={inputStyle} required 
              onChange={(e) => setUserData({...userData, fullName: e.target.value})} />

            <input type="text" placeholder="Advisor / Sponsor ID" style={{...inputStyle, border: '2px solid #059669'}} required 
              onChange={(e) => setUserData({...userData, sponsorId: e.target.value})} />

            <input type="text" placeholder="Mobile Number" style={inputStyle} required maxLength="10"
              onChange={(e) => setUserData({...userData, mobile: e.target.value})} />

            <input type="email" placeholder="Email Address" style={inputStyle} required 
              onChange={(e) => setUserData({...userData, email: e.target.value})} />

            <input type="password" placeholder="Set Password" style={inputStyle} required 
              onChange={(e) => setUserData({...userData, password: e.target.value})} />

            <button type="submit" disabled={loading} style={mainBtn}>
              {loading ? 'Creating Account...' : 'Finish & Sign Up'}
            </button>
          </form>
        )}

        <div style={footerStyle}>
          <Link to="/login" style={linkStyle}>
            Already a member? <span style={{color: '#059669'}}>Login Now</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

// --- Professional Theme Styles ---
const containerStyle = { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' };
const cardStyle = { width: '400px', background: '#fff', padding: '40px', borderRadius: '30px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' };
const headerStyle = { textAlign: 'center', marginBottom: '25px' };
const subHeader = { fontSize: '10px', fontWeight: 'bold', color: '#94a3b8', letterSpacing: '1px', marginTop: '5px' };
const inputStyle = { width: '100%', padding: '14px', margin: '10px 0', borderRadius: '12px', border: '1.5px solid #e2e8f0', boxSizing: 'border-box', fontSize: '14px', fontWeight: '600' };
const mainBtn = { width: '100%', padding: '16px', background: '#059669', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px' };
const stepText = { textAlign: 'center', fontSize: '11px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: '15px' };
const badge = { background: '#f0fdf4', color: '#166534', padding: '10px', borderRadius: '10px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px', border: '1px solid #dcfce7' };
const footerStyle = { textAlign: 'center', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' };
const linkStyle = { color: '#64748b', textDecoration: 'none', fontSize: '13px', fontWeight: '700' };

export default Signup;