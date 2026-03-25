import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from "../../api/authApi"; // Naya API function use karein

const Login = () => {
  const [credentials, setCredentials] = useState({ 
    mobile: '', 
    password: '', 
    role: 'Admin' 
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Humne jo authApi.js mein function banaya tha usey call kar rahe hain
      const response = await loginUser({
        mobile: credentials.mobile,
        password: credentials.password,
        role: credentials.role
      });

      const { user, token } = response.data;

      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Success Message
        alert(`Swagat hai, ${user.fullName}!`);

        // Role-based Redirect Logic (Updated for D-Finance V3)
        const rolePaths = {
          'Admin': '/admin',
          'User': '/user', // Advisor/Agent Dashboard
          'Customer': '/customer/dashboard'
        };

        navigate(rolePaths[user.role] || '/');
      }
    } catch (error) {
      // Hamara axios.js interceptor ab seedha error message (string) bhejta hai
      const errorMsg = typeof error === 'string' ? error : "Login Failed. Server unreachable.";
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
          <p style={subTextStyle}>Mathura Branch | Cloud Secured</p>
        </div>

        <form onSubmit={handleLogin}>
          {/* --- Role Selection --- */}
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

          {/* --- Mobile Input --- */}
          <div style={inputGroup}>
            <label style={labelStyle}>Mobile Number</label>
            <input 
              type="text" 
              placeholder="Registered Mobile Number" 
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
            {loading ? 'Verifying Identity...' : 'Sign In to Account'}
          </button>
        </form>

        <div style={footerStyle}>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Don't have an account? <br/>
            <Link to="/signup" style={linkStyle}>Contact Branch to Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Styles remain exactly as you defined ---
const pageWrapper = { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', fontFamily: 'sans-serif' };
const loginCard = { width: '100%', maxWidth: '420px', background: '#ffffff', padding: '45px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' };
const logoStyle = { color: '#2563eb', fontSize: '32px', fontWeight: '900', margin: 0, letterSpacing: '-1px' };
const subTextStyle = { color: '#64748b', fontSize: '14px', marginTop: '8px' };
const inputGroup = { marginBottom: '20px' };
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '8px', textTransform: 'uppercase' };
const selectStyle = { width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #f1f5f9', outline: 'none', background: '#f8fafc', fontWeight: '600', boxSizing: 'border-box' };
const inputField = { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #f1f5f9', outline: 'none', boxSizing: 'border-box', background: '#f8fafc' };
const btnStyle = { width: '100%', padding: '16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '16px', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)' };
const footerStyle = { textAlign: 'center', marginTop: '30px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' };
const linkStyle = { color: '#2563eb', fontWeight: 'bold', textDecoration: 'none' };

export default Login;