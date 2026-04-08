import React, { useState } from 'react';
import API from "../../../api/axios";

const AdvisorEntry = () => {
  const [entryType, setEntryType] = useState('User'); 
  const [advisor, setAdvisor] = useState({
    fullName: '', 
    email: '',
    mobile: '', 
    sponsorId: '', 
    rank: 'Trainee', 
    branch: 'Mathura Branch', // Default branch set to Mathura
    password: 'password123'  // Sending a default password to satisfy Backend requirements
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const inputStyle = {
    width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #f1f5f9', marginTop: '5px', outline: 'none', background: '#f8fafc', fontWeight: '600'
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // 🔥 CRITICAL FIX: Removed '/api' prefix to prevent '/api/api' error
      // Backend expects role 'Accountant' or 'User' (Advisor)
      const res = await API.post('/auth/signup', {
        ...advisor,
        role: entryType === 'Accountant' ? 'Accountant' : 'User'
      });

      setMessage({ 
        type: 'success', 
        text: `Success! ${entryType} added to D-Finance Cloud.` 
      });
      alert(`${entryType} Registered Successfully!`);
      
      // Reset Form
      setAdvisor({ fullName: '', email: '', mobile: '', sponsorId: '', rank: 'Trainee', branch: 'Mathura Branch', password: 'password123' });
    } catch (err) {
      console.error("Registration Error Details:", err.response?.data);
      const errMsg = err.response?.data?.error || "Registration Failed: Mobile or Email might already exist.";
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* --- ROLE SELECTION TOGGLE --- */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', background: '#e2e8f0', padding: '6px', borderRadius: '16px', width: 'fit-content' }}>
        <button 
          onClick={() => setEntryType('User')}
          style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '800', transition: '0.3s', background: entryType === 'User' ? '#2563eb' : 'transparent', color: entryType === 'User' ? '#fff' : '#64748b' }}
        >
          🤝 New Advisor
        </button>
        <button 
          onClick={() => setEntryType('Accountant')}
          style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '800', transition: '0.3s', background: entryType === 'Accountant' ? '#059669' : 'transparent', color: entryType === 'Accountant' ? '#fff' : '#64748b' }}
        >
          🛡️ New Accountant
        </button>
      </div>

      <div style={{ background: '#fff', padding: '35px', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
        <h2 style={{ color: '#0f172a', marginBottom: '30px', borderBottom: '2px solid #f8fafc', paddingBottom: '15px', fontSize: '24px', fontWeight: '900', letterSpacing: '-0.5px' }}>
          {entryType === 'User' ? '🤝 Advisor Registry' : '🛡️ Accountant Registry'}
        </h2>

        {message.text && (
          <div style={{ 
            padding: '15px', marginBottom: '25px', borderRadius: '12px', fontWeight: '800', fontSize: '14px',
            backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: message.type === 'success' ? '#166534' : '#991b1b',
            border: `1px solid ${message.type === 'success' ? '#86efac' : '#fca5a5'}`
          }}>
            {message.type === 'success' ? '✅' : '❌'} {message.text}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Full Name *</label>
            <input type="text" required placeholder="Ex: Dhreej Sharma" style={inputStyle} value={advisor.fullName}
              onChange={(e) => setAdvisor({...advisor, fullName: e.target.value})} />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Email Address *</label>
            <input type="email" required placeholder="office@dfinance.com" style={inputStyle} value={advisor.email}
              onChange={(e) => setAdvisor({...advisor, email: e.target.value})} />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Mobile Number *</label>
            <input type="number" required placeholder="89350XXXXX" style={inputStyle} value={advisor.mobile}
              onChange={(e) => setAdvisor({...advisor, mobile: e.target.value})} />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>{entryType === 'User' ? 'Sponsor ID' : 'Office Branch'}</label>
            <input 
              type="text" 
              placeholder={entryType === 'User' ? "ADV1001" : "Mathura Branch"} 
              style={inputStyle} 
              value={entryType === 'User' ? advisor.sponsorId : advisor.branch}
              onChange={(e) => entryType === 'User' ? setAdvisor({...advisor, sponsorId: e.target.value}) : setAdvisor({...advisor, branch: e.target.value})} 
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Level / Rank</label>
            <select style={inputStyle} value={advisor.rank} onChange={(e) => setAdvisor({...advisor, rank: e.target.value})}>
              {entryType === 'User' ? (
                <>
                  <option>Trainee</option>
                  <option>Advisor</option>
                  <option>Senior Advisor</option>
                  <option>Manager</option>
                </>
              ) : (
                <>
                  <option>Junior Accountant</option>
                  <option>Senior Accountant</option>
                  <option>Finance Head</option>
                </>
              )}
            </select>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" disabled={loading} style={{ 
              width: '100%', padding: '20px', background: loading ? '#cbd5e1' : (entryType === 'User' ? '#2563eb' : '#059669'), 
              color: '#fff', border: 'none', borderRadius: '16px', fontWeight: '900', fontSize: '14px', textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.1)', transition: '0.3s'
            }}>
              {loading ? 'SYNCING TO CLOUD...' : `Confirm & Register ${entryType}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdvisorEntry;