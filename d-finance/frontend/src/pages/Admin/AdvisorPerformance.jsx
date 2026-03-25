import React, { useState, useEffect } from 'react';
import API from '../../api/axios';

const AdvisorPerformance = () => {
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        // Backend se saare users aur unki loan history fetch karna
        const [userRes, loanRes] = await Promise.all([
          API.get('/admin/all-users'), // Ek naya route jo saare 'User' role wale advisors laye
          API.get('/admin/all-loans')
        ]);

        const advisorList = userRes.data.filter(u => u.role === 'User');
        const loans = loanRes.data;

        // Har advisor ke liye math calculate karna
        const performanceData = advisorList.map(adv => {
          const advLoans = loans.filter(l => l.advisorId === adv._id && l.status === 'Approved');
          const totalBusiness = advLoans.reduce((sum, l) => sum + l.amount, 0);
          const commission = (totalBusiness * 0.05).toFixed(2); // 5% Standard Commission

          return {
            ...adv,
            fileCount: advLoans.length,
            totalBusiness,
            commission
          };
        });

        setAdvisors(performanceData);
      } catch (err) {
        console.error("Commission Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, []);

  return (
    <div style={{ padding: '30px', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={headerStyle}>
        <h2 style={{ color: '#1e293b', margin: 0 }}>💰 Advisor Commission Tracking</h2>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Mathura Branch | 5% Direct Slab Calculation</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>Calculating Payouts...</div>
      ) : (
        <div style={tableContainer}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeader}>
                <th>ADVISOR NAME</th>
                <th>MOBILE</th>
                <th>APPROVED FILES</th>
                <th>TOTAL BUSINESS</th>
                <th style={{ color: '#059669' }}>EARNED COMMISSION</th>
              </tr>
            </thead>
            <tbody>
              {advisors.map(adv => (
                <tr key={adv._id} style={tableRow}>
                  <td style={{ fontWeight: 'bold', color: '#1e293b' }}>{adv.fullName}</td>
                  <td style={{ color: '#64748b' }}>{adv.mobile}</td>
                  <td><span style={badge}>{adv.fileCount} Files</span></td>
                  <td style={{ fontWeight: 'bold' }}>₹{adv.totalBusiness.toLocaleString()}</td>
                  <td style={{ color: '#059669', fontWeight: '900', fontSize: '16px' }}>₹{adv.commission}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// --- Professional Styles ---
const headerStyle = { marginBottom: '30px', borderLeft: '5px solid #059669', paddingLeft: '15px' };
const tableContainer = { background: '#fff', borderRadius: '20px', padding: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.02)', overflowX: 'auto' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const tableHeader = { borderBottom: '2px solid #f1f5f9', color: '#94a3b8', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' };
const tableRow = { borderBottom: '1px solid #f8fafc', transition: '0.3s' };
const badge = { background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', color: '#475569' };

export default AdvisorPerformance;