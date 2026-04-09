import React, { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';
import { 
  FiSearch, FiClock, FiCheckCircle, FiXCircle, 
  FiShield, FiCalendar, FiAlertTriangle, FiArrowRight 
} from 'react-icons/fi';

const LoanTracking = () => {
  const [loans, setLoans] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const fetchLoans = useCallback(async () => {
    if (!user.id && !user._id) return;
    try {
      const response = await API.get(`/loans?customerId=${user.id || user._id}`);
      setLoans(response.data.reverse());
    } catch (error) {
      console.error("Tracking Sync Error:", error);
    } finally {
      setLoading(false);
    }
  }, [user.id, user._id]);

  useEffect(() => {
    fetchLoans();
    const interval = setInterval(fetchLoans, 10000);
    return () => clearInterval(interval);
  }, [fetchLoans]);

  const filteredLoans = loans.filter(loan => 
    (loan.loanId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (loan.type || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Disbursed': 
        return { bg: '#dcfce7', text: '#166534', icon: <FiCheckCircle />, label: 'Payment Received' };
      case 'Rejected': 
        return { bg: '#fee2e2', text: '#991b1b', icon: <FiXCircle />, label: 'Application Rejected' };
      case 'Field Verified': 
        return { bg: '#e0f2fe', text: '#0369a1', icon: <FiShield />, label: 'LUC Verified' };
      case 'Approved': 
        return { bg: '#f0f9ff', text: '#0284c7', icon: <FiCheckCircle />, label: 'Ready for Payout' };
      default: 
        return { bg: '#fef3c7', text: '#92400e', icon: <FiClock />, label: 'Review Pending' };
    }
  };

  return (
    <div style={{ padding: '25px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header Area */}
      <div style={headerSection}>
        <div>
          <h2 style={mainTitle}>📡 MY LOAN TRACKER</h2>
          <p style={subTitleText}>Real-time processing status of your micro-finance applications.</p>
        </div>
        <div style={searchWrapper}>
          <FiSearch style={searchIcon} />
          <input 
            type="text" 
            placeholder="Search Loan ID..." 
            style={searchBar} 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={loaderBox}>🔄 SYNCING WITH D-FINANCE CORE...</div>
      ) : filteredLoans.length === 0 ? (
        <div style={emptyState}>
          <div style={{fontSize: '50px'}}>📁</div>
          <h3 style={{margin: '10px 0', color: '#1e293b'}}>No Loan Records Found</h3>
          <p style={{color: '#94a3b8', fontSize: '14px'}}>Your applications will appear here once submitted.</p>
        </div>
      ) : (
        <div style={gridContainer}>
          {filteredLoans.map((loan) => {
            const style = getStatusStyle(loan.status);
            return (
              <div key={loan._id} style={loanCard}>
                <div style={cardHeader}>
                  <span style={loanIdTag}>ID: {loan.loanId}</span>
                  <span style={{ ...statusBadge, background: style.bg, color: style.text }}>
                    {style.icon} {style.label}
                  </span>
                </div>
                
                {loan.status === 'Rejected' && (
                  <div style={rejectionAlert}>
                    <FiAlertTriangle size={18} style={{marginTop: '2px'}} />
                    <div>
                      <b style={{display: 'block', fontSize: '11px', textTransform: 'uppercase'}}>Rejection Reason</b>
                      <span>{loan.rejectionReason || "Please visit branch office for clarification."}</span>
                    </div>
                  </div>
                )}

                <div style={cardBody}>
                   <div style={mainInfo}>
                      <label style={infoLabel}>SANCTIONED AMOUNT</label>
                      <h2 style={{ margin: 0, color: '#0f172a', fontWeight: '950', fontSize: '24px' }}>₹{loan.amount?.toLocaleString()}</h2>
                   </div>

                   <div style={emiHighlight}>
                      <label style={{...infoLabel, color: '#2563eb'}}>DAILY EMI</label>
                      <h3 style={{ margin: 0, color: '#2563eb', fontWeight: '900', fontSize: '20px' }}>₹{loan.dailyEMI || loan.weeklyEMI || 0}</h3>
                   </div>
                </div>

                <div style={detailsGrid}>
                  <div style={infoGroup}>
                    <label style={infoLabel}>DISBURSEMENT</label>
                    <span style={infoValue}>₹{loan.netDisbursed || '---'}</span>
                  </div>
                  <div style={infoGroup}>
                    <label style={infoLabel}>TENURE</label>
                    <span style={infoValue}>{loan.tenureMonths} Months</span>
                  </div>
                  <div style={infoGroup}>
                    <label style={infoLabel}>TOTAL PAYABLE</label>
                    <span style={infoValue}>₹{loan.totalPayable?.toLocaleString()}</span>
                  </div>
                  <div style={infoGroup}>
                    <label style={infoLabel}>NEXT DUE</label>
                    <span style={{...infoValue, color: '#ef4444'}}>
                       {loan.nextEmiDate ? new Date(loan.nextEmiDate).toLocaleDateString() : 'TBD'}
                    </span>
                  </div>
                </div>

                <div style={cardFooter}>
                  <button style={detailBtn} onClick={() => alert(`Applied on: ${new Date(loan.appliedDate).toLocaleDateString()}`)}>View Ledger</button>
                  {loan.status === 'Disbursed' && (
                    <button 
                      style={repayBtn} 
                      onClick={() => window.location.href='/customer/emi'}
                    >
                      Pay Daily Due <FiArrowRight />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// --- ALL STYLES (Fixed Missing References) ---
const headerSection = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', flexWrap: 'wrap', gap: '20px' };
const mainTitle = { margin: 0, fontWeight: 950, fontSize: '30px', color: '#0f172a', letterSpacing: '-1.5px' };
const subTitleText = { color: '#64748b', fontSize: '13px', fontWeight: '500', marginTop: '5px' };

const searchWrapper = { position: 'relative', display: 'flex', alignItems: 'center' };
const searchIcon = { position: 'absolute', left: '15px', color: '#94a3b8' };
const searchBar = { padding: '14px 15px 14px 45px', borderRadius: '15px', border: '1.5px solid #e2e8f0', width: '300px', outline: 'none', fontSize: '14px', fontWeight: '600', background: '#fff' };

const gridContainer = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' };
const loanCard = { background: '#fff', borderRadius: '30px', padding: '25px', boxShadow: '0 10px 25px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' };

const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' };
const loanIdTag = { fontSize: '10px', fontWeight: '900', color: '#64748b', background: '#f1f5f9', padding: '6px 12px', borderRadius: '10px', letterSpacing: '0.5px' };
const statusBadge = { padding: '8px 14px', borderRadius: '12px', fontSize: '11px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px' };

const rejectionAlert = { background: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', padding: '15px', borderRadius: '18px', fontSize: '12px', display: 'flex', gap: '12px', marginBottom: '20px' };

// 🔥 Inhe define na karne ki wajah se error aa raha tha
const cardBody = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '20px', borderRadius: '22px', marginBottom: '20px' };
const mainInfo = { display: 'flex', flexDirection: 'column' };
const emiHighlight = { textAlign: 'right', display: 'flex', flexDirection: 'column' };
const infoLabel = { fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' };

const detailsGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px', padding: '0 5px' };
const infoGroup = { display: 'flex', flexDirection: 'column', gap: '2px' };
const infoValue = { fontSize: '14px', fontWeight: '800', color: '#1e293b' };

const cardFooter = { display: 'flex', gap: '12px', marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '20px' };
const detailBtn = { flex: 1, padding: '14px', borderRadius: '14px', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '12px', fontWeight: '800', cursor: 'pointer', color: '#64748b' };
const repayBtn = { flex: 1, padding: '14px', borderRadius: '14px', border: 'none', background: '#10b981', color: '#fff', fontSize: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' };

const loaderBox = { textAlign: 'center', padding: '100px', color: '#94a3b8', fontWeight: '800', fontSize: '18px' };
const emptyState = { textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: '35px', border: '2px dashed #e2e8f0', gridColumn: '1/-1' };

export default LoanTracking;