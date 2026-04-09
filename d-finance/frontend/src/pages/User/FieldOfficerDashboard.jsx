import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // 🆕 Navigation ke liye zaroori
import API from '../../api/axios'; 

const FieldOfficerDashboard = () => {
  const navigate = useNavigate(); // 🆕 Initialization
  const [stats, setStats] = useState({
    totalSales: 0,
    pendingCommission: 0,
    teamSize: 0,
    recentSubmissions: []
  });
  const [openPool, setOpenPool] = useState([]); 
  const [loading, setLoading] = useState(true);

  // 🛠️ FETCH DATA FUNCTION
  const fetchOfficerData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Dono calls ko parallel mein kar rahe hain performance ke liye
      const [resStats, resPool] = await Promise.all([
        API.get('/user/my-dashboard'),
        API.get('/officer/available-requests')
      ]);

      setStats({
          totalSales: resStats.data.totalSales || 0,
          pendingCommission: resStats.data.pendingCommission || 0,
          teamSize: resStats.data.teamSize || 0,
          recentSubmissions: resStats.data.recentSubmissions || []
      });

      setOpenPool(resPool.data || []);
    } catch (err) {
      console.error("❌ Sync Error:", err.response?.data || err.message);
      if(err.response?.status === 403) {
          console.warn("Access Denied: Check if your role is set to 'user' in DB");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOfficerData();
  }, [fetchOfficerData]);

  // 🤝 ACCEPT LOAN LOGIC
  const handleAcceptLoan = async (loanId) => {
    if(!window.confirm(`Accept Loan ${loanId} for Field Verification?`)) return;
    
    try {
      const res = await API.post(`/officer/accept-loan/${loanId}`);
      if (res.data.success) {
        alert("🎉 Loan accepted! It's now in your Verification Queue.");
        fetchOfficerData(); // Refreshing both sections
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Connection Timeout";
      alert("❌ Error: " + errorMsg);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-emerald-600 mx-auto"></div>
            <p className="mt-4 font-black text-slate-400 animate-pulse uppercase tracking-widest text-[10px]">Syncing Market Data...</p>
        </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fadeIn p-4 max-w-7xl mx-auto pb-20">
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
          <div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Officer Portal</h2>
            <div className="flex items-center gap-2 mt-1">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Live Agent: {JSON.parse(localStorage.getItem('user'))?.fullName || 'Active User'}</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            {/* 🆕 NAYA OPTION: REGISTER CUSTOMER BUTTON */}
            <button 
              onClick={() => navigate('/user/register-customer')}
              className="bg-emerald-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700"
            >
              + Register New Customer
            </button>

            <button 
              onClick={fetchOfficerData}
              className="bg-white border-2 border-slate-200 hover:border-slate-800 text-slate-800 px-6 py-2 rounded-2xl text-[10px] font-black uppercase transition-all shadow-sm"
            >
              Refresh Market
            </button>
          </div>
      </div>

      {/* --- 📊 Performance Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 border-b-[6px] border-emerald-500 group hover:-translate-y-1 transition-all">
          <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Success Disbursed</h4>
          <p className="text-4xl font-black mt-2 text-slate-800 group-hover:text-emerald-600 transition-colors">₹{stats.totalSales.toLocaleString()}</p>
        </div>
        
        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 border-b-[6px] border-blue-500 group hover:-translate-y-1 transition-all">
          <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">My Commission (2%)</h4>
          <p className="text-4xl font-black mt-2 text-blue-600 group-hover:text-blue-700 transition-colors">₹{stats.pendingCommission.toLocaleString()}</p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 border-b-[6px] border-orange-500 group hover:-translate-y-1 transition-all">
          <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Assigned Requests</h4>
          <p className="text-4xl font-black mt-2 text-slate-800">{stats.recentSubmissions.length} <span className="text-lg font-bold text-slate-400">Files</span></p>
        </div>
      </div>

      {/* --- 🏦 OPEN LOAN MARKET POOL --- */}
      <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
            <h1 className="text-9xl font-black italic uppercase">MARKET</h1>
        </div>
        
        <div className="relative z-10">
            <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
                <div>
                    <h3 className="font-black uppercase tracking-tighter text-2xl text-emerald-400">🔥 Open Requests</h3>
                    <p className="text-slate-500 text-[10px] font-bold uppercase mt-1">Claim these files to start field verification</p>
                </div>
                <div className="bg-emerald-500 text-slate-900 text-[11px] px-5 py-2 rounded-full font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                    {openPool.length} Leads
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {openPool.length > 0 ? (
                    openPool.map((loan) => (
                        <div key={loan.loanId} className="bg-slate-800/40 backdrop-blur-md p-6 rounded-3xl border border-slate-700/50 hover:border-emerald-500 transition-all group relative overflow-hidden">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[9px] bg-slate-700 text-slate-300 px-3 py-1 rounded-full font-black uppercase tracking-widest group-hover:bg-emerald-500 group-hover:text-slate-900 transition-colors">{loan.type}</span>
                                <span className="text-emerald-400 font-black text-lg">₹{loan.amount.toLocaleString()}</span>
                            </div>
                            <h4 className="font-black text-xl text-white tracking-tight">{loan.customerName}</h4>
                            <p className="text-[10px] text-slate-500 mb-6 font-bold tracking-widest uppercase">File ID: {loan.loanId}</p>
                            
                            <button 
                                onClick={() => handleAcceptLoan(loan.loanId)}
                                className="w-full bg-white hover:bg-emerald-500 text-slate-900 font-black py-4 rounded-2xl text-[11px] uppercase transition-all transform active:scale-95 shadow-lg group-hover:scale-[1.02]"
                            >
                                Claim File Now
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-16 bg-slate-800/20 rounded-3xl border border-dashed border-slate-700">
                        <p className="text-slate-500 font-black uppercase italic text-[11px] tracking-[0.3em]">Market is currently quiet. Check back later.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
      
      {/* --- 📋 RECENT ACTIVITY TABLE --- */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-black text-slate-800 uppercase tracking-tighter text-lg">My Active Submissions</h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last 10 Records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
              <tr>
                <th className="p-6">Submission Date</th>
                <th className="p-6">Client Name</th>
                <th className="p-6">Amount</th>
                <th className="p-6 text-right">File Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.recentSubmissions.length > 0 ? (
                stats.recentSubmissions.map((loan, index) => (
                  <tr key={index} className="hover:bg-slate-50/80 transition-all cursor-default group">
                    <td className="p-6">
                        <p className="font-bold text-slate-800">{new Date(loan.createdAt).toLocaleDateString('en-IN')}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Recorded at {new Date(loan.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </td>
                    <td className="p-6">
                        <p className="font-black text-slate-800 group-hover:text-blue-600 transition-colors uppercase">{loan.customerName}</p>
                        <p className="text-[10px] text-slate-400 font-bold italic tracking-tighter">ID: {loan.loanId}</p>
                    </td>
                    <td className="p-6 font-black text-slate-900 text-lg">₹{loan.amount.toLocaleString()}</td>
                    <td className="p-6 text-right">
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                        loan.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 
                        loan.status === 'Hold - Pending Assignment' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {loan.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-20 text-center text-slate-300 font-black uppercase italic text-xs tracking-widest">
                    No active files found in your queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FieldOfficerDashboard;