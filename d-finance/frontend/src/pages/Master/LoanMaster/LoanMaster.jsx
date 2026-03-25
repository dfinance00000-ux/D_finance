import React, { useState } from 'react';

const LoanMaster = () => {
  const [loanData, setLoanData] = useState({
    principal: '',
    rate: '',
    tenure: ''
  });
  const [emiResult, setEmiResult] = useState(null);
  const [schedule, setSchedule] = useState([]);

  const calculateEMI = () => {
    const P = parseFloat(loanData.principal);
    const R = parseFloat(loanData.rate) / 12 / 100;
    const N = parseInt(loanData.tenure);

    if (P && R && N) {
      // EMI Calculation Formula
      const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
      setEmiResult(emi.toFixed(2));

      // Schedule Generation
      let currentBalance = P;
      let tempSchedule = [];
      for (let i = 1; i <= N; i++) {
        const interest = currentBalance * R;
        const principalPaid = emi - interest;
        currentBalance = currentBalance - principalPaid;
        tempSchedule.push({
          month: i,
          emi: emi.toFixed(2),
          principal: principalPaid.toFixed(2),
          interest: interest.toFixed(2),
          balance: Math.max(0, currentBalance).toFixed(2)
        });
      }
      setSchedule(tempSchedule);
    } else {
      alert("Please enter all values correctly.");
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      {/* Calculator Box */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '1px solid #eee' }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#1e293b' }}>💰 Loan EMI Calculator</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>Principal (₹)</label>
            <input 
              type="number" 
              placeholder="e.g. 100000"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
              value={loanData.principal}
              onChange={(e) => setLoanData({...loanData, principal: e.target.value})}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>Interest Rate (%)</label>
            <input 
              type="number" 
              placeholder="Annual Rate"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
              value={loanData.rate}
              onChange={(e) => setLoanData({...loanData, rate: e.target.value})}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>Tenure (Months)</label>
            <input 
              type="number" 
              placeholder="e.g. 12"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
              value={loanData.tenure}
              onChange={(e) => setLoanData({...loanData, tenure: e.target.value})}
            />
          </div>
        </div>

        <button 
          onClick={calculateEMI}
          style={{ marginTop: '20px', width: '100%', padding: '14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Calculate Monthly EMI
        </button>

        {emiResult && (
          <div style={{ marginTop: '20px', padding: '15px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', color: '#0369a1' }}>Monthly Installment:</span>
            <span style={{ fontSize: '24px', fontWeight: '900', color: '#0369a1' }}>₹{emiResult}</span>
          </div>
        )}
      </div>

      {/* Schedule Table */}
      {schedule.length > 0 && (
        <div style={{ marginTop: '30px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ padding: '15px', background: '#f8fafc', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>🗓 Repayment Schedule</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>Month</th>
                <th style={{ padding: '12px' }}>EMI</th>
                <th style={{ padding: '12px' }}>Principal</th>
                <th style={{ padding: '12px' }}>Interest</th>
                <th style={{ padding: '12px' }}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row) => (
                <tr key={row.month} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px' }}>{row.month}</td>
                  <td style={{ padding: '12px' }}>₹{row.emi}</td>
                  <td style={{ padding: '12px', color: '#059669' }}>₹{row.principal}</td>
                  <td style={{ padding: '12px', color: '#dc2626' }}>₹{row.interest}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>₹{row.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LoanMaster;