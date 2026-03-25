import React, { useState } from 'react';

const BranchMaster = () => {
  const [branches, setBranches] = useState([
    { id: 1, name: 'Main Head Office', code: 'HO001', city: 'Mathura', status: 'Active' },
    { id: 2, name: 'Civil Lines Branch', code: 'CL042', city: 'Agra', status: 'Active' }
  ]);

  const [formData, setFormData] = useState({ name: '', code: '', city: '', status: 'Active' });

  const handleAddBranch = (e) => {
    e.preventDefault();
    const newBranch = { ...formData, id: branches.length + 1 };
    setBranches([...branches, newBranch]);
    setFormData({ name: '', code: '', city: '', status: 'Active' }); // Reset form
    alert("Branch added successfully to the list!");
  };

  const inputStyle = {
    width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', marginTop: '5px'
  };

  return (
    <div style={{ padding: '20px', spaceY: '30px' }}>
      {/* Step 1: Branch Creation Form */}
      <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#1e293b', display: 'flex', alignItems: 'center' }}>
          🏢 Create New Branch
        </h3>
        <form onSubmit={handleAddBranch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Branch Name</label>
            <input type="text" required style={inputStyle} value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Branch Code</label>
            <input type="text" required style={inputStyle} value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})} />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>City</label>
            <input type="text" style={inputStyle} value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})} />
          </div>
          <button type="submit" style={{ padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            Add Branch
          </button>
        </form>
      </div>

      {/* Step 2: Branch List Table */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '15px', background: '#f8fafc', borderBottom: '1px solid #eee', fontWeight: 'bold', color: '#475569' }}>
          📋 Existing Branches
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
              <th style={{ padding: '15px' }}>ID</th>
              <th style={{ padding: '15px' }}>Branch Name</th>
              <th style={{ padding: '15px' }}>Code</th>
              <th style={{ padding: '15px' }}>City</th>
              <th style={{ padding: '15px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {branches.map((branch) => (
              <tr key={branch.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '15px' }}>{branch.id}</td>
                <td style={{ padding: '15px', fontWeight: 'bold' }}>{branch.name}</td>
                <td style={{ padding: '15px' }}>{branch.code}</td>
                <td style={{ padding: '15px' }}>{branch.city}</td>
                <td style={{ padding: '15px' }}>
                  <span style={{ padding: '4px 8px', background: '#dcfce7', color: '#166534', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                    {branch.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BranchMaster;