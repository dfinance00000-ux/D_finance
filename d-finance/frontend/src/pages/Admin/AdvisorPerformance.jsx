import React, { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';
import { 
  FiCalendar, FiDollarSign, FiFilter, FiRefreshCw, 
  FiPrinter, FiArrowDownCircle, FiCreditCard, FiSmartphone 
} from 'react-icons/fi';

const DailyCollectionReport = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalToday, setTotalToday] = useState(0);
  const [filterMode, setFilterMode] = useState('All'); // All, UPI, Cash
  const [searchQuery, setSearchQuery] = useState("");

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      // 🔥 Note: Backend par filter logic hona chahiye ya frontend par handle karein
      const res = await API.get('/admin/collection-report');
      
      const reportData = Array.isArray(res.data) ? res.data : [];
      // Sorting: Latest first
      const sortedData = reportData.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
      
      setCollections(sortedData);
      
      // Calculate Total Cash-In
      const total = reportData.reduce((sum, p) => sum + Number(p.amount || 0), 0);
      setTotalToday(total);
    } catch (err) {
      console.error("Collection Ledger Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Filtering Logic
  const filteredCollections = collections.filter(item => {
    const matchesSearch = item.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.loanId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = filterMode === 'All' ? true : item.method === filterMode;
    return matchesSearch && matchesMethod;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-2 md:p-6 space-y-8 animate-in fade-in duration-700">
      
      {/* --- HUD: HEADER & QUICK STATS --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <FiCalendar size={24} />
            </div>
            <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Daily Recovery Ledger</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">
                    Node: Mathura_Branch | {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          {/* Today's Total Card */}
          <div className="flex-1 lg:flex-none bg-slate-900 text-white px-8 py-4 rounded-[1.8rem] flex items-center gap-4 shadow-2xl shadow-slate-200">
            <div className="p-2 bg-white/10 rounded-xl"><FiArrowDownCircle className="text-emerald-400" size={20}/></div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase opacity-60 tracking-widest">Gross Recovery</span>
              <span className="text-xl font-black tabular-nums">₹{totalToday.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button onClick={fetchReport} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-slate-900 transition-all">
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          </button>
          
          <button onClick={handlePrint} className="hidden md:flex p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all">
            <FiPrinter />
          </button>
        </div>
      </div>

      {/* --- TOOLS: SEARCH & FILTERS --- */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm w-full md:w-auto">
          {['All', 'UPI', 'Cash', 'Bank'].map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filterMode === mode ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
            <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
                type="text"
                placeholder="Search Client or Loan ID..."
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-blue-500/10 shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
      </div>

      {/* --- MAIN REPORT TABLE --- */}
      <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction Time</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer / File ID</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reference No.</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount Received</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Channel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                    <td colSpan="5" className="p-32 text-center">
                        <div className="flex flex-col items-center gap-4">
                            <FiRefreshCw className="animate-spin text-slate-200" size={40} />
                            <p className="font-black text-slate-300 uppercase tracking-[0.3em] text-xs">Accessing Cloud Ledger...</p>
                        </div>
                    </td>
                </tr>
              ) : filteredCollections.length > 0 ? (
                filteredCollections.map((pay) => (
                  <tr key={pay._id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-8 py-7">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs font-black text-slate-600 tabular-nums">
                            {new Date(pay.paymentDate || pay.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true})}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <div className="font-black text-slate-900 uppercase text-sm tracking-tight">{pay.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-bold mt-0.5">FILE: {pay.loanId}</div>
                    </td>
                    <td className="px-8 py-7">
                      <div className="flex items-center gap-2">
                        <code className="text-[11px] font-bold text-blue-500 bg-blue-50/50 px-3 py-1 rounded-lg border border-blue-100/50">
                            {pay.utr || pay.receiptId || 'DIRECT_CASH'}
                        </code>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <div className="text-lg font-black text-emerald-600 tabular-nums">₹{pay.amount.toLocaleString('en-IN')}</div>
                    </td>
                    <td className="px-8 py-7 text-right">
                      <div className="flex items-center justify-end gap-2 text-[10px] font-black uppercase text-slate-500">
                        {pay.method === 'UPI' ? <FiSmartphone className="text-blue-500"/> : <FiCreditCard className="text-amber-500"/>}
                        <span className="bg-slate-100 px-3 py-1 rounded-full group-hover:bg-slate-900 group-hover:text-white transition-all">
                            {pay.method || 'CASH'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-32 text-center">
                    <div className="text-5xl mb-6 grayscale opacity-30">📭</div>
                    <h3 className="text-sm font-black text-slate-300 uppercase tracking-[0.4em]">No Transactions Registered</h3>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- FOOTER INFO --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-6 opacity-40">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
          Internal Use Only • D-Finance Mathura Core
        </p>
        <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
            <span>Server: MongoDB_Atlas_Mathura</span>
            <span>Status: Verified</span>
        </div>
      </div>
    </div>
  );
};

export default DailyCollectionReport;