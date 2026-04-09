import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiDollarSign, FiPercent, FiCalendar, FiPieChart, 
  FiArrowRight, FiInfo, FiTrendingUp, FiActivity, FiAlertCircle, FiClock
} from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const LoanMaster = () => {
  const [loanData, setLoanData] = useState({ 
    principal: 10000, 
    months: 1, 
    delayWeeks: 0 
  });
  const [result, setResult] = useState(null);
  const [schedule, setSchedule] = useState([]);

  const calculateFinance = useCallback(() => {
    const P = parseFloat(loanData.principal);
    const M = parseInt(loanData.months);
    const W = parseInt(loanData.delayWeeks) || 0;

    if (P >= 10000 && M > 0) {
      // --- Calculations as per your formula ---
      const processingFee = P * 0.02;
      const monthlyInterestTotal = P * 0.10 * M;
      const delayPenalty = P * 0.10 * W;
      
      const totalPayable = P + monthlyInterestTotal + processingFee + delayPenalty;
      const emi = totalPayable / M;

      setResult({
        emi: emi.toFixed(0),
        processingFee: processingFee.toFixed(0),
        interest: monthlyInterestTotal.toFixed(0),
        penalty: delayPenalty.toFixed(0),
        totalPayable: totalPayable.toFixed(0),
        chartData: [
          { name: 'Principal', value: P, color: '#6366f1' },
          { name: 'Interest', value: monthlyInterestTotal, color: '#10b981' },
          { name: 'Charges/Penalty', value: processingFee + delayPenalty, color: '#f43f5e' }
        ]
      });

      // --- Installment Ledger ---
      let tempSchedule = [];
      for (let i = 1; i <= M; i++) {
        tempSchedule.push({
          month: i,
          installment: emi.toFixed(0),
          // Ledger shows flat distribution for simple interest business model
          principalPart: (P / M).toFixed(0),
          interestPart: (monthlyInterestTotal / M).toFixed(0),
          penaltyPart: (delayPenalty / M).toFixed(0)
        });
      }
      setSchedule(tempSchedule);
    }
  }, [loanData]);

  useEffect(() => {
    calculateFinance();
  }, [calculateFinance]);

  return (
    <div style={containerStyle}>
      {/* --- HEADER --- */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={logoBadge}><FiActivity size={24} /></div>
            <div>
                <h2 style={mainTitle}>FINANCE ANALYTICS ENGINE</h2>
                <p style={subTitleText}>P + (10% Month) + (2% Process) + (10% Weekly Delay)</p>
            </div>
        </div>
      </div>

      <div style={mainGrid}>
        {/* --- INPUTS --- */}
        <div style={cardStyle}>
          <h3 style={cardTitle}><FiTrendingUp /> Loan Parameters</h3>
          <div style={inputGroup}>
            <div style={inputBox}>
                <label style={labelStyle}>Loan Principal (Min ₹10,000)</label>
                <input type="number" style={inputStyle} value={loanData.principal} 
                    onChange={(e) => setLoanData({...loanData, principal: e.target.value})} />
            </div>

            <div style={inputBox}>
                <label style={labelStyle}>Tenure (Total Months)</label>
                <input type="number" style={inputStyle} value={loanData.months} 
                    onChange={(e) => setLoanData({...loanData, months: e.target.value})} />
            </div>

            <div style={inputBox}>
                <label style={{...labelStyle, color: '#f43f5e'}}>Delay Weeks (Penalty 10%/wk)</label>
                <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                    <FiClock style={{position: 'absolute', left: '15px', color: '#f43f5e'}} />
                    <input type="number" style={{...inputStyle, borderColor: '#fecaca', paddingLeft: '45px'}} 
                        value={loanData.delayWeeks} 
                        onChange={(e) => setLoanData({...loanData, delayWeeks: e.target.value})} />
                </div>
            </div>
          </div>
        </div>

        {/* --- VISUAL BREAKDOWN --- */}
        <div style={cardStyle}>
          <h3 style={cardTitle}><FiPieChart /> Payment Split</h3>
          {result && (
            <div style={summaryGrid}>
              <div style={{ height: '200px', width: '50%' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={result.chartData} innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value">
                      {result.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={statsBox}>
                <div style={statItem('#eef2ff', '#6366f1')}>
                    <small>EMI AMOUNT</small>
                    <p>₹{Number(result.emi).toLocaleString()}</p>
                </div>
                <div style={statItem('#f0fdf4', '#10b981')}>
                    <small>TOTAL INTEREST</small>
                    <p>₹{Number(result.interest).toLocaleString()}</p>
                </div>
                <div style={statItem('#fff1f2', '#f43f5e')}>
                    <small>DELAY PENALTY</small>
                    <p>₹{Number(result.penalty).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- BREAKDOWN CARDS --- */}
      {result && (
          <div style={breakdownContainer}>
              <div style={bCard}>
                  <FiInfo color="#6366f1" />
                  <span>Processing Fee (2%): <b>₹{Number(result.processingFee).toLocaleString()}</b></span>
              </div>
              <div style={{...bCard, borderColor: '#10b981'}}>
                  <FiArrowRight color="#10b981" />
                  <span>Total Repayable: <b style={{fontSize: '18px'}}>₹{Number(result.totalPayable).toLocaleString()}</b></span>
              </div>
          </div>
      )}

      {/* --- AMORTIZATION TABLE --- */}
      {schedule.length > 0 && (
        <div style={{ ...cardStyle, marginTop: '30px', padding: 0, overflow: 'hidden' }}>
          <div style={ledgerHeader}>
            <span style={{ fontWeight: 900 }}>🗓 INSTALLMENT LEDGER (M={loanData.months})</span>
          </div>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHead}>
                <th style={thStyle}>No.</th>
                <th style={thStyle}>Installment</th>
                <th style={thStyle}>Principal</th>
                <th style={thStyle}>Interest (10%)</th>
                <th style={thStyle}>Penalty (W)</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row) => (
                <tr key={row.month} style={tableRow}>
                  <td style={tdStyle}><span style={monthBadge}>{row.month}</span></td>
                  <td style={{...tdStyle, fontWeight: 800, color: '#0f172a'}}>₹{Number(row.installment).toLocaleString()}</td>
                  <td style={tdStyle}>₹{Number(row.principalPart).toLocaleString()}</td>
                  <td style={{...tdStyle, color: '#10b981'}}>₹{Number(row.interestPart).toLocaleString()}</td>
                  <td style={{...tdStyle, color: '#f43f5e'}}>₹{Number(row.penaltyPart).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// --- STYLES ---
const containerStyle = { padding: '30px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' };
const headerStyle = { marginBottom: '30px' };
const logoBadge = { background: '#0f172a', color: '#fff', padding: '12px', borderRadius: '12px' };
const mainTitle = { margin: 0, fontWeight: 900, fontSize: '22px' };
const subTitleText = { margin: 0, color: '#94a3b8', fontSize: '12px', fontWeight: 600 };
const mainGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '25px' };
const cardStyle = { background: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const cardTitle = { margin: '0 0 20px 0', fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '20px' };
const inputBox = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { fontSize: '10px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase' };
const inputStyle = { width: '100%', padding: '14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', fontWeight: 700 };
const summaryGrid = { display: 'flex', alignItems: 'center', gap: '20px' };
const statsBox = { flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' };
const statItem = (bg, color) => ({ padding: '12px', background: bg, borderRadius: '15px', border: `1px solid ${color}20`, color: color });
const breakdownContainer = { display: 'flex', gap: '20px', marginTop: '25px' };
const bCard = { flex: 1, background: '#fff', padding: '20px', borderRadius: '18px', border: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' };
const ledgerHeader = { padding: '20px', borderBottom: '1px solid #f1f5f9', background: '#fff' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', background: '#fff' };
const tableHead = { background: '#f8fafc', textAlign: 'left', fontSize: '10px', color: '#94a3b8' };
const tableRow = { borderBottom: '1px solid #f8fafc' };
const thStyle = { padding: '15px 20px' };
const tdStyle = { padding: '15px 20px', fontSize: '13px', fontWeight: 600 };
const monthBadge = { padding: '4px 8px', background: '#0f172a', color: '#fff', borderRadius: '6px', fontSize: '10px' };

export default LoanMaster;