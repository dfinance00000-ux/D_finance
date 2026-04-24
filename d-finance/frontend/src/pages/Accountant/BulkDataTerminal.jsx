import React, { useState, useEffect, useCallback } from 'react';
import API from "../../api/axios";
import { 
  FiDatabase, FiSearch, FiRefreshCw, FiArrowLeft, FiFileText, 
  FiUsers, FiChevronDown, FiChevronUp, FiX, FiFilter, FiDownload, FiMapPin, FiActivity
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const BulkDataTerminal = () => {
  const [viewMode, setViewMode] = useState('list'); 
  const [data, setData] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const currentUser = (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : { fullName: "Master Admin" };
    } catch (e) { return { fullName: "Master Admin" }; }
  })();

  const fetchBulkData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/all-loans').catch(() => ({ data: [] })); 
      setData(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch Error:", err);
      setData([]); 
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBulkData(); }, [fetchBulkData]);

  const filteredData = (data || []).filter(item => 
    (item?.customerName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (item?.loanId?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (item?.customerMobile || "").includes(searchTerm) ||
    (item?.status?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div style={loaderStyle}>
       <FiRefreshCw className="animate-spin" size={30} color="#2563eb" />
       <p style={{ fontWeight: '900', color: '#94a3b8', marginTop: '15px' }}>SYNCING MASTER LEDGER...</p>
    </div>
  );

  return (
    <div style={pageWrapper}>
      <style>{animationCSS}</style>
      
      <div style={header}>
        <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
          <button onClick={() => navigate(-1)} style={iconBtn}><FiArrowLeft /></button>
          <div>
            <h2 style={mainTitle}>Master Data Terminal</h2>
            <p style={subTitle}>Node: {currentUser?.fullName}</p>
          </div>
        </div>
        
        <div style={{display:'flex', gap:'10px'}}>
           <div style={toggleBox}>
              <button onClick={() => setViewMode('list')} style={{...tglBtn, background: viewMode === 'list' ? '#0f172a' : 'transparent', color: viewMode === 'list' ? '#fff' : '#64748b'}}><FiUsers /> List</button>
              <button onClick={() => setViewMode('report')} style={{...tglBtn, background: viewMode === 'report' ? '#0f172a' : 'transparent', color: viewMode === 'report' ? '#fff' : '#64748b'}}><FiFileText /> Report</button>
           </div>
           <button onClick={fetchBulkData} style={refreshBtn}><FiRefreshCw /></button>
        </div>
      </div>

      <div style={searchArea}>
         <div style={{flex: 1, display:'flex', alignItems:'center', gap:'12px'}}>
            <FiSearch color="#94a3b8" />
            <input style={searchInput} placeholder="Search by Name, ID, Phone or Status..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
         </div>
         <div style={insightTag}>
            <b>{filteredData.length}</b> Records Found
         </div>
      </div>

      <div style={contentGrid}>
        {viewMode === 'list' ? (
          <div style={listStack}>
            {filteredData.map(loan => (
              <div key={loan?._id || Math.random()} style={dataRow}>
                <div style={rowMain} onClick={() => setExpandedId(expandedId === loan?._id ? null : loan?._id)}>
                  <div style={rowInfo}>
                    <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                       <span style={idLabel}>{loan?.loanId || 'N/A'}</span>
                       <span style={statusBadge(loan?.status)}>{loan?.status}</span>
                    </div>
                    <h4 style={nameLabel}>{loan?.customerName || 'Unknown'}</h4>
                  </div>
                  <div style={rowStats}>
                     <div style={statUnit}><small>DISBURSED</small><b>₹{loan?.amount || 0}</b></div>
                     <div style={statUnit}><small>PENDING</small><b style={{color:'#ef4444'}}>₹{loan?.totalPending || 0}</b></div>
                     <div style={{color: '#cbd5e1'}}>{expandedId === loan?._id ? <FiChevronUp size={24}/> : <FiChevronDown size={24}/>}</div>
                  </div>
                </div>

                {expandedId === loan?._id && (
                  <div className="expand-anim" style={expandedDetails}>
                    <div style={detailGrid}>
                       <div style={detailBox}>
                          <p style={boxLabel}><FiActivity /> Repayment Ledger</p>
                          <div style={historyTableBox}>
                             <table style={table}>
                               <thead><tr style={thRow}><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
                               <tbody>
                                 {loan?.repaymentHistory?.length > 0 ? (
                                   loan.repaymentHistory.map((p, i) => (
                                     <tr key={i} style={trStyle}>
                                       <td style={tdStyle}>{p?.date ? new Date(p.date).toLocaleDateString() : 'N/A'}</td>
                                       <td style={tdStyle}>₹{p?.amount || 0}</td>
                                       <td style={tdStyle}><span style={statusBadge(p?.status)}>{p?.status}</span></td>
                                     </tr>
                                   ))
                                 ) : <tr><td colSpan="3" style={emptyMsg}>No History Available</td></tr>}
                               </tbody>
                             </table>
                          </div>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={reportTableWrapper} className="custom-scroll">
             <table style={table}>
               <thead style={stickyHead}>
                 <tr style={thRow}>
                   <th>Loan ID</th>
                   <th>Customer Name</th>
                   <th>Principal</th>
                   <th>Paid</th>
                   <th>Balance</th>
                   <th>Status</th>
                 </tr>
               </thead>
               <tbody>
                 {filteredData.map((loan, i) => (
                   <tr key={loan?._id || i} style={trStyle}>
                     <td style={tdStyle}><span style={idLabel}>{loan?.loanId}</span></td>
                     <td style={tdStyle}><b>{loan?.customerName}</b></td>
                     <td style={tdStyle}>₹{loan?.amount}</td>
                     <td style={tdStyle} style={{color:'#10b981', fontWeight:800}}>₹{loan?.totalPaid || 0}</td>
                     <td style={tdStyle} style={{color:'#ef4444', fontWeight:800}}>₹{loan?.totalPending || 0}</td>
                     <td style={tdStyle}><span style={statusBadge(loan?.status)}>{loan?.status}</span></td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        )}
      </div>
    </div>
  );
};

// --- STYLES (Fixed Missing Definitions) ---
const pageWrapper = { padding: '25px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' };
const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap:'wrap', gap:'15px' };
const mainTitle = { margin: 0, fontSize: '22px', fontWeight: '900' };
const subTitle = { margin: 0, fontSize: '10px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' };
const toggleBox = { background: '#fff', padding: '5px', borderRadius: '12px', display: 'flex', border: '1px solid #e2e8f0' };
const tglBtn = { padding: '8px 16px', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display:'flex', alignItems:'center', gap:'8px' };
const searchArea = { background: '#fff', padding: '12px 20px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px', border: '1px solid #e2e8f0' };
const searchInput = { border: 'none', outline: 'none', width: '100%', fontSize: '14px' };
const insightTag = { background: '#f1f5f9', padding: '6px 12px', borderRadius: '10px', fontSize: '11px', color: '#475569' };
const contentGrid = { display: 'block' }; // 🔥 FIXED: Defined contentGrid
const listStack = { display: 'flex', flexDirection: 'column', gap: '12px' };
const dataRow = { background: '#fff', borderRadius: '22px', border: '1px solid #e2e8f0', overflow: 'hidden' };
const rowMain = { padding: '20px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' };
const rowInfo = { display: 'flex', flexDirection: 'column', gap: '6px' };
const idLabel = { fontSize: '9px', fontWeight: '900', color: '#2563eb', background: '#eff6ff', padding: '3px 8px', borderRadius: '6px' };
const nameLabel = { margin: 0, fontSize: '16px', fontWeight: '800' };
const rowStats = { display: 'flex', alignItems: 'center', gap: '35px' };
const statUnit = { display: 'flex', flexDirection: 'column' };
const expandedDetails = { padding: '25px', background: '#fcfdfe', borderTop: '1px solid #f1f5f9' };
const detailGrid = { display: 'block' };
const detailBox = { display: 'flex', flexDirection: 'column', gap: '12px' };
const boxLabel = { margin: 0, fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', display:'flex', alignItems:'center', gap:'8px' };
const historyTableBox = { background: '#fff', borderRadius: '15px', border: '1px solid #f1f5f9', overflow: 'hidden' };
const table = { width: '100%', borderCollapse: 'collapse' };
const thRow = { textAlign: 'left', background: '#f8fafc', fontSize: '10px', color: '#94a3b8' };
const tdStyle = { padding: '14px 18px', fontSize: '13px', borderBottom: '1px solid #f8fafc' };
const trStyle = { transition: '0.2s' };
const statusBadge = (s) => ({ fontSize: '9px', fontWeight: '900', padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase', background: s === 'Approved' || s === 'Disbursed' ? '#dcfce7' : '#fef3c7', color: s === 'Approved' || s === 'Disbursed' ? '#15803d' : '#92400e' });
const reportTableWrapper = { background: '#fff', borderRadius: '22px', border: '1px solid #e2e8f0', overflowX: 'auto' };
const stickyHead = { position: 'sticky', top: 0, zIndex: 10 };
const iconBtn = { padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff' };
const refreshBtn = { padding: '10px', borderRadius: '12px', border: 'none', background: '#0f172a', color: '#fff' };
const loaderStyle = { height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' };
const emptyMsg = { textAlign: 'center', padding: '20px', color: '#cbd5e1' };
const animationCSS = ` .expand-anim { animation: slideDown 0.3s ease; } @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } } th { padding: 14px 18px; } `;

export default BulkDataTerminal;