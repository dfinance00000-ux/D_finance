import React, { useState, useEffect, useCallback } from 'react';
import API from "../../api/axios";
import { 
  FiUser, FiDollarSign, FiClock, FiSearch, FiRefreshCw, 
  FiArrowLeft, FiList, FiCheckCircle, FiTrendingUp, FiX, FiChevronDown, FiChevronUp 
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const AccountantReports = () => {
  const [viewMode, setViewMode] = useState('portfolio'); 
  const [customers, setCustomers] = useState([]);
  const [expandedId, setExpandedId] = useState(null); // Track which customer's history is open
  const [dailyReport, setDailyReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resLoans, resDaily] = await Promise.all([
        API.get('/admin/all-loans'),
        API.get('/admin/collection-report')
      ]);
      setCustomers(resLoans.data || []);
      setDailyReport(resDaily.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleHistory = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredCustomers = customers.filter(c => 
    c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.loanId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div style={loaderStyle}>🔄 SYNCING D-FINANCE LEDGER...</div>;

  return (
    <div style={pageWrapper}>
      <style>{extraCSS}</style>

      {/* --- HEADER --- */}
      <div style={header}>
        <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
          <button onClick={() => navigate(-1)} style={iconBtn}><FiArrowLeft /></button>
          <h2 style={mainTitle}>Finance Terminal</h2>
        </div>

        <div style={toggleContainer}>
          <button 
            onClick={() => setViewMode('portfolio')} 
            style={{...toggleBtn, background: viewMode === 'portfolio' ? '#0f172a' : 'transparent', color: viewMode === 'portfolio' ? '#fff' : '#64748b'}}
          >
            <FiUser /> Portfolio
          </button>
          <button 
            onClick={() => setViewMode('collection')} 
            style={{...toggleBtn, background: viewMode === 'collection' ? '#0f172a' : 'transparent', color: viewMode === 'collection' ? '#fff' : '#64748b'}}
          >
            <FiTrendingUp /> Collection
          </button>
        </div>

        <button onClick={fetchData} style={refreshBtn}><FiRefreshCw /></button>
      </div>

      {/* --- CONTENT --- */}
      <div style={contentArea}>
        
        {viewMode === 'portfolio' ? (
          <div className="fade-in">
            <div style={searchBarWrapper}>
              <FiSearch color="#94a3b8" />
              <input style={searchInput} placeholder="Search by name or loan ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <div style={listContainer}>
              {filteredCustomers.map(cust => (
                <div key={cust._id} style={custWrapper}>
                  {/* Customer Main Card */}
                  <div onClick={() => toggleHistory(cust._id)} style={{...custCard, borderBottom: expandedId === cust._id ? '1px solid #f1f5f9' : 'none'}}>
                    <div style={cardInfo}>
                      <div style={avatar}>{cust.customerName.charAt(0)}</div>
                      <div>
                        <h4 style={custName}>{cust.customerName}</h4>
                        <span style={idTag}>{cust.loanId}</span>
                      </div>
                    </div>
                    <div style={cardRight}>
                      <div style={amtGroup}>
                        <p style={labelSmall}>BALANCE</p>
                        <p style={balanceVal}>₹{cust.totalPending || 0}</p>
                      </div>
                      {expandedId === cust._id ? <FiChevronUp size={20}/> : <FiChevronDown size={20}/>}
                    </div>
                  </div>

                  {/* 🔥 IN-LINE HISTORY SECTION (Replaces Popup) */}
                  {expandedId === cust._id && (
                    <div className="slide-down" style={historySection}>
                      <div style={historyHeader}>
                         <h5 style={historyTitle}>Payment Ledger History</h5>
                         <button onClick={() => setExpandedId(null)} style={closeInlineBtn}><FiX /> Close History</button>
                      </div>
                      
                      <div style={historyStats}>
                         <div style={hStat}><span>Total Principal</span><b>₹{cust.amount}</b></div>
                         <div style={hStat}><span>Total Paid</span><b style={{color:'#10b981'}}>₹{cust.totalPaid || 0}</b></div>
                      </div>

                      <div style={tableWrapper}>
                        <table style={table}>
                          <thead>
                            <tr style={thRow}>
                              <th>Date</th>
                              <th>Amount</th>
                              <th>UTR Number</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cust.repaymentHistory && cust.repaymentHistory.length > 0 ? (
                              cust.repaymentHistory.map((pay, i) => (
                                <tr key={i} style={trStyle}>
                                  <td style={tdStyle}>{new Date(pay.date).toLocaleDateString()}</td>
                                  <td style={tdStyle}><b>₹{pay.amount}</b></td>
                                  <td style={tdStyle}><code style={utrBox}>{pay.utr}</code></td>
                                  <td style={tdStyle}><span style={pay.status === 'Approved' ? approvedBadge : pendingBadge}>{pay.status}</span></td>
                                </tr>
                              ))
                            ) : (
                              <tr><td colSpan="4" style={emptyRow}>No payment records found.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* --- COLLECTION REPORT MODE --- */
          <div className="fade-in">
            <div style={summaryBanner}>
              <div>
                <p style={{margin:0, color:'#94a3b8', fontSize:'11px', fontWeight:800}}>TOTAL RECOVERY TODAY</p>
                <h1 style={{margin:0, fontSize:'36px', fontWeight:900}}>₹{dailyReport.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}</h1>
              </div>
              <FiCheckCircle size={40} color="#10b981" />
            </div>
            
            <div style={tableCard}>
              <table style={table}>
                <thead>
                  <tr style={thRow}>
                    <th>Time</th>
                    <th>Customer Name</th>
                    <th>Loan ID</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyReport.map((rep, i) => (
                    <tr key={i} style={trStyle}>
                      <td style={tdStyle}>{new Date(rep.date || rep.paymentDate).toLocaleTimeString()}</td>
                      <td style={tdStyle}><b>{rep.customerName}</b></td>
                      <td style={tdStyle}><span style={idTag}>{rep.loanId}</span></td>
                      <td style={tdStyle}><span style={{color:'#10b981', fontWeight:900}}>+₹{rep.amount}</span></td>
                      <td style={tdStyle}><span style={approvedBadge}>Approved</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- STYLING ---
const pageWrapper = { padding: '20px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' };
const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap:'wrap', gap:'15px' };
const mainTitle = { margin: 0, fontSize: '18px', fontWeight: '900', color: '#0f172a' };
const toggleContainer = { background: '#fff', padding: '5px', borderRadius: '14px', display: 'flex', gap: '5px', border: '1px solid #e2e8f0' };
const toggleBtn = { padding: '8px 16px', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };

const contentArea = { maxWidth: '1000px', margin: '0 auto' };
const searchBarWrapper = { background: '#fff', padding: '12px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' };
const searchInput = { border: 'none', outline: 'none', width: '100%', fontSize: '14px', fontWeight: '600' };

const listContainer = { display: 'flex', flexDirection: 'column', gap: '12px' };
const custWrapper = { background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' };
const custCard = { padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' };
const cardInfo = { display: 'flex', alignItems: 'center', gap: '15px' };
const avatar = { width: '45px', height: '45px', background: '#0f172a', color: '#fff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '18px' };
const custName = { margin: '0 0 5px 0', fontSize: '15px', fontWeight: '800' };
const idTag = { fontSize: '10px', fontWeight: '900', color: '#2563eb', background: '#eff6ff', padding: '3px 8px', borderRadius: '6px' };
const cardRight = { display: 'flex', alignItems: 'center', gap: '25px', color: '#94a3b8' };
const balanceVal = { margin: 0, fontSize: '16px', fontWeight: '900', color: '#ef4444' };

const historySection = { background: '#fafbfc', padding: '25px', borderTop: '1px solid #f1f5f9' };
const historyHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const historyTitle = { margin: 0, fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', color: '#64748b' };
const closeInlineBtn = { background: '#fff', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' };

const historyStats = { display: 'flex', gap: '15px', marginBottom: '20px' };
const hStat = { flex: 1, background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '3px' };

const tableWrapper = { background: '#fff', borderRadius: '12px', border: '1px solid #f1f5f9', overflowX: 'auto' };
const table = { width: '100%', borderCollapse: 'collapse', minWidth: '500px' };
const thRow = { textAlign: 'left', background: '#f8fafc', fontSize: '11px', color: '#94a3b8' };
const tdStyle = { padding: '12px 15px', fontSize: '12px', borderBottom: '1px solid #f8fafc' };
const trStyle = { transition: '0.2s' };
const utrBox = { background: '#f1f5f9', padding: '3px 6px', borderRadius: '4px', fontSize: '10px' };
const approvedBadge = { background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '6px', fontSize: '9px', fontWeight: '900' };
const pendingBadge = { background: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '6px', fontSize: '9px', fontWeight: '900' };

const summaryBanner = { background: '#0f172a', color: '#fff', padding: '30px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' };
const tableCard = { background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden' };

const labelSmall = { margin: 0, fontSize: '8px', fontWeight: '800', color: '#94a3b8' };
const amtGroup = { textAlign: 'right' };
const emptyRow = { textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '12px' };
const loaderStyle = { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#94a3b8' };
const iconBtn = { padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' };
const refreshBtn = { padding: '10px', borderRadius: '12px', border: 'none', background: '#0f172a', color: '#fff', cursor: 'pointer' };

const extraCSS = `
  .fade-in { animation: fadeIn 0.3s ease-in; }
  .slide-down { animation: slideDown 0.3s ease-out; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  th { padding: 12px 15px; }
`;

export default AccountantReports;