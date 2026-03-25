import React, { useState } from 'react';
// import API from '../../api/axios'; // Aapka updated axios instance
import API from "../../../api/axios";


const AdvisorEntry = () => {
  const [advisor, setAdvisor] = useState({
    fullName: '', 
    email: '',
    mobile: '', 
    sponsorId: '', 
    rank: 'Trainee', 
    branch: 'Main Branch',
    password: '123456' // Default password for new advisors
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const inputStyle = {
    width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', marginTop: '5px'
  };

  const cardStyle = {
    background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
  };

  // --- SAVE ADVISOR LOGIC ---
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Backend ko request bhej rahe hain (Role: User/Advisor)
      const res = await API.post('/auth/signup', {
        ...advisor,
        role: 'User' // Advisor ko hum 'User' role de rahe hain default
      });

      setMessage({ type: 'success', text: `Success! Advisor Code: ${advisor.sponsorId || 'Generated'}` });
      alert("Advisor Registered Successfully!");
    } catch (err) {
      setMessage({ type: 'error', text: err || "Registration Failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={cardStyle}>
        <h2 style={{ color: '#1e293b', marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
          🤝 Advisor/Agent Registration
        </h2>

        {message.text && (
          <div style={{ 
            padding: '10px', marginBottom: '20px', borderRadius: '6px',
            backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: message.type === 'success' ? '#166534' : '#991b1b'
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Full Name *</label>
            <input type="text" required placeholder="Full Name" style={inputStyle} 
              onChange={(e) => setAdvisor({...advisor, fullName: e.target.value})} />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Email Address *</label>
            <input type="email" required placeholder="Email for Login" style={inputStyle} 
              onChange={(e) => setAdvisor({...advisor, email: e.target.value})} />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Mobile Number *</label>
            <input type="number" required placeholder="10-digit mobile" style={inputStyle} 
              onChange={(e) => setAdvisor({...advisor, mobile: e.target.value})} />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Sponsor ID (Introducer)</label>
            <input type="text" placeholder="e.g. ADV1001" style={inputStyle} 
              onChange={(e) => setAdvisor({...advisor, sponsorId: e.target.value})} />
            <small style={{ color: '#64748b' }}>Leave blank for direct joining</small>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Rank</label>
            <select style={inputStyle} value={advisor.rank} onChange={(e) => setAdvisor({...advisor, rank: e.target.value})}>
              <option>Trainee</option>
              <option>Advisor</option>
              <option>Senior Advisor</option>
              <option>Manager</option>
            </select>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" disabled={loading} style={{ 
              width: '100%', padding: '15px', background: loading ? '#94a3b8' : '#4f46e5', 
              color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', 
              cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px' 
            }}>
              {loading ? 'Registering...' : 'Register Advisor & Generate ID'}
            </button>
          </div>
        </form>
      </div>

      <div style={{ marginTop: '25px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ ...cardStyle, borderLeft: '4px solid #10b981' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#065f46' }}>Current Commission Slab</h4>
          <p style={{ fontSize: '14px', color: '#374151' }}>Trainee Level: **5% Direct Commission** on New Loans.</p>
        </div>
        <div style={{ ...cardStyle, borderLeft: '4px solid #f59e0b' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#92400e' }}>Downline Rules</h4>
          <p style={{ fontSize: '14px', color: '#374151' }}>Gap Commission: **2%** from immediate downline sales.</p>
        </div>
      </div>
    </div>
  );
};

export default AdvisorEntry;