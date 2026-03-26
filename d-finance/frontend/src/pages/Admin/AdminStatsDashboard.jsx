import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const AdminStatsDashboard = () => {
  const [stats, setStats] = useState({
    totalDisbursed: 0,
    totalRecovered: 0,
    customerCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/admin/stats');
        // Backend data ko handle karein, agar koi field missing ho toh 0 lein
        setStats({
            totalDisbursed: res.data.totalDisbursed || 0,
            totalRecovered: res.data.totalRecovered || 0,
            customerCount: res.data.customerCount || 0
        });
      } catch (err) {
        console.error("Stats Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Safe variables taaki crash na ho
  const disbursed = stats.totalDisbursed || 0;
  const recovered = stats.totalRecovered || 0;
  const pending = disbursed - recovered > 0 ? disbursed - recovered : 0;

  // Graphs ke liye data prepare karna
  const barData = [
    { name: 'Disbursed', amount: disbursed },
    { name: 'Recovered', amount: recovered },
  ];

  const pieData = [
    { name: 'Recovered', value: recovered },
    { name: 'Pending', value: pending },
  ];

  const COLORS = ['#22c55e', '#ef4444'];

  if (loading) return <div style={loaderStyle}>Syncing Real-time Data...</div>;

  return (
    <div style={{ padding: '30px', background: '#f1f5f9', minHeight: '100vh' }}>
      <h2 style={{ marginBottom: '25px', color: '#0f172a', fontWeight: '900' }}>📊 Mathura Branch Analytics</h2>

      {/* --- Top Info Cards --- */}
      <div style={statsGrid}>
        <div style={{ ...card, borderLeft: '8px solid #2563eb' }}>
          <label style={labelStyle}>Total Disbursed</label>
          <h2 style={valStyle}>₹{disbursed.toLocaleString()}</h2>
        </div>
        <div style={{ ...card, borderLeft: '8px solid #22c55e' }}>
          <label style={labelStyle}>Total Recovery (EMI)</label>
          <h2 style={{ ...valStyle, color: '#16a34a' }}>₹{recovered.toLocaleString()}</h2>
        </div>
        <div style={{ ...card, borderLeft: '8px solid #f59e0b' }}>
          <label style={labelStyle}>Active Customers</label>
          <h2 style={valStyle}>{stats.customerCount}</h2>
        </div>
      </div>

      {/* --- Graphs Section --- */}
      <div style={graphGrid}>
        <div style={graphCard}>
          <h4 style={graphTitle}>Recovery vs Disbursement</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="amount" fill="#2563eb" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={graphCard}>
          <h4 style={graphTitle}>Collection Health (Target vs Achievement)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={pieData} 
                innerRadius={60} 
                outerRadius={80} 
                paddingAngle={5} 
                dataKey="value"
                // Agar data 0 ho toh pie chart crash na ho
                minAngle={recovered === 0 && pending === 0 ? 0 : 15}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ textAlign: 'center', fontSize: '12px', color: '#64748b', marginTop: '10px' }}>
             <span style={{color: '#ef4444'}}>●</span> Pending Recovery | <span style={{color: '#22c55e'}}>●</span> Success Recovery
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Styles (Aapke original styles preserved) ---
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' };
const card = { background: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' };
const labelStyle = { fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' };
const valStyle = { fontSize: '28px', fontWeight: '900', margin: '10px 0 0 0', color: '#1e293b' };
const graphGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' };
const graphCard = { background: '#fff', padding: '25px', borderRadius: '25px', boxShadow: '0 10px 25px rgba(0,0,0,0.02)' };
const graphTitle = { margin: '0 0 20px 0', color: '#475569', fontSize: '14px', fontWeight: 'bold' };
const loaderStyle = { textAlign: 'center', marginTop: '100px', fontSize: '18px', color: '#64748b' };

export default AdminStatsDashboard;