import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { FiCalendar, FiDollarSign, FiFilter, FiRefreshCw } from 'react-icons/fi';

const DailyCollectionReport = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalToday, setTotalToday] = useState(0);

  const fetchReport = async () => {
    try {
      setLoading(true);
      // Backend route check karein: /admin/collection-report
      const res = await API.get('/admin/collection-report');
      
      // Ensure data is array
      const reportData = Array.isArray(res.data) ? res.data : [];
      setCollections(reportData);
      
      // Aaj ka total calculate karna
      const total = reportData.reduce((sum, p) => sum + Number(p.amount || 0), 0);
      setTotalToday(total);
    } catch (err) {
      console.error("Collection Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div className="animate-fadeIn space-y-6">
      
      {/* --- Stats & Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
            <FiCalendar className="text-blue-600" /> Daily Collection
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            Real-time EMI Recovery | {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={fetchReport}
            className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-all"
            title="Refresh Data"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="flex-grow md:flex-grow-0 bg-emerald-500 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg shadow-emerald-500/20">
            <FiDollarSign className="text-xl" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase opacity-80">Today's Cash-In</span>
              <span className="text-lg font-black leading-none">₹{totalToday.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Filters Placeholder --- */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button className="bg-white border border-slate-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase text-slate-500 flex items-center gap-2 whitespace-nowrap">
          <FiFilter /> All Methods
        </button>
        <button className="bg-white border border-slate-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase text-slate-500 flex items-center gap-2 whitespace-nowrap">
          Latest First
        </button>
      </div>

      {/* --- Report Table --- */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <th className="p-5">Time</th>
                <th className="p-5">Customer / ID</th>
                <th className="p-5">UTR / Receipt</th>
                <th className="p-5">Amount</th>
                <th className="p-5">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="5" className="p-20 text-center font-bold text-slate-300 animate-pulse uppercase text-xs">Syncing Ledger...</td></tr>
              ) : collections.length > 0 ? (
                collections.map((pay) => (
                  <tr key={pay._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-5">
                      <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                        {new Date(pay.paymentDate || pay.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="font-black text-slate-800 uppercase text-sm">{pay.customerName}</div>
                      <div className="text-[9px] text-slate-400 font-bold">Loan: {pay.loanId}</div>
                    </td>
                    <td className="p-5">
                      <code className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                        {pay.utr || pay.receiptId || 'N/A'}
                      </code>
                    </td>
                    <td className="p-5">
                      <div className="text-sm font-black text-emerald-600">₹{pay.amount.toLocaleString()}</div>
                    </td>
                    <td className="p-5">
                      <span className="text-[9px] font-black uppercase border border-slate-200 text-slate-500 px-3 py-1 rounded-full group-hover:border-blue-500 group-hover:text-blue-500 transition-all">
                        {pay.method || 'UPI/QR'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-20 text-center">
                    <div className="text-4xl mb-4">💤</div>
                    <p className="text-slate-400 font-black uppercase italic text-xs tracking-widest">Aaj abhi tak koi payment record nahi hui hai.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center">
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em]">
          D-Finance Mathura | Official Collection Ledger
        </p>
      </div>
    </div>
  );
};

export default DailyCollectionReport;