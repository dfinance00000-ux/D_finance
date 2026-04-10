import React, { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';
import PaymentModal from '../Payment/PaymentModal'; // Modal import
import { 
  FiSearch, FiClock, FiCheckCircle, FiXCircle, 
  FiShield, FiCalendar, FiAlertTriangle, FiArrowRight, 
  FiList, FiMaximize, FiDollarSign, FiInfo, FiX
} from 'react-icons/fi';

const LoanTracking = () => {
  const [loans, setLoans] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedLedger, setSelectedLedger] = useState(null); // Detail Modal state
  const [paymentTarget, setPaymentTarget] = useState(null); // Actual Payment Modal
  
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
    const interval = setInterval(fetchLoans, 20000);
    return () => clearInterval(interval);
  }, [fetchLoans]);

  const filteredLoans = loans.filter(loan => 
    (loan.loanId || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status) => {
    const styles = {
      Disbursed: { bg: '#dcfce7', text: '#166534', icon: <FiCheckCircle />, label: 'Active Loan' },
      Rejected: { bg: '#fee2e2', text: '#991b1b', icon: <FiXCircle />, label: 'Rejected' },
      'Field Verified': { bg: '#e0f2fe', text: '#0369a1', icon: <FiShield />, label: 'LUC Verified' },
      Approved: { bg: '#f0f9ff', text: '#0284c7', icon: <FiCheckCircle />, label: 'Ready' },
      default: { bg: '#fef3c7', text: '#92400e', icon: <FiClock />, label: 'Pending' }
    };
    return styles[status] || styles.default;
  };

  // --- Logic to Generate EMI Dates ---
  const generateEMISchedule = (loan) => {
    const schedule = [];
    const baseDate = new Date(loan.updatedAt || loan.appliedDate);
    const interval = loan.emiType === 'Weekly EMI' ? 7 : 1;
    
    for (let i = 1; i <= (loan.totalInstallments || 30); i++) {
      const dueDate = new Date(baseDate);
      dueDate.setDate(baseDate.getDate() + (i * interval));
      schedule.push({
        index: i,
        date: dueDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        amount: loan.installmentAmount || loan.dailyEMI,
        status: i <= (loan.paidInstallments || 0) ? 'PAID' : 'DUE'
      });
    }
    return schedule;
  };

  return (
    <div style={containerStyle}>
      <style>{responsiveStyles}</style>
      
      <div style={headerSection} className="header-flex">
        <div>
          <h2 style={mainTitle}>📡 LOAN INTELLIGENCE</h2>
          <p style={subTitleText}>Real-time tracking of your credit facility.</p>
        </div>
        <div style={searchWrapper} className="search-full">
          <FiSearch style={searchIcon} />
          <input type="text" placeholder="Search Loan ID..." style={searchBar} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div style={loaderBox}>🔄 CONNECTING TO LEDGER...</div>
      ) : filteredLoans.length === 0 ? (
        <div style={emptyState}>No Records Found.</div>
      ) : (
        <div className="loan-grid">
          {filteredLoans.map((loan) => {
            const style = getStatusStyle(loan.status);
            return (
              <div key={loan._id} style={loanCard} className="card-hover">
                <div style={cardHeader}>
                  <span style={loanIdTag}>ID: {loan.loanId}</span>
                  <span style={{ ...statusBadge, background: style.bg, color: style.text }}>
                    {style.icon} <span className="status-label">{style.label}</span>
                  </span>
                </div>
                
                <div style={cardBody} className="body-stack">
                   <div>
                      <label style={infoLabel}>PRINCIPAL</label>
                      <h2 style={amountText}>₹{loan.amount?.toLocaleString()}</h2>
                   </div>
                   <div style={{textAlign: 'right'}} className="emi-align">
                      <label style={{...infoLabel, color: '#2563eb'}}>{loan.emiType?.toUpperCase()}</label>
                      <h3 style={emiText}>₹{loan.installmentAmount || loan.dailyEMI}</h3>
                   </div>
                </div>

                <div style={detailsGrid}>
                  <div style={infoGroup}><label style={infoLabel}>PAYOUT</label><span style={infoValue}>₹{loan.netDisbursed || '---'}</span></div>
                  <div style={infoGroup}><label style={infoLabel}>TENURE</label><span style={infoValue}>{loan.tenureMonths} Mo</span></div>
                </div>

                <div style={cardFooter}>
                  <button style={detailBtn} onClick={() => setSelectedLedger(loan)}>
                    <FiList /> View Ledger
                  </button>
                  {loan.status === 'Disbursed' && (
                    <button style={repayBtn} onClick={() => setPaymentTarget({ ...loan, customAmount: loan.installmentAmount })}>
                      Quick Pay <FiArrowRight />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- 📊 EMI LEDGER MODAL --- */}
      {selectedLedger && (
        <div style={modalOverlay}>
          <div style={modalContent} className="modal-resp">
            <div style={modalHeader}>
              <h3 style={{margin:0, display:'flex', alignItems:'center', gap:'10px'}}>
                <FiMaximize /> Ledger: {selectedLedger.loanId}
              </h3>
              <FiX onClick={() => setSelectedLedger(null)} style={{cursor:'pointer'}} size={24} />
            </div>

            <div style={modalBody}>
              <div style={bulkPayCard}>
                 <div>
                    <p style={infoLabel}>TOTAL OUTSTANDING</p>
                    <h2 style={{margin:0, color:'#0f172a'}}>₹{selectedLedger.totalPayable?.toLocaleString()}</h2>
                 </div>
                 <button style={fullPayBtn} onClick={() => setPaymentTarget({ ...selectedLedger, customAmount: selectedLedger.totalPayable })}>
                    Pay Full Loan
                 </button>
              </div>

              <h4 style={sectionTitle}><FiClock /> Installment Timeline</h4>
              <div style={ledgerScroll}>
                {generateEMISchedule(selectedLedger).map((emi) => (
                  <div key={emi.index} style={emiRow}>
                    <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
                      <span style={emiIndex}>{emi.index}</span>
                      <div>
                        <div style={infoValue}>{emi.date}</div>
                        <div style={{fontSize:'10px', color:'#94a3b8'}}>Scheduled</div>
                      </div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontWeight:'900', color:'#0f172a'}}>₹{emi.amount}</div>
                      <span style={{fontSize:'9px', fontWeight:'800', color: emi.status === 'PAID' ? '#10b981' : '#f59e0b'}}>
                        {emi.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- 💰 PAYMENT MODAL INTEGRATION --- */}
      {paymentTarget && (
        <PaymentModal 
          loan={paymentTarget} 
          customAmount={paymentTarget.customAmount} 
          onClose={() => setPaymentTarget(null)} 
          onRefresh={fetchLoans} 
        />
      )}
    </div>
  );
};

// --- STYLES ---
const containerStyle = { padding: '20px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' };
const headerSection = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const mainTitle = { margin: 0, fontWeight: 950, fontSize: '26px', color: '#0f172a', letterSpacing: '-1px' };
const subTitleText = { color: '#64748b', fontSize: '12px', marginTop: '4px' };
const searchWrapper = { position: 'relative', display: 'flex', alignItems: 'center' };
const searchIcon = { position: 'absolute', left: '15px', color: '#94a3b8' };
const searchBar = { padding: '12px 15px 12px 45px', borderRadius: '12px', border: '1.5px solid #e2e8f0', width: '260px', outline: 'none', fontSize: '14px', background: '#fff' };

const loanCard = { background: '#fff', borderRadius: '24px', padding: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' };
const loanIdTag = { fontSize: '9px', fontWeight: '900', color: '#64748b', background: '#f1f5f9', padding: '5px 10px', borderRadius: '8px' };
const statusBadge = { padding: '6px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px' };

const cardBody = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '15px', borderRadius: '18px', marginBottom: '15px' };
const amountText = { margin: 0, color: '#0f172a', fontWeight: '900', fontSize: '22px' };
const emiText = { margin: 0, color: '#2563eb', fontWeight: '900', fontSize: '18px' };
const infoLabel = { fontSize: '8px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' };

const detailsGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '15px' };
const infoGroup = { display: 'flex', flexDirection: 'column' };
const infoValue = { fontSize: '14px', fontWeight: '800', color: '#1e293b' };

const cardFooter = { display: 'flex', gap: '10px', marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '15px' };
const detailBtn = { flex: 1, padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' };
const repayBtn = { flex: 1.5, padding: '10px', borderRadius: '10px', border: 'none', background: '#10b981', color: '#fff', fontSize: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' };

// --- MODAL STYLES ---
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', padding: '15px' };
const modalContent = { background: '#fff', borderRadius: '30px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' };
const modalHeader = { background: '#0f172a', color: '#fff', padding: '20px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const modalBody = { padding: '20px', overflowY: 'auto' };
const bulkPayCard = { background: '#eff6ff', padding: '20px', borderRadius: '22px', border: '1px solid #dbeafe', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' };
const fullPayBtn = { padding: '10px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '12px', cursor: 'pointer' };
const sectionTitle = { fontSize: '12px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' };
const ledgerScroll = { display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto', paddingRight: '5px' };
const emiRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', background: '#f8fafc', borderRadius: '15px', border: '1px solid #f1f5f9' };
const emiIndex = { width: '28px', height: '28px', background: '#0f172a', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '900' };

const loaderBox = { textAlign: 'center', padding: '60px', color: '#94a3b8', fontWeight: '800' };
const emptyState = { textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '30px', border: '2px dashed #e2e8f0' };

const responsiveStyles = `
  .loan-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
  @media (max-width: 768px) {
    .header-flex { flex-direction: column; align-items: flex-start !important; gap: 15px; }
    .search-full { width: 100%; }
    .search-full input { width: 100% !important; }
    .status-label { display: none; }
    .body-stack { flex-direction: column; align-items: flex-start !important; gap: 10px; }
    .emi-align { text-align: left !important; }
    .modal-resp { width: 95% !important; height: 85vh !important; }
  }
  .card-hover:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.05); transition: 0.3s; }
`;

export default LoanTracking;