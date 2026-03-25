import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// import API from '../api/axios'; // Apne naye axios file ko import karein
import API from "../../api/axios";

const Login = () => {
  const [credentials, setCredentials] = useState({ 
    userid: '', // Mobile number
    password: '', 
    role: 'Admin' 
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Backend API ko hit karna (Atlas Database check karega)
      // Hum email ki jagah mobile bhej rahe hain jaisa aapne setup kiya hai
      const response = await API.post('/auth/login', {
        mobile: credentials.userid,
        password: credentials.password,
        role: credentials.role
      });

      // 2. Response se user aur token nikalna
      const { user, token } = response.data;

      if (token) {
        // 3. Token aur User info local storage mein save karna
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        alert(`Login Successful! Welcome, ${user.fullName}`);

        // 4. Role-based navigation
        if (user.role === 'Admin') {
          navigate('/admin');
        } else if (user.role === 'User') { // Advisor/Agent
          navigate('/user');
        } else if (user.role === 'Customer') {
          navigate('/customer/dashboard');
        }
      }
    } catch (error) {
      // Backend se aane wala error message dikhana
      const errorMsg = error.response?.data?.error || "Invalid Credentials. Please check again.";
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
          <p style={subTextStyle}>Cloud Secured Login</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={inputGroup}>
            <label style={labelStyle}>Login Role</label>
            <select 
              style={selectStyle}
              value={credentials.role}
              onChange={(e) => setCredentials({...credentials, role: e.target.value})}
              disabled={loading}
            >
              <option value="Admin">System Administrator</option>
              <option value="User">Advisor / Agent</option>
              <option value="Customer">Valued Customer</option>
            </select>
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Mobile Number</label>
            <input 
              type="text" 
              placeholder="Enter Mobile Number" 
              style={inputField}
              required
              disabled={loading}
              onChange={(e) => setCredentials({...credentials, userid: e.target.value})}
            />
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              style={inputField}
              required
              disabled={loading}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            />
          </div>

          <button type="submit" disabled={loading} style={loading ? {...btnStyle, background: '#94a3b8'} : btnStyle}>
            {loading ? 'Authenticating...' : 'Sign In to Account'}
          </button>
        </form>

        <div style={footerStyle}>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Don't have an account? <br/>
            <Link to="/signup" style={linkStyle}>Register Here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Styles Object (Saaf aur sundar) ---
const pageWrapper = { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', fontFamily: 'sans-serif' };
const loginCard = { width: '100%', maxWidth: '420px', background: '#ffffff', padding: '45px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' };
const logoStyle = { color: '#2563eb', fontSize: '32px', fontWeight: '900', margin: 0, letterSpacing: '-1px' };
const subTextStyle = { color: '#64748b', fontSize: '14px', marginTop: '8px' };
const inputGroup = { marginBottom: '20px' };
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '8px', textTransform: 'uppercase' };
const selectStyle = { width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #f1f5f9', outline: 'none', background: '#f8fafc', fontWeight: '600' };
const inputField = { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #f1f5f9', outline: 'none', boxSizing: 'border-box', background: '#f8fafc' };
const btnStyle = { width: '100%', padding: '16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '16px', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)' };
const footerStyle = { textAlign: 'center', marginTop: '30px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' };
const linkStyle = { color: '#2563eb', fontWeight: 'bold', textDecoration: 'none' };

export default Login;