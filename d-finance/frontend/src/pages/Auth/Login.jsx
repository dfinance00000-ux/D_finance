import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from "../../api/authApi"; 

const Login = () => {
  const [credentials, setCredentials] = useState({ 
    mobile: '', 
    password: '' 
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Role selection dropdown hatane ke baad ab seedha credentials bhej rahe hain
      const response = await loginUser({
        mobile: credentials.mobile,
        password: credentials.password
      });

      const { user, token } = response.data;

      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        alert(`Welcome back, ${user.fullName}!`);

        // --- 🚀 AUTO-REDIRECT BASED ON BACKEND ROLE ---
        const rolePaths = {
          'Admin': '/admin',
          'User': '/user', 
          'Accountant': '/accountant/approval', 
          'Customer': '/customer/dashboard'
        };

        // Backend se jo role milega, wahan user redirect ho jayega
        navigate(rolePaths[user.role] || '/');
      }
    } catch (error) {
      const errorMsg = typeof error === 'string' ? error : "Invalid Credentials or Server Error";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageWrapper}>
      <div style={loginCard}>
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <h1 style={logoStyle}>D-FINANCE</h1>
          <p style={subTextStyle}>Mathura Branch | Secure Cloud Access</p>
        </div>

        <form onSubmit={handleLogin}>
          {/* --- Mobile Input --- */}
          <div style={inputGroup}>
            <label style={labelStyle}>Mobile Number</label>
            <input 
              type="text" 
              placeholder="Enter registered mobile" 
              style={inputField}
              required
              disabled={loading}
              value={credentials.mobile}
              onChange={(e) => setCredentials({...credentials, mobile: e.target.value})}
            />
          </div>

          {/* --- Password Input --- */}
          <div style={inputGroup}>
            <label style={labelStyle}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              style={inputField}
              required
              disabled={loading}
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={loading ? {...btnStyle, background: '#94a3b8', cursor: 'not-allowed'} : btnStyle}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={footerStyle}>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Trouble logging in? <br/>
            <Link to="/signup" style={linkStyle}>Register as a New Customer</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Styles (Clean & Professional) ---
const pageWrapper = { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', fontFamily: 'sans-serif' };
const loginCard = { width: '100%', maxWidth: '400px', background: '#ffffff', padding: '45px', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' };
const logoStyle = { color: '#2563eb', fontSize: '32px', fontWeight: '900', margin: 0, letterSpacing: '-1px' };
const subTextStyle = { color: '#64748b', fontSize: '14px', marginTop: '8px', fontWeight: '500' };
const inputGroup = { marginBottom: '20px' };
const labelStyle = { display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '8px', textTransform: 'uppercase' };
const inputField = { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #f1f5f9', outline: 'none', boxSizing: 'border-box', background: '#f8fafc', fontWeight: '600' };
const btnStyle = { width: '100%', padding: '16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '16px', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)', marginTop: '10px' };
const footerStyle = { textAlign: 'center', marginTop: '30px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' };
const linkStyle = { color: '#2563eb', fontWeight: 'bold', textDecoration: 'none' };

export default Login;