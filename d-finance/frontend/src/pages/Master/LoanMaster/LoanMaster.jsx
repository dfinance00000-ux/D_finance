import React, { useState } from 'react';
import { FiDollarSign, FiPercent, FiCalendar, FiPieChart, FiArrowDownCircle, FiInfo } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const LoanMaster = () => {
  const [loanData, setLoanData] = useState({ principal: '', rate: '', tenure: '' });
  const [result, setResult] = useState(null);
  const [schedule, setSchedule] = useState([]);

  const calculateEMI = () => {
    const P = parseFloat(loanData.principal);
    const R = parseFloat(loanData.rate) / 12 / 100;
    const N = parseInt(loanData.tenure);

    if (P > 0 && R > 0 && N > 0) {
      const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
      const totalPayable = emi * N;
      const totalInterest = totalPayable - P;

      setResult({
        emi: emi.toFixed(0),
        totalInterest: totalInterest.toFixed(0),
        totalPayable: totalPayable.toFixed(0),
        chartData: [
          { name: 'Principal', value: P, color: '#0f172a' },
          { name: 'Interest', value: totalInterest, color: '#c58296' }
        ]
      });

      // Schedule Generation
      let currentBalance = P;
      let tempSchedule = [];
      for (let i = 1; i <= N; i++) {
        const interest = currentBalance * R;
        const principalPaid = emi - interest;
        currentBalance = currentBalance - principalPaid;
        tempSchedule.push({
          month: i,
          emi: emi.toFixed(0),
          principal: principalPaid.toFixed(0),
          interest: interest.toFixed(0),
          balance: Math.max(0, currentBalance).toFixed(0)
        });
      }
      setSchedule(tempSchedule);
    } else {
      alert("Bhai, saari details sahi se fill karo.");
    }
  };

  return (
    <div style={containerStyle}>
      {/* --- HUD: HEADER --- */}
      <div style={headerStyle}>
        <h2 style={{ margin: 0, fontWeight: 900, color: '#0f172a' }}>💰 LOAN ANALYTICS ENGINE</h2>
        <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Advanced Amortization Scheduler</p>
      </div>

      <div style={mainGrid}>
        {/* --- LEFT: CALCULATOR INPUT --- */}
        <div style={cardStyle}>
          <h3 style={cardTitle}><FiInfo /> Input Parameters</h3>
          <div style={inputGroup}>
            <div style={inputBox}>
              <label style={labelStyle}>Principal Amount (₹)</label>
              <div style={fieldWrapper}>
                <FiDollarSign style={iconStyle} />
                <input type="number" placeholder="1,00,000" style={inputStyle} value={loanData.principal} onChange={(e) => setLoanData({...loanData, principal: e.target.value})} />
              </div>
            </div>

            <div style={inputBox}>
              <label style={labelStyle}>Interest Rate (% P.A.)</label>
              <div style={fieldWrapper}>
                <FiPercent style={iconStyle} />
                <input type="number" placeholder="12" style={inputStyle} value={loanData.rate} onChange={(e) => setLoanData({...loanData, rate: e.target.value})} />
              </div>
            </div>

            <div style={inputBox}>
              <label style={labelStyle}>Tenure (Months)</label>
              <div style={fieldWrapper}>
                <FiCalendar style={iconStyle} />
                <input type="number" placeholder="12" style={inputStyle} value={loanData.tenure} onChange={(e) => setLoanData({...loanData, tenure: e.target.value})} />
              </div>
            </div>
          </div>
          <button onClick={calculateEMI} style={btnStyle}>Process Repayment View</button>
        </div>

        {/* --- RIGHT: VISUAL SUMMARY --- */}
        {result && (
          <div style={cardStyle}>
            <h3 style={cardTitle}><FiPieChart /> Breakdown Analysis</h3>
            <div style={summaryGrid}>
              <div style={{ height: '180px', width: '100%' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={result.chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {result.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={statsBox}>
                <div style={statItem}>
                  <small style={{color: '#94a3b8', fontWeight: 800}}>MONTHLY EMI</small>
                  <p style={{fontSize: '24px', fontWeight: 900, margin: 0, color: '#0f172a'}}>₹{Number(result.emi).toLocaleString()}</p>
                </div>
                <div style={statItem}>
                  <small style={{color: '#94a3b8', fontWeight: 800}}>TOTAL INTEREST</small>
                  <p style={{fontSize: '18px', fontWeight: 900, margin: 0, color: '#c58296'}}>₹{Number(result.totalInterest).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- BOTTOM: REPAYMENT SCHEDULE TABLE --- */}
      {schedule.length > 0 && (
        <div style={{ ...cardStyle, marginTop: '30px', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 25px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 900, fontSize: '14px', textTransform: 'uppercase' }}>🗓 Repayment Ledger</span>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>Total Payable: ₹{Number(result.totalPayable).toLocaleString()}</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHead}>
                  <th style={thStyle}>Month</th>
                  <th style={thStyle}>Installment</th>
                  <th style={thStyle}>Principal Paid</th>
                  <th style={thStyle}>Interest Paid</th>
                  <th style={thStyle}>O/S Balance</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row) => (
                  <tr key={row.month} style={tableRow}>
                    <td style={tdStyle}><span style={monthBadge}>{row.month}</span></td>
                    <td style={tdStyle}>₹{Number(row.emi).toLocaleString()}</td>
                    <td style={{ ...tdStyle, color: '#10b981', fontWeight: 700 }}>₹{Number(row.principal).toLocaleString()}</td>
                    <td style={{ ...tdStyle, color: '#ef4444', fontWeight: 700 }}>₹{Number(row.interest).toLocaleString()}</td>
                    <td style={{ ...tdStyle, fontWeight: 900 }}>₹{Number(row.balance).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// --- STYLES (Modern Fintech UI) ---
const containerStyle = { padding: '30px', background: '#f4f7fe', minHeight: '100vh', fontFamily: '"Inter", sans-serif' };
const headerStyle = { marginBottom: '30px', borderLeft: '5px solid #0f172a', paddingLeft: '20px' };
const mainGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px' };
const cardStyle = { background: '#fff', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #fff' };
const cardTitle = { margin: '0 0 25px 0', fontSize: '16px', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase', letterSpacing: '1px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '20px' };
const inputBox = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' };
const fieldWrapper = { position: 'relative', display: 'flex', alignItems: 'center' };
const iconStyle = { position: 'absolute', left: '15px', color: '#cbd5e1' };
const inputStyle = { width: '100%', padding: '14px 14px 14px 45px', borderRadius: '14px', border: '1.5px solid #f1f5f9', background: '#f8fafc', fontWeight: 700, outline: 'none', transition: '0.3s' };
const btnStyle = { marginTop: '25px', width: '100%', padding: '16px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: 900, fontSize: '13px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px', boxShadow: '0 10px 20px rgba(15, 23, 42, 0.15)' };

const summaryGrid = { display: 'flex', alignItems: 'center', gap: '20px' };
const statsBox = { flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' };
const statItem = { padding: '15px', background: '#f8fafc', borderRadius: '16px' };

const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const tableHead = { background: '#f8fafc', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', color: '#94a3b8' };
const tableRow = { borderBottom: '1px solid #f1f5f9', fontSize: '13px' };
const thStyle = { padding: '15px 25px', fontWeight: 800 };
const tdStyle = { padding: '15px 25px', color: '#334155', fontWeight: 500 };
const monthBadge = { padding: '4px 10px', background: '#0f172a', color: '#fff', borderRadius: '6px', fontSize: '10px', fontWeight: 900 };

export default LoanMaster;