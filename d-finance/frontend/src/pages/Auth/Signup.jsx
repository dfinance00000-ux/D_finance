import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from "../../api/axios";

const Signup = () => {
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [refId, setRefId] = useState(''); 
  const [otp, setOtp] = useState('');
  
  // Timer States
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const [kycDetails, setKycDetails] = useState({ adhaar: '', pan: '' });
  const [userData, setUserData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    password: '',
    sponsorId: '', 
    role: 'Customer', 
    cibilScore: 750 
  });

  const navigate = useNavigate();

  // --- Timer Logic ---
  useEffect(() => {
    let interval;
    if (step === 1.5 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // --- STEP 1: Aadhaar OTP Request ---
  const handleRequestOTP = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/kyc/aadhaar-otp', { adhaarNumber: kycDetails.adhaar });
      if (res.data.success) {
        setRefId(res.data.ref_id);
        setStep(1.5);
        setTimer(60);
        setCanResend(false);
        alert("OTP sent successfully!");
      }
    } catch (err) {
      alert(err || "Aadhaar verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 1.5: Verify OTP ---
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/kyc/aadhaar-verify', { otp, ref_id: refId });
      if (res.data.success) {
        const fetchName = res.data.customerData.full_name;
        setUserData({ ...userData, fullName: fetchName });
        setStep(2);
      }
    } catch (err) {
      alert("Invalid OTP. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: Final Registration ---
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const signupData = {
        ...userData,
        adhaar: kycDetails.adhaar,
        pan: kycDetails.pan,
      };
      const res = await API.post('/auth/signup', signupData);
      if (res.status === 201) {
        alert("Registration Successful!");
        navigate('/login');
      }
    } catch (err) {
      alert(err || "Registration Failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <h2 style={{ color: '#059669', margin: 0 }}>D-FINANCE</h2>
          <p style={subHeader}>SECURE ONBOARDING</p>
        </div>

        {/* STEP 1: Aadhaar & PAN */}
        {step === 1 && (
          <form onSubmit={handleRequestOTP}>
            <p style={stepText}>Step 1: Identity Verification</p>
            <input type="text" placeholder="Aadhaar Number (12 Digit)" style={inputStyle} required maxLength="12"
              onChange={(e) => setKycDetails({...kycDetails, adhaar: e.target.value})} />
            <input type="text" placeholder="PAN Number" style={inputStyle} required maxLength="10"
              onChange={(e) => setKycDetails({...kycDetails, pan: e.target.value.toUpperCase()})} />
            <button type="submit" disabled={loading} style={mainBtn}>
              {loading ? 'Sending OTP...' : 'Verify Aadhaar via OTP'}
            </button>
          </form>
        )}

        {/* STEP 1.5: OTP Input with Timer */}
        {step === 1.5 && (
          <form onSubmit={handleVerifyOTP}>
            <p style={stepText}>Enter 6-Digit OTP</p>
            <input type="text" placeholder="000000" style={{...inputStyle, textAlign: 'center', fontSize: '24px', letterSpacing: '8px'}} required maxLength="6"
              onChange={(e) => setOtp(e.target.value)} />
            
            <div style={{ textAlign: 'center', margin: '15px 0' }}>
              {timer > 0 ? (
                <p style={{ fontSize: '13px', color: '#64748b' }}>Resend OTP in <span style={{ color: '#059669', fontWeight: 'bold' }}>{timer}s</span></p>
              ) : (
                <button type="button" onClick={handleRequestOTP} style={resendBtn}>Resend OTP</button>
              )}
            </div>

            <button type="submit" disabled={loading} style={mainBtn}>
              {loading ? 'Verifying...' : 'Confirm OTP'}
            </button>
            <p style={backBtn} onClick={() => setStep(1)}>← Change Details</p>
          </form>
        )}

        {/* STEP 2: Account Details */}
        {step === 2 && (
          <form onSubmit={handleFinalSubmit}>
            <p style={stepText}>Step 2: Account Details</p>
            <div style={badge}>Verified Identity: {userData.fullName}</div>

            <input type="text" value={userData.fullName} style={inputStyle} readOnly disabled />

            <input type="text" placeholder="Advisor / Sponsor ID (Optional)" style={{...inputStyle, border: '2px solid #059669'}} 
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
          <Link to="/login" style={linkStyle}>Already a member? <span style={{color: '#059669'}}>Login</span></Link>
        </div>
      </div>
    </div>
  );
};

// --- Styles ---
const containerStyle = { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' };
const cardStyle = { width: '400px', background: '#fff', padding: '40px', borderRadius: '30px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' };
const headerStyle = { textAlign: 'center', marginBottom: '25px' };
const subHeader = { fontSize: '10px', fontWeight: 'bold', color: '#94a3b8', letterSpacing: '1px', marginTop: '5px' };
const inputStyle = { width: '100%', padding: '14px', margin: '10px 0', borderRadius: '12px', border: '1.5px solid #e2e8f0', boxSizing: 'border-box', fontSize: '14px', fontWeight: '600', outline: 'none' };
const mainBtn = { width: '100%', padding: '16px', background: '#059669', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px' };
const resendBtn = { background: 'none', border: 'none', color: '#059669', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' };
const backBtn = { textAlign: 'center', cursor: 'pointer', color: '#64748b', fontSize: '12px', marginTop: '20px', fontWeight: '600' };
const stepText = { textAlign: 'center', fontSize: '11px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: '15px' };
const badge = { background: '#f0fdf4', color: '#166534', padding: '10px', borderRadius: '10px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px', border: '1px solid #dcfce7' };
const footerStyle = { textAlign: 'center', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' };
const linkStyle = { color: '#64748b', textDecoration: 'none', fontSize: '13px', fontWeight: '700' };

export default Signup;