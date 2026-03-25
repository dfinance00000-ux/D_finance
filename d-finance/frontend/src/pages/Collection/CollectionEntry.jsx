
import React, { useState } from 'react';

const CollectionEntry = () => {
  const [searchId, setSearchId] = useState('');
  const [collection, setCollection] = useState({
    loanId: '', custName: '', emiAmount: 0, lateFine: 0, totalPayable: 0, mode: 'Cash'
  });

  const handleSearch = () => {
    // Demo Search Logic
    if(searchId === 'L101') {
      setCollection({
        loanId: 'L101', custName: 'Rajesh Kumar', emiAmount: 2500, lateFine: 50, totalPayable: 2550, mode: 'Cash'
      });
    } else {
      alert("Loan ID not found! Try 'L101' for demo.");
    }
  };

  const cardStyle = {
    background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
  };

  const inputStyle = {
    width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '8px'
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#1e293b', marginBottom: '20px' }}>💸 EMI Collection / Receipt</h2>

      {/* Step 1: Search Loan */}
      <div style={{ ...cardStyle, marginBottom: '25px', borderLeft: '5px solid #3b82f6' }}>
        <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Enter Loan ID / Member ID</label>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <input 
            type="text" 
            placeholder="Search e.g. L101" 
            style={{ ...inputStyle, marginTop: 0, flex: 1 }}
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
          <button onClick={handleSearch} style={{ padding: '0 25px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            Fetch Details
          </button>
        </div>
      </div>

      {/* Step 2: Collection Form (Only shows if searched) */}
      {collection.loanId && (
        <div style={cardStyle} className="animate-fadeIn">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            {/* Left: Customer Info */}
            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '10px' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#1e293b' }}>Customer Summary</h4>
              <p style={{ fontSize: '14px', marginBottom: '8px' }}><b>Name:</b> {collection.custName}</p>
              <p style={{ fontSize: '14px', marginBottom: '8px' }}><b>Loan ID:</b> {collection.loanId}</p>
              <p style={{ fontSize: '14px', marginBottom: '8px' }}><b>EMI Amount:</b> ₹{collection.emiAmount}</p>
              <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '15px 0' }} />
              <p style={{ fontSize: '18px', color: '#10b981', fontWeight: 'bold' }}>Total Due: ₹{collection.totalPayable}</p>
            </div>

            {/* Right: Payment Entry */}
            <div>
              <h4 style={{ margin: '0 0 15px 0', color: '#1e293b' }}>Payment Details</h4>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Late Fine (if any)</label>
              <input type="number" style={inputStyle} value={collection.lateFine} 
                onChange={(e) => setCollection({...collection, lateFine: e.target.value})} />
              
              <div style={{ marginTop: '15px' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Payment Mode</label>
                <select style={inputStyle}>
                  <option>Cash</option>
                  <option>Bank Transfer / UPI</option>
                  <option>Cheque</option>
                </select>
              </div>

              <button style={{ 
                width: '100%', marginTop: '25px', padding: '15px', background: '#10b981', color: '#fff', 
                border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px'
              }}>
                Confirm & Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionEntry;