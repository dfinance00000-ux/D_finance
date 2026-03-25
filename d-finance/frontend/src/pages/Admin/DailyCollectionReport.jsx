import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { FiCalendar, FiDownload, FiDollarSign } from 'react-icons/fi';

const DailyCollectionReport = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalToday, setTotalToday] = useState(0);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await API.get('/admin/collection-report');
        setCollections(res.data);
        
        // Aaj ka total calculate karna
        const total = res.data.reduce((sum, p) => sum + p.amount, 0);
        setTotalToday(total);
      } catch (err) {
        console.error("Collection Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  return (
    <div style={{ padding: '30px', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={headerStyle}>
        <div>
          <h2 style={{ color: '#1e293b', margin: 0, fontWeight: '900' }}>📅 Daily Collection Report</h2>
          <p style={{ color: '#64748b', fontSize: '13px' }}>Real-time EMI Recovery Tracking | Mathura Branch</p>
        </div>
        <div style={todayBadge}>
          <FiDollarSign />
          <span>Today's Cash-In: <strong>₹{totalToday.toLocaleString()}</strong></span>
        </div>
      </div>

      {loading ? (
        <div style={loaderStyle}>Syncing Transactions...</div>
      ) : (
        <div style={tableCard}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeader}>
                <th>TIME</th>
                <th>RECEIPT ID</th>
                <th>CUSTOMER NAME</th>
                <th>LOAN ID</th>
                <th>AMOUNT</th>
                <th>METHOD</th>
              </tr>
            </thead>
            <tbody>
              {collections.length > 0 ? collections.map((pay) => (
                <tr key={pay._id} style={tableRow}>
                  <td style={{ color: '#94a3b8' }}>{new Date(pay.paymentDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                  <td style={{ fontWeight: 'bold' }}>{pay.receiptId}</td>
                  <td>{pay.customerName}</td>
                  <td><span style={idTag}>{pay.loanId}</span></td>
                  <td style={{ fontWeight: '900', color: '#059669' }}>₹{pay.amount}</td>
                  <td><span style={methodTag}>{pay.method}</span></td>
                </tr>
              )) : (
                <tr><td colSpan="6" style={emptyText}>Aaj abhi tak koi payment nahi aayi hai.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// --- Styles ---
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const todayBadge = { background: '#059669', color: '#fff', padding: '12px 20px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 15px -3px rgba(5, 150, 105, 0.3)' };
const tableCard = { background: '#fff', borderRadius: '24px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflowX: 'auto' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const tableHeader = { borderBottom: '2px solid #f1f5f9', color: '#94a3b8', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' };
const tableRow = { borderBottom: '1px solid #f8fafc', fontSize: '14px', color: '#1e293b' };
const idTag = { background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' };
const methodTag = { fontSize: '10px', fontWeight: '900', color: '#2563eb', textTransform: 'uppercase', border: '1px solid #dbeafe', padding: '2px 8px', borderRadius: '5px' };
const loaderStyle = { textAlign: 'center', padding: '100px', color: '#64748b', fontWeight: 'bold' };
const emptyText = { textAlign: 'center', padding: '40px', color: '#94a3b8' };

export default DailyCollectionReport;