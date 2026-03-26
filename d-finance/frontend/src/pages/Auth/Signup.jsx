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
    referredBy: '', // Advisor ID/Field Officer ID
    role: 'Field Officer', // Default selection for your new panel
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
      const res = await sendAadhaarOTP(kycDetails.adhaar);
      // Backend Mock ho ya Live, success check karega
      if (res.data.success) {
        setRefId(res.data.ref_id);
        setStep(1.5);
        setTimer(60);
        setCanResend(false);
      }
    } catch (err) {
      alert(err.error || "Aadhaar Service Unavailable. Please try later.");
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 1.5: Verify OTP ---
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await verifyAadhaarOTP({ otp, ref_id: refId });
      if (res.data.success) {
        // Backend se fetch kiya hua real/mock name set karega
        const fetchName = res.data.data.full_name;
        setUserData({ ...userData, fullName: fetchName });
        setStep(2);
      }
    } catch (err) {
      alert("Invalid OTP. Verification failed.");
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
        aadhaarNumber: kycDetails.adhaar,
        panNumber: kycDetails.pan,
      };
      
      const res = await signupUser(signupData);
      if (res.status === 201 || res.data.success) {
        alert("Field Officer Registered Successfully!");
        navigate('/login');
      }
    } catch (err) {
      alert(err.error || "Registration Failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle} className="animate-fadeIn">
        <div style={headerStyle}>
          <h2 style={{ color: '#2563eb', margin: 0, fontWeight: '900', letterSpacing: '-1px' }}>D-FINANCE</h2>
          <p style={subHeader}>OFFICIAL FIELD OFFICER REGISTRATION</p>
        </div>

        {/* --- Progress Bar --- */}
        <div style={{ display: 'flex', gap: '5px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '4px', background: '#2563eb', borderRadius: '10px' }}></div>
            <div style={{ flex: 1, height: '4px', background: step >= 1.5 ? '#2563eb' : '#f1f5f9', borderRadius: '10px' }}></div>
            <div style={{ flex: 1, height: '4px', background: step === 2 ? '#2563eb' : '#f1f5f9', borderRadius: '10px' }}></div>
        </div>

        {/* STEP 1: Aadhaar & PAN */}
        {step === 1 && (
          <form onSubmit={handleRequestOTP}>
            <p style={stepText}>Step 1: E-KYC Identity</p>
            <input type="text" placeholder="Aadhaar Number" style={inputStyle} required maxLength="12"
              onChange={(e) => setKycDetails({...kycDetails, adhaar: e.target.value})} />
            <input type="text" placeholder="PAN Number" style={inputStyle} required maxLength="10"
              onChange={(e) => setKycDetails({...kycDetails, pan: e.target.value.toUpperCase()})} />
            
            <div style={infoBox}>
                ℹ️ We'll send an OTP to your Aadhaar-linked mobile number for instant verification.
            </div>

            <button type="submit" disabled={loading} style={mainBtn}>
              {loading ? 'Securing Connection...' : 'Verify Identity'}
            </button>
          </form>
        )}

        {/* STEP 1.5: OTP Verify */}
        {step === 1.5 && (
          <form onSubmit={handleVerifyOTP}>
            <p style={stepText}>Verifying Aadhaar OTP</p>
            <p style={{ textAlign: 'center', fontSize: '12px', color: '#64748b' }}>OTP sent for Ref: {refId}</p>
            <input type="text" placeholder="000000" style={{...inputStyle, textAlign: 'center', fontSize: '24px', letterSpacing: '8px'}} required maxLength="6"
              onChange={(e) => setOtp(e.target.value)} />
            
            <div style={{ textAlign: 'center', margin: '15px 0' }}>
              {timer > 0 ? (
                <p style={{ fontSize: '13px', color: '#64748b' }}>Resend available in <span style={{ color: '#2563eb', fontWeight: 'bold' }}>{timer}s</span></p>
              ) : (
                <button type="button" onClick={handleRequestOTP} style={resendBtn}>Resend OTP Now</button>
              )}
            </div>

            <button type="submit" disabled={loading} style={mainBtn}>
              {loading ? 'Verifying...' : 'Confirm & Proceed'}
            </button>
            <p style={backBtn} onClick={() => setStep(1)}>← Change ID Details</p>
          </form>
        )}

        {/* STEP 2: Profile Setup */}
        {step === 2 && (
          <form onSubmit={handleFinalSubmit}>
            <p style={stepText}>Step 2: Officer Profile</p>
            <div style={badge}>👤 Verified Name: {userData.fullName}</div>

            <select 
              style={inputStyle} 
              value={userData.role} 
              onChange={(e) => setUserData({...userData, role: e.target.value})}
            >
                <option value="Field Officer">Field Officer (Advisor)</option>
                <option value="Customer">Customer (Borrower)</option>
            </select>

            <input type="text" placeholder="Sponsor/Referral ID (Optional)" style={inputStyle}
              onChange={(e) => setUserData({...userData, referredBy: e.target.value})} />

            <input type="text" placeholder="Mobile Number" style={inputStyle} required maxLength="10"
              onChange={(e) => setUserData({...userData, mobile: e.target.value})} />

            <input type="email" placeholder="Email Address" style={inputStyle} required 
              onChange={(e) => setUserData({...userData, email: e.target.value})} />

            <input type="password" placeholder="Create Access Password" style={inputStyle} required 
              onChange={(e) => setUserData({...userData, password: e.target.value})} />

            <button type="submit" disabled={loading} style={mainBtn}>
              {loading ? 'Creating Account...' : 'Complete Officer Setup'}
            </button>
          </form>
        )}

        <div style={footerStyle}>
          <Link to="/login" style={linkStyle}>Already have an account? <span style={{color: '#2563eb'}}>Sign In</span></Link>
        </div>
      </div>
    </div>
  );
};

// --- Updated Styles ---
const containerStyle = { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' };
const cardStyle = { width: '420px', background: '#fff', padding: '40px', borderRadius: '32px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', border: '1px solid #e2e8f0' };
const headerStyle = { textAlign: 'center', marginBottom: '25px' };
const subHeader = { fontSize: '9px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px', marginTop: '8px', textTransform: 'uppercase' };
const inputStyle = { width: '100%', padding: '16px', margin: '10px 0', borderRadius: '16px', border: '1.5px solid #e2e8f0', boxSizing: 'border-box', fontSize: '14px', fontWeight: '600', outline: 'none', transition: 'all 0.2s' };
const mainBtn = { width: '100%', padding: '18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '18px', fontWeight: '800', cursor: 'pointer', marginTop: '15px', fontSize: '15px' };
const resendBtn = { background: 'none', border: 'none', color: '#2563eb', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' };
const backBtn = { textAlign: 'center', cursor: 'pointer', color: '#94a3b8', fontSize: '12px', marginTop: '20px', fontWeight: 'bold' };
const stepText = { textAlign: 'center', fontSize: '10px', fontWeight: '900', color: '#1e293b', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '1px' };
const badge = { background: '#f0f9ff', color: '#0369a1', padding: '14px', borderRadius: '16px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold', marginBottom: '20px', border: '1px solid #bae6fd' };
const infoBox = { background: '#f8fafc', padding: '12px', borderRadius: '12px', fontSize: '11px', color: '#64748b', lineHeight: '1.5', marginTop: '10px', border: '1px dashed #cbd5e1' };
const footerStyle = { textAlign: 'center', marginTop: '25px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' };
const linkStyle = { color: '#64748b', textDecoration: 'none', fontSize: '13px', fontWeight: '700' };

export default Signup;