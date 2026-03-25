import React, { useState } from 'react';

const AdvisorEntry = () => {
  const [advisor, setAdvisor] = useState({
    name: '', mobile: '', sponsorId: '', rank: 'Trainee', branch: 'Main Branch'
  });

  const inputStyle = {
    width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', marginTop: '5px'
  };

  const cardStyle = {
    background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={cardStyle}>
        <h2 style={{ color: '#1e293b', marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
          🤝 Advisor/Agent Registration
        </h2>

        <form style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Advisor Name *</label>
            <input type="text" placeholder="Full Name" style={inputStyle} 
              onChange={(e) => setAdvisor({...advisor, name: e.target.value})} />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Mobile Number *</label>
            <input type="number" placeholder="10-digit mobile" style={inputStyle} 
              onChange={(e) => setAdvisor({...advisor, mobile: e.target.value})} />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Sponsor ID (Introducer)</label>
            <input type="text" placeholder="e.g. ADV1001" style={inputStyle} 
              onChange={(e) => setAdvisor({...advisor, sponsorId: e.target.value})} />
            <small style={{ color: '#64748b' }}>Leave blank for direct joining</small>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Current Rank</label>
            <select style={inputStyle} value={advisor.rank} onChange={(e) => setAdvisor({...advisor, rank: e.target.value})}>
              <option>Trainee</option>
              <option>Advisor</option>
              <option>Senior Advisor</option>
              <option>Team Leader</option>
              <option>Manager</option>
            </select>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <button type="button" style={{ 
              width: '100%', padding: '15px', background: '#4f46e5', color: '#fff', 
              border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' 
            }}>
              Generate Advisor Code & Save
            </button>
          </div>
        </form>
      </div>

      {/* Info Section for Commission */}
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