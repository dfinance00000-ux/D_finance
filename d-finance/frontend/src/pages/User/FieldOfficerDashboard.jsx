import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; 
import API from '../../api/axios'; 

const FieldOfficerDashboard = () => {
  const navigate = useNavigate(); 
  const [stats, setStats] = useState({
    totalSales: 0,
    pendingCommission: 0,
    teamSize: 0,
    recentSubmissions: []
  });
  const [openPool, setOpenPool] = useState([]); 
  const [loading, setLoading] = useState(true);

  const fetchOfficerData = useCallback(async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOfficerData();
  }, [fetchOfficerData]);

  const handleAcceptLoan = async (loanId) => {
    if(!window.confirm(`Accept Loan ${loanId} for Field Verification?`)) return;
    try {
      const res = await API.post(`/officer/accept-loan/${loanId}`);
      if (res.data.success) {
        alert("🎉 Loan accepted! It's now in your Verification Queue.");
        fetchOfficerData(); 
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
    <div className="space-y-6 md:space-y-8 animate-fadeIn p-3 md:p-4 max-w-7xl mx-auto pb-20">
      
      {/* --- Header Section: Fully Responsive Stack --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter">Officer Portal</h2>
            <div className="flex items-center gap-2 mt-1">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Live Agent: {JSON.parse(localStorage.getItem('user'))?.fullName || 'Active User'}</p>
            </div>
          </div>
          
          {/* Action Buttons: Stack on Mobile, Row on Desktop */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button 
              onClick={() => navigate('/user/register-customer')}
              className="w-full sm:w-auto bg-emerald-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 active:scale-95"
            >
              + Register New Customer
            </button>

            <button 
              onClick={fetchOfficerData}
              className="w-full sm:w-auto bg-white border-2 border-slate-200 hover:border-slate-800 text-slate-800 px-6 py-2 rounded-2xl text-[10px] font-black uppercase transition-all shadow-sm"
            >
              Refresh Market
            </button>
          </div>
      </div>

      {/* --- 📊 Performance Cards: Grid Stacks on Mobile --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 border-b-[6px] border-emerald-500">
          <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Success Disbursed</h4>
          <p className="text-3xl md:text-4xl font-black mt-2 text-slate-800">₹{stats.totalSales.toLocaleString()}</p>
        </div>
        
        <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 border-b-[6px] border-blue-500">
          <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">My Commission (2%)</h4>
          <p className="text-3xl md:text-4xl font-black mt-2 text-blue-600">₹{stats.pendingCommission.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 border-b-[6px] border-orange-500">
          <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Assigned Requests</h4>
          <p className="text-3xl md:text-4xl font-black mt-2 text-slate-800">{stats.recentSubmissions.length} <span className="text-lg font-bold text-slate-400">Files</span></p>
        </div>
      </div>

      {/* --- 🏦 OPEN LOAN MARKET POOL --- */}
      <div className="bg-slate-900 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none hidden md:block">
            <h1 className="text-9xl font-black italic uppercase">MARKET</h1>
        </div>
        
        <div className="relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 md:mb-10 border-b border-slate-800 pb-6 gap-4">
                <div>
                    <h3 className="font-black uppercase tracking-tighter text-xl md:text-2xl text-emerald-400">🔥 Open Requests</h3>
                    <p className="text-slate-500 text-[10px] font-bold uppercase mt-1">Claim these files for field verification</p>
                </div>
                <div className="bg-emerald-500 text-slate-900 text-[10px] md:text-[11px] px-5 py-2 rounded-full font-black uppercase tracking-widest">
                    {openPool.length} Leads Available
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {openPool.length > 0 ? (
                    openPool.map((loan) => (
                        <div key={loan.loanId} className="bg-slate-800/40 backdrop-blur-md p-5 md:p-6 rounded-3xl border border-slate-700/50 hover:border-emerald-500 transition-all group">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[9px] bg-slate-700 text-slate-300 px-3 py-1 rounded-full font-black uppercase tracking-widest group-hover:bg-emerald-500 group-hover:text-slate-900 transition-colors">{loan.type}</span>
                                <span className="text-emerald-400 font-black text-lg">₹{loan.amount.toLocaleString()}</span>
                            </div>
                            <h4 className="font-black text-lg md:text-xl text-white tracking-tight truncate">{loan.customerName}</h4>
                            <p className="text-[10px] text-slate-500 mb-6 font-bold tracking-widest uppercase">File ID: {loan.loanId}</p>
                            
                            <button 
                                onClick={() => handleAcceptLoan(loan.loanId)}
                                className="w-full bg-white hover:bg-emerald-500 text-slate-900 font-black py-4 rounded-2xl text-[11px] uppercase transition-all transform active:scale-95 shadow-lg group-hover:scale-[1.01]"
                            >
                                Claim File Now
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 md:py-16 bg-slate-800/20 rounded-3xl border border-dashed border-slate-700">
                        <p className="text-slate-500 font-black uppercase italic text-[10px] md:text-[11px] tracking-[0.2em]">Market is currently quiet.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
      
      {/* --- 📋 RECENT ACTIVITY TABLE: Responsive Wrapper --- */}
      <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-black text-slate-800 uppercase tracking-tighter text-base md:text-lg">My Submissions</h3>
            <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent 10</span>
        </div>
        
        {/* Horizontal scroll container for table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left min-w-[600px]">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
              <tr>
                <th className="p-4 md:p-6">Date</th>
                <th className="p-4 md:p-6">Client Name</th>
                <th className="p-4 md:p-6">Amount</th>
                <th className="p-4 md:p-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.recentSubmissions.length > 0 ? (
                stats.recentSubmissions.map((loan, index) => (
                  <tr key={index} className="hover:bg-slate-50/80 transition-all">
                    <td className="p-4 md:p-6">
                        <p className="font-bold text-slate-800">{new Date(loan.createdAt).toLocaleDateString('en-IN')}</p>
                        <p className="text-[9px] text-slate-400 font-medium">Recorded at {new Date(loan.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </td>
                    <td className="p-4 md:p-6">
                        <p className="font-black text-slate-800 uppercase text-xs md:text-sm">{loan.customerName}</p>
                        <p className="text-[9px] text-slate-400 font-bold italic tracking-tighter">ID: {loan.loanId}</p>
                    </td>
                    <td className="p-4 md:p-6 font-black text-slate-900 text-base">₹{loan.amount.toLocaleString()}</td>
                    <td className="p-4 md:p-6 text-right">
                      <span className={`px-3 py-1 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest inline-block ${
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
                  <td colSpan="4" className="p-16 md:p-20 text-center text-slate-300 font-black uppercase italic text-xs tracking-widest">
                    No active files found.
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