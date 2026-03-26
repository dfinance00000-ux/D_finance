import React, { useState } from 'react';
import API from "../../../api/axios";

const AdvisorEntry = () => {
  const [entryType, setEntryType] = useState('User'); // 'User' for Advisor, 'Accountant' for Accountant
  const [advisor, setAdvisor] = useState({
    fullName: '', 
    email: '',
    mobile: '', 
    sponsorId: '', 
    rank: 'Trainee', 
    branch: 'Main Branch',
    password: '123456' 
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const inputStyle = {
    width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '5px', outline: 'none', background: '#f8fafc'
  };

  const cardStyle = {
    background: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9'
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Backend ko request bhej rahe hain dynamic role ke saath
      const res = await API.post('/api/auth/signup', {
        ...advisor,
        role: entryType // 'User' (Advisor) ya 'Accountant'
      });

      setMessage({ 
        type: 'success', 
        text: `Success! ${entryType === 'User' ? 'Advisor' : 'Accountant'} registered successfully.` 
      });
      alert(`${entryType} Registered Successfully!`);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || "Registration Failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* --- ROLE SELECTION TOGGLE --- */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', background: '#f1f5f9', padding: '6px', borderRadius: '12px', width: 'fit-content' }}>
        <button 
          onClick={() => setEntryType('User')}
          style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', background: entryType === 'User' ? '#4f46e5' : 'transparent', color: entryType === 'User' ? '#fff' : '#64748b' }}
        >
          🤝 New Advisor
        </button>
        <button 
          onClick={() => setEntryType('Accountant')}
          style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', background: entryType === 'Accountant' ? '#059669' : 'transparent', color: entryType === 'Accountant' ? '#fff' : '#64748b' }}
        >
          🛡️ New Accountant
        </button>
      </div>

      <div style={cardStyle}>
        <h2 style={{ color: '#1e293b', marginBottom: '25px', borderBottom: '2.5px solid #f1f5f9', paddingBottom: '12px', fontSize: '22px', fontWeight: '900' }}>
          {entryType === 'User' ? '🤝 Advisor/Agent Registration' : '🛡️ Accountant Registration'}
        </h2>

        {message.text && (
          <div style={{ 
            padding: '12px', marginBottom: '25px', borderRadius: '10px', fontWeight: 'bold',
            backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: message.type === 'success' ? '#166534' : '#991b1b',
            border: `1px solid ${message.type === 'success' ? '#86efac' : '#fca5a5'}`
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Full Name *</label>
            <input type="text" required placeholder="Full Name" style={inputStyle} 
              onChange={(e) => setAdvisor({...advisor, fullName: e.target.value})} />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Email Address *</label>
            <input type="email" required placeholder="login@email.com" style={inputStyle} 
              onChange={(e) => setAdvisor({...advisor, email: e.target.value})} />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Mobile Number *</label>
            <input type="number" required placeholder="10-digit mobile" style={inputStyle} 
              onChange={(e) => setAdvisor({...advisor, mobile: e.target.value})} />
          </div>

          {/* Sponsor ID sirf Advisor ke liye dikhega */}
          {entryType === 'User' && (
            <div>
              <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Sponsor ID (Introducer)</label>
              <input type="text" placeholder="e.g. ADV1001" style={inputStyle} 
                onChange={(e) => setAdvisor({...advisor, sponsorId: e.target.value})} />
            </div>
          )}

          <div>
            <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>{entryType === 'User' ? 'Advisor Rank' : 'Officer Level'}</label>
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
              width: '100%', padding: '18px', background: loading ? '#94a3b8' : (entryType === 'User' ? '#4f46e5' : '#059669'), 
              color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', 
              cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
            }}>
              {loading ? 'Processing...' : `Confirm & Register ${entryType === 'User' ? 'Advisor' : 'Accountant'}`}
            </button>
          </div>
        </form>
      </div>

      {/* Info Cards sirf Advisor ke liye useful hain */}
      {entryType === 'User' && (
        <div style={{ marginTop: '25px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ ...cardStyle, borderLeft: '5px solid #10b981', padding: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#065f46', fontWeight: '900' }}>💰 Commission Slab</h4>
            <p style={{ fontSize: '13px', color: '#64748b' }}>Trainee Level: **5% Direct Commission** on New Loans.</p>
            </div>
            <div style={{ ...cardStyle, borderLeft: '5px solid #f59e0b', padding: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#92400e', fontWeight: '900' }}>📊 Team Rules</h4>
            <p style={{ fontSize: '13px', color: '#64748b' }}>Gap Commission: **2%** from immediate downline sales.</p>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdvisorEntry;