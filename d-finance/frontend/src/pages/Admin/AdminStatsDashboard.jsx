import React, { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { FiTrash2, FiUser, FiShield, FiBriefcase, FiUsers, FiFilter } from 'react-icons/fi';

// Components (Ensure paths are correct)
import ManageBlogs from './ManageBlogs';
import DailyCollectionReport from './DailyCollectionReport';
import BulkDataRetrieval from './BulkDataRetrieval';

const AdminStatsDashboard = () => {
  // --- States ---
  const [stats, setStats] = useState({ totalDisbursed: 0, totalRecovered: 0, customerCount: 0 });
  const [data, setData] = useState({ loans: [], customers: [], pendingPayments: [], staff: [] });
  const [activeTab, setActiveTab] = useState('payments');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Data Fetching ---
  const fetchAllAdminData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsRes, loansRes, custRes, staffRes] = await Promise.all([
        API.get('/admin/stats').catch(() => ({ data: {} })),
        API.get('/admin/all-loans').catch(() => ({ data: [] })),
        API.get('/admin/all-customers').catch(() => ({ data: [] })),
        API.get('/admin/all-staff').catch(() => ({ data: [] })) // 🚀 Staff Route
      ]);

      // Extract UTR Pending Payments
      const pending = [];
      if (Array.isArray(loansRes.data)) {
        loansRes.data.forEach(loan => {
          loan.repaymentHistory?.forEach(pay => {
            if (pay.status === 'Pending') {
              pending.push({ ...pay, loanId: loan.loanId, customerName: loan.customerName });
            }
          });
        });
      }

      setData({
        loans: Array.isArray(loansRes.data) ? loansRes.data : [],
        customers: Array.isArray(custRes.data) ? custRes.data : [],
        pendingPayments: pending,
        staff: Array.isArray(staffRes.data) ? staffRes.data : []
      });

      setStats({
        totalDisbursed: statsRes.data?.totalDisbursed || 0,
        totalRecovered: statsRes.data?.totalRecovered || 0,
        customerCount: custRes.data?.length || 0
      });

    } catch (err) {
      setError("Sync Failed. Check Backend Connection.");
      console.error("Admin Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllAdminData();
  }, [fetchAllAdminData]);

  // --- Actions ---
  const handleApprovePayment = async (loanId, paymentId) => {
    if (!window.confirm("Verify UTR and mark this EMI as PAID?")) return;
    try {
      const res = await API.post('/admin/approve-payment', { loanId, paymentId });
      if (res.data.success) {
        alert("✅ Approved!");
        fetchAllAdminData();
      }
    } catch (err) {
      alert("Error: Approval Failed");
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This action is permanent.`)) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      alert("User removed.");
      fetchAllAdminData();
    } catch (err) {
      alert("Delete failed. User might have active loans.");
    }
  };

  // --- Graph Helpers ---
  const disbursed = stats.totalDisbursed || 0;
  const recovered = stats.totalRecovered || 0;
  const pending = disbursed - recovered > 0 ? disbursed - recovered : 0;
  const barData = [{ name: 'Disbursed', amount: disbursed }, { name: 'Recovered', amount: recovered }];
  const pieData = [{ name: 'Recovered', value: recovered }, { name: 'Pending', value: pending }];
  const COLORS = ['#22c55e', '#ef4444'];

  if (loading) return <div style={loaderStyle}>INITIALIZING D-FINANCE ADMIN ATLAS...</div>;
  if (error) return <div style={errorStyle}>❌ {error} <br/><button onClick={fetchAllAdminData} style={refreshBtn}>Retry Sync</button></div>;

  return (
    <div style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh', maxWidth: '1400px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ color: '#0f172a', fontWeight: '900', margin: 0, textTransform: 'uppercase', letterSpacing: '-1px' }}>📊 Mathura Branch Control</h2>
        <button onClick={fetchAllAdminData} style={refreshBtn}>🔄 Refresh Data</button>
      </div>

      {/* --- 1. Top Stats Cards --- */}
      <div style={statsGrid}>
        <div style={{ ...card, borderLeft: '8px solid #2563eb' }}>
          <label style={labelStyle}>Total Disbursed</label>
          <h2 style={valStyle}>₹{disbursed.toLocaleString()}</h2>
        </div>
        <div style={{ ...card, borderLeft: '8px solid #22c55e' }}>
          <label style={labelStyle}>Total Recovery</label>
          <h2 style={{ ...valStyle, color: '#16a34a' }}>₹{recovered.toLocaleString()}</h2>
        </div>
        <div style={{ ...card, borderLeft: '8px solid #f59e0b' }}>
          <label style={labelStyle}>Staff Size</label>
          <h2 style={valStyle}>{data.staff.length}</h2>
        </div>
        <div style={{ ...card, borderLeft: '8px solid #ef4444' }}>
          <label style={labelStyle}>Customers</label>
          <h2 style={{ ...valStyle, color: '#ef4444' }}>{data.customers.length}</h2>
        </div>
      </div>

      {/* --- 2. Analytics Section --- */}
      <div style={graphGrid}>
        <div style={graphCard}>
          <h4 style={graphTitle}>Collection Health</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" fontSize={10}/><YAxis fontSize={10}/><Tooltip cursor={{fill: 'transparent'}}/><Bar dataKey="amount" fill="#2563eb" radius={[6, 6, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </div>
        <div style={graphCard}>
          <h4 style={graphTitle}>Recovery Percentage</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart><Pie data={pieData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">{pieData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- 3. Functional Tabs --- */}
      <div style={{ marginTop: '40px' }}>
        <div style={tabContainer}>
          <button onClick={() => setActiveTab('payments')} style={activeTab === 'payments' ? activeTabBtn : tabBtn}>UTR Queue ({data.pendingPayments.length})</button>
          <button onClick={() => setActiveTab('team')} style={activeTab === 'team' ? activeTabBtn : tabBtn}>👥 Staff Team</button>
          <button onClick={() => setActiveTab('customers')} style={activeTab === 'customers' ? activeTabBtn : tabBtn}>Customers</button>
          <button onClick={() => setActiveTab('loans')} style={activeTab === 'loans' ? activeTabBtn : tabBtn}>All Loans</button>
          <button onClick={() => setActiveTab('collection')} style={activeTab === 'collection' ? activeTabBtn : tabBtn}>📊 Reports</button>
          <button onClick={() => setActiveTab('audit')} style={activeTab === 'audit' ? activeTabBtn : tabBtn}>📥 Audit</button>
          <button onClick={() => setActiveTab('insights')} style={activeTab === 'insights' ? activeTabBtn : tabBtn}>📢 Insights</button>
        </div>

        <div style={tableCard}>
          
          {/* STAFF MANAGEMENT TAB */}
          {activeTab === 'team' && (
            <div style={{ padding: '20px' }}>
              <h3 style={{fontSize: '14px', fontWeight: '900', marginBottom: '20px', color: '#1e293b'}}>TEAM HIERARCHY</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {data.staff.map(member => (
                  <div key={member._id} style={staffCard}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                        <div style={roleIcon(member.role)}>
                            {member.role === 'admin' ? <FiShield/> : member.role === 'accountant' ? <FiBriefcase/> : <FiUser/>}
                        </div>
                        <button onClick={() => handleDeleteUser(member._id, member.fullName)} style={deleteBtn}><FiTrash2/></button>
                    </div>
                    <h4 style={{margin: '15px 0 5px 0', fontSize: '14px', fontWeight: '900'}}>{member.fullName}</h4>
                    <p style={{fontSize: '10px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase'}}>{member.role}</p>
                    <div style={{marginTop: '15px', borderTop: '1px solid #f1f5f9', paddingTop: '10px', fontSize: '11px', fontWeight: 'bold', color: '#64748b'}}>
                        📞 {member.mobile}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CUSTOMER MANAGEMENT TAB (FIXED) */}
          {activeTab === 'customers' && (
            <div style={{ overflowX: 'auto', padding: '10px' }}>
              <table style={tableStyle}>
                <thead>
                  <tr style={tableHeader}>
                    <th style={{ padding: '12px' }}>NAME</th>
                    <th style={{ padding: '12px' }}>MOBILE</th>
                    <th style={{ padding: '12px' }}>LOCATION</th>
                    <th style={{ padding: '12px' }}>JOINED</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {data.customers.length > 0 ? data.customers.map((c, i) => (
                    <tr key={c._id || i} style={tableRow}>
                      <td style={{ padding: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>{c.fullName || 'No Name'}</td>
                      <td style={{ padding: '12px' }}>{c.mobile}</td>
                      <td style={{ padding: '12px', fontSize: '10px', color: '#94a3b8' }}>{c.branch || 'Mathura'}</td>
                      <td style={{ padding: '12px' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                         <button onClick={() => handleDeleteUser(c._id, c.fullName)} style={deleteBtn}><FiTrash2/></button>
                      </td>
                    </tr>
                  )) : <tr><td colSpan="5" style={emptyMsg}>No active customers found</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {/* UTR APPROVALS */}
          {activeTab === 'payments' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead><tr style={tableHeader}><th>UTR</th><th>CLIENT</th><th>AMT</th><th style={{ textAlign: 'right' }}>ACTION</th></tr></thead>
                <tbody>
                  {data.pendingPayments.map((p, i) => (
                    <tr key={i} style={tableRow}>
                      <td style={{ fontWeight: '900' }}>{p.utr}</td>
                      <td>{p.customerName}</td>
                      <td style={{ fontWeight: '900', color: '#059669' }}>₹{p.amount}</td>
                      <td style={{ textAlign: 'right' }}><button onClick={() => handleApprovePayment(p.loanId, p._id)} style={approveBtn}>Approve</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'collection' && <DailyCollectionReport />}
          {activeTab === 'audit' && <BulkDataRetrieval />}
          {activeTab === 'insights' && <div style={{padding: '20px'}}><ManageBlogs /></div>}

          {activeTab === 'loans' && (
             <div style={{ overflowX: 'auto' }}>
                <table style={tableStyle}>
                    <thead><tr style={tableHeader}><th>ID</th><th>CLIENT</th><th>AMT</th><th>STATUS</th></tr></thead>
                    <tbody>
                        {data.loans.map(loan => (
                            <tr key={loan._id} style={tableRow}>
                                <td style={{fontWeight: 'bold'}}>{loan.loanId}</td>
                                <td>{loan.customerName}</td>
                                <td style={{fontWeight: 'bold'}}>₹{loan.amount}</td>
                                <td><span style={statusBadge(loan.status)}>{loan.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Styles & Helpers ---
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' };
const card = { background: '#fff', padding: '20px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const labelStyle = { fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' };
const valStyle = { fontSize: '24px', fontWeight: '900', margin: '5px 0 0 0' };
const graphGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' };
const graphCard = { background: '#fff', padding: '20px', borderRadius: '32px', border: '1px solid #f1f5f9' };
const graphTitle = { margin: '0 0 10px 0', fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' };
const tabContainer = { display: 'flex', gap: '8px', marginBottom: '15px', overflowX: 'auto', paddingBottom: '10px' };
const tabBtn = { padding: '10px 18px', background: '#e2e8f0', border: 'none', borderRadius: '12px', fontSize: '10px', fontWeight: '900', color: '#64748b', cursor: 'pointer', whiteSpace: 'nowrap' };
const activeTabBtn = { ...tabBtn, background: '#0f172a', color: '#fff' };
const tableCard = { background: '#fff', borderRadius: '32px', border: '1px solid #f1f5f9', minHeight: '400px', padding: '10px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const tableHeader = { textAlign: 'left', background: '#f8fafc', color: '#94a3b8', fontSize: '9px', fontWeight: '900' };
const tableRow = { borderBottom: '1px solid #f1f5f9', fontSize: '12px' };
const approveBtn = { background: '#0f172a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '9px', fontWeight: '900', cursor: 'pointer' };
const deleteBtn = { background: '#fef2f2', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center' };
const staffCard = { background: '#f8fafc', padding: '20px', borderRadius: '25px', border: '1px solid #e2e8f0' };
const roleIcon = (role) => ({
    background: role === 'admin' ? '#fee2e2' : role === 'accountant' ? '#dbeafe' : '#dcfce7',
    color: role === 'admin' ? '#ef4444' : role === 'accountant' ? '#2563eb' : '#059669',
    padding: '10px', borderRadius: '12px', display: 'flex'
});
const refreshBtn = { background: '#fff', border: '1px solid #e2e8f0', padding: '8px 15px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' };
const emptyMsg = { textAlign: 'center', padding: '50px', color: '#cbd5e1', fontSize: '11px', fontWeight: 'bold' };
const loaderStyle = { textAlign: 'center', marginTop: '100px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '2px' };
const errorStyle = { textAlign: 'center', marginTop: '100px', color: '#ef4444', fontWeight: 'bold' };

const statusBadge = (s) => ({
  padding: '4px 8px', borderRadius: '8px', fontSize: '8px', fontWeight: '900', textTransform: 'uppercase',
  background: s === 'Disbursed' ? '#dcfce7' : '#fef3c7',
  color: s === 'Disbursed' ? '#15803d' : '#92400e'
});

export default AdminStatsDashboard;