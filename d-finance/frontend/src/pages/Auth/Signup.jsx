import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signupUser } from "../../api/authApi";
import { sendAadhaarOTP, verifyAadhaarOTP } from "../../api/loanApi";

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

  // --- STEP 1: Aadhaar OTP Request (Using loanApi) ---
  const handleRequestOTP = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await sendAadhaarOTP(kycDetails.adhaar);
      if (res.data.success) {
        setRefId(res.data.ref_id);
        setStep(1.5);
        setTimer(60);
        setCanResend(false);
        alert("OTP sent to your Aadhaar-linked mobile!");
      }
    } catch (err) {
      alert(err || "Aadhaar verification failed. Check number.");
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 1.5: Verify OTP (Using loanApi) ---
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await verifyAadhaarOTP({ otp, ref_id: refId });
      if (res.data.success) {
        // Sandbox API se full_name nikalna
        const fetchName = res.data.customerData.full_name;
        setUserData({ ...userData, fullName: fetchName });
        setStep(2);
      }
    } catch (err) {
      alert("Invalid OTP or Session Expired.");
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: Final Registration (Using authApi) ---
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const signupData = {
        ...userData,
        adhaar: kycDetails.adhaar,
        pan: kycDetails.pan,
      };
      const res = await signupUser(signupData);
      if (res.status === 201) {
        alert("Account Created Successfully!");
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
          <h2 style={{ color: '#2563eb', margin: 0, fontWeight: '900' }}>D-FINANCE</h2>
          <p style={subHeader}>AI-POWERED KYC VERIFICATION</p>
        </div>

        {/* STEP 1: Identity Input */}
        {step === 1 && (
          <form onSubmit={handleRequestOTP}>
            <p style={stepText}>Step 1: ID Verification</p>
            <input type="text" placeholder="Aadhaar Number (12 Digit)" style={inputStyle} required maxLength="12"
              onChange={(e) => setKycDetails({...kycDetails, adhaar: e.target.value})} />
            <input type="text" placeholder="PAN Number (ABCDE1234F)" style={inputStyle} required maxLength="10"
              onChange={(e) => setKycDetails({...kycDetails, pan: e.target.value.toUpperCase()})} />
            <button type="submit" disabled={loading} style={mainBtn}>
              {loading ? 'Requesting Secure OTP...' : 'Send Aadhaar OTP'}
            </button>
          </form>
        )}

        {/* STEP 1.5: OTP Verification */}
        {step === 1.5 && (
          <form onSubmit={handleVerifyOTP}>
            <p style={stepText}>Verifying Aadhaar OTP</p>
            <input type="text" placeholder="●●●●●●" style={{...inputStyle, textAlign: 'center', fontSize: '22px', letterSpacing: '4px'}} required maxLength="6"
              onChange={(e) => setOtp(e.target.value)} />
            
            <div style={{ textAlign: 'center', margin: '15px 0' }}>
              {timer > 0 ? (
                <p style={{ fontSize: '13px', color: '#64748b' }}>Request new OTP in <span style={{ color: '#2563eb', fontWeight: 'bold' }}>{timer}s</span></p>
              ) : (
                <button type="button" onClick={handleRequestOTP} style={resendBtn}>Resend OTP</button>
              )}
            </div>

            <button type="submit" disabled={loading} style={mainBtn}>
              {loading ? 'Checking...' : 'Verify & Continue'}
            </button>
            <p style={backBtn} onClick={() => setStep(1)}>← Correction in Details</p>
          </form>
        )}

        {/* STEP 2: Final Details */}
        {step === 2 && (
          <form onSubmit={handleFinalSubmit}>
            <p style={stepText}>Step 2: Profile Setup</p>
            <div style={badge}>✅ Verified: {userData.fullName}</div>

            <input type="text" placeholder="Advisor ID (If any)" style={{...inputStyle, border: '1.5px solid #2563eb'}} 
              onChange={(e) => setUserData({...userData, sponsorId: e.target.value})} />

            <input type="text" placeholder="Mobile Number" style={inputStyle} required maxLength="10"
              onChange={(e) => setUserData({...userData, mobile: e.target.value})} />

            <input type="email" placeholder="Email Address" style={inputStyle} required 
              onChange={(e) => setUserData({...userData, email: e.target.value})} />

            <input type="password" placeholder="Create Strong Password" style={inputStyle} required 
              onChange={(e) => setUserData({...userData, password: e.target.value})} />

            <button type="submit" disabled={loading} style={mainBtn}>
              {loading ? 'Finalizing...' : 'Complete Registration'}
            </button>
          </form>
        )}

        <div style={footerStyle}>
          <Link to="/login" style={linkStyle}>Member of D-Finance? <span style={{color: '#2563eb'}}>Sign In</span></Link>
        </div>
      </div>
    </div>
  );
};

// --- Styles (Cleanup for D-Finance Branding) ---
const containerStyle = { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' };
const cardStyle = { width: '400px', background: '#fff', padding: '40px', borderRadius: '30px', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' };
const headerStyle = { textAlign: 'center', marginBottom: '25px' };
const subHeader = { fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1.5px', marginTop: '5px' };
const inputStyle = { width: '100%', padding: '15px', margin: '8px 0', borderRadius: '14px', border: '2px solid #f1f5f9', boxSizing: 'border-box', fontSize: '14px', fontWeight: '600', outline: 'none', background: '#f8fafc' };
const mainBtn = { width: '100%', padding: '16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)' };
const resendBtn = { background: 'none', border: 'none', color: '#2563eb', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' };
const backBtn = { textAlign: 'center', cursor: 'pointer', color: '#94a3b8', fontSize: '12px', marginTop: '20px', fontWeight: 'bold' };
const stepText = { textAlign: 'center', fontSize: '11px', fontWeight: '900', color: '#475569', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '0.5px' };
const badge = { background: '#eff6ff', color: '#1d4ed8', padding: '12px', borderRadius: '12px', textAlign: 'center', fontSize: '13px', fontWeight: 'bold', marginBottom: '15px', border: '1px solid #dbeafe' };
const footerStyle = { textAlign: 'center', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' };
const linkStyle = { color: '#64748b', textDecoration: 'none', fontSize: '13px', fontWeight: '700' };

export default Signup;