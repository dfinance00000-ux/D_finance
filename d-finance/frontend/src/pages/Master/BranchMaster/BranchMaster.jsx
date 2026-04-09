import React, { useState, useEffect, useCallback } from 'react';
import API from "../../../api/axios"; // Path updated as discussed
import { 
  FiUsers, FiBriefcase, FiUserCheck, FiClock, FiFileText, 
  FiRefreshCw, FiTarget, FiSmartphone, FiShield 
} from 'react-icons/fi';

const BranchMaster = () => {
  const [activeSection, setActiveSection] = useState('officers');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ users: [], loans: [] });

  const fetchMasterData = useCallback(async () => {
    try {
      setLoading(true);
      const [uRes, lRes] = await Promise.all([
        API.get('/admin/all-users-absolute').catch(() => ({ data: [] })),
        API.get('/admin/all-loans').catch(() => ({ data: [] }))
      ]);
      setData({ users: uRes.data, loans: lRes.data });
    } catch (err) {
      console.error("Database Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMasterData(); }, [fetchMasterData]);

  // --- 🔥 POWER LOGIC: Dynamic Mapping ---

  // Helper: Kisi bhi User ka naam unki ID se nikalne ke liye
  const getNameFromId = (id) => {
    const user = data.users.find(u => String(u._id) === String(id));
    return user ? user.fullName : null;
  };

  // 1. Field Officers with their linked loan history
  const fieldOfficers = data.users
    .filter(u => ['User', 'user', 'FieldOfficer'].includes(u.role))
    .map(officer => {
      const linkedLoans = data.loans.filter(loan => 
        String(loan.fieldOfficerId) === String(officer._id) || 
        loan.verifiedByName === officer.fullName
      );
      return { ...officer, approvals: linkedLoans };
    });

  // 2. Customers with their Assigned Officer (FIXED logic)
  const customers = data.users
    .filter(u => u.role === 'Customer' || u.role === 'customer')
    .map(cust => {
      const loanInfo = data.loans.find(l => String(l.customerId) === String(cust._id));
      
      // Mismatch Fix: Pehle check karo verifiedByName hai? Phir fieldOfficerId se dhoondo
      const officer = loanInfo?.verifiedByName || 
                      getNameFromId(loanInfo?.fieldOfficerId) || 
                      "Not Assigned";

      return { 
        ...cust, 
        assignedOfficer: officer, 
        loanStatus: loanInfo?.status || "No Active Loan",
        loanId: loanInfo?.loanId
      };
    });

  const accountants = data.users.filter(u => u.role === 'Accountant' || u.role === 'accountant');

  if (loading) return (
    <div style={loaderContainer}>
      <FiRefreshCw className="spin" size={35} color="#0f172a" />
      <p style={{fontWeight: 900, marginTop: '15px', letterSpacing: '2px', color: '#64748b'}}>DECRYPTING BRANCH LEDGER...</p>
    </div>
  );

  return (
    <div style={{ padding: '25px', background: '#f4f7fe', minHeight: '100vh', fontFamily: '"Inter", sans-serif' }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>

      {/* Header */}
      <div style={headerStyle}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 900, color: '#0f172a', fontSize: '28px', letterSpacing: '-1px' }}>🏢 OPS COMMAND CENTER</h2>
          <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '5px' }}>Mathura | Real-time Data Sync</p>
        </div>
        <button onClick={fetchMasterData} style={refreshBtn}><FiRefreshCw /> SYNC ATLAS</button>
      </div>

      {/* Tabs */}
      <div style={tabContainer}>
        <button onClick={() => setActiveSection('officers')} style={activeSection === 'officers' ? activeTab : tabBtn}>
          <FiUserCheck /> Officers ({fieldOfficers.length})
        </button>
        <button onClick={() => setActiveSection('accountants')} style={activeSection === 'accountants' ? activeTab : tabBtn}>
          <FiShield /> Accountants ({accountants.length})
        </button>
        <button onClick={() => setActiveSection('customers')} style={activeSection === 'customers' ? activeTab : tabBtn}>
          <FiUsers /> Customers ({customers.length})
        </button>
      </div>

      {/* 1. Field Officers View */}
      {activeSection === 'officers' && (
        <div style={gridStyle}>
          {fieldOfficers.map(officer => (
            <div key={officer._id} style={officerCard}>
              <div style={cardHeader}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900 }}>{officer.fullName}</h3>
                  <small style={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '10px' }}>ID: {officer._id.slice(-8).toUpperCase()}</small>
                </div>
                <div style={countBadge}>{officer.approvals.length} Files</div>
              </div>
              <div style={{marginTop: '20px'}}>
                <p style={subLabel}><FiFileText /> VERIFIED PORTFOLIO</p>
                <div style={historyScroll}>
                    {officer.approvals.length > 0 ? officer.approvals.map((loan, i) => (
                    <div key={i} style={approvalRow}>
                        <div style={{ flex: 1 }}>
                            <p style={customerName}>{loan.customerName}</p>
                            <span style={loanIdTag}>{loan.loanId}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={amountText}>₹{loan.amount || 0}</p>
                            <span style={{fontSize: '9px', color: loan.status === 'Disbursed' ? '#10b981' : '#f59e0b', fontWeight: '900'}}>{loan.status.toUpperCase()}</span>
                        </div>
                    </div>
                    )) : <p style={emptyText}>No records found.</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Accountants View */}
      {activeSection === 'accountants' && (
        <div style={tableCard}>
          <table style={fullTable}>
            <thead>
              <tr style={tableHead}>
                <th style={{padding: '20px'}}>Accountant</th><th>Contact</th><th>Atlas System ID</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {accountants.map(acc => (
                <tr key={acc._id} style={tableRow}>
                  <td style={{ fontWeight: 900, padding: '20px' }}>{acc.fullName}</td>
                  <td style={{ fontWeight: 'bold', color: '#64748b' }}><FiSmartphone/> {acc.mobile}</td>
                  <td style={{ fontSize: '11px', color: '#cbd5e1' }}>{acc._id}</td>
                  <td><span style={roleTag}>AUTHORIZED</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. Customers View */}
      {activeSection === 'customers' && (
        <div style={tableCard}>
          <table style={fullTable}>
            <thead>
              <tr style={tableHead}>
                <th style={{padding: '20px'}}>Client Name</th><th>Mobile</th><th>Assigned Field Officer</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(cust => (
                <tr key={cust._id} style={tableRow}>
                  <td style={{ padding: '20px' }}>
                    <p style={{ margin: 0, fontWeight: 900 }}>{cust.fullName}</p>
                    <small style={{ color: '#94a3b8' }}>{cust.loanId || 'NEW FILE'}</small>
                  </td>
                  <td style={{fontWeight: 'bold', color: '#64748b'}}>{cust.mobile}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: cust.assignedOfficer === 'Not Assigned' ? '#ef4444' : '#2563eb', fontWeight: '900', fontSize: '13px' }}>
                      <FiTarget size={14} /> {cust.assignedOfficer}
                    </div>
                  </td>
                  <td>
                    <span style={statusTag(cust.loanStatus)}>{cust.loanStatus}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// --- Styles (Fintech Dark/Light Mix) ---
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px' };
const refreshBtn = { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 25px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' };
const tabContainer = { display: 'flex', gap: '12px', marginBottom: '30px', background: '#fff', padding: '8px', borderRadius: '22px', width: 'fit-content', boxShadow: '0 10px 25px rgba(0,0,0,0.02)' };
const tabBtn = { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', border: 'none', background: 'none', borderRadius: '18px', cursor: 'pointer', fontWeight: '900', color: '#94a3b8', fontSize: '12px', transition: '0.3s' };
const activeTab = { ...tabBtn, background: '#2563eb', color: '#fff', boxShadow: '0 8px 15px rgba(37, 99, 235, 0.2)' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '25px' };
const officerCard = { background: '#fff', padding: '28px', borderRadius: '35px', boxShadow: '0 15px 35px rgba(0,0,0,0.03)', border: '1px solid #fff' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #f8fafc', paddingBottom: '15px' };
const countBadge = { background: '#f0fdf4', color: '#16a34a', padding: '6px 15px', borderRadius: '12px', fontSize: '11px', fontWeight: '900' };
const historyScroll = { maxHeight: '220px', overflowY: 'auto', paddingRight: '5px' };
const subLabel = { fontSize: '10px', fontWeight: '900', color: '#cbd5e1', letterSpacing: '1.5px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '15px' };
const approvalRow = { display: 'flex', alignItems: 'center', padding: '15px', background: '#f8fafc', borderRadius: '18px', marginBottom: '10px', border: '1px solid #f1f5f9' };
const customerName = { margin: 0, fontWeight: 900, fontSize: '14px', color: '#1e293b' };
const loanIdTag = { fontSize: '10px', color: '#94a3b8', fontWeight: 'bold' };
const amountText = { margin: 0, fontWeight: 900, color: '#0f172a', fontSize: '15px' };
const tableCard = { background: '#fff', borderRadius: '35px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' };
const fullTable = { width: '100%', borderCollapse: 'collapse' };
const tableHead = { background: '#f8fafc', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '1.5px' };
const tableRow = { borderBottom: '1px solid #f1f5f9', fontSize: '13px' };
const roleTag = { padding: '6px 12px', background: '#e0f2fe', color: '#0369a1', borderRadius: '10px', fontSize: '9px', fontWeight: '900' };
const statusTag = (s) => ({
  padding: '6px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: '900',
  background: s?.includes('Disbursed') ? '#f0fdf4' : s?.includes('Verified') ? '#eff6ff' : '#fff7ed',
  color: s?.includes('Disbursed') ? '#16a34a' : s?.includes('Verified') ? '#2563eb' : '#c2410c'
});
const loaderContainer = { height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' };
const emptyText = { textAlign: 'center', padding: '30px', color: '#cbd5e1', fontWeight: '900', fontSize: '12px' };

export default BranchMaster;