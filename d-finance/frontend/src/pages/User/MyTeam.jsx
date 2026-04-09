import React, { useState, useEffect, useCallback } from 'react';
import API from "../../api/axios"; // 👈 Ye path dhyan se dekho
import { FiUsers, FiRefreshCw, FiSearch, FiChevronRight, FiAlertCircle } from 'react-icons/fi';
const MyTeam = () => {
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debugInfo, setDebugInfo] = useState(""); // Debugging ke liye

  // 1. Get User from LocalStorage
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;

  const fetchMyTeam = useCallback(async () => {
    if (!currentUser) {
      setDebugInfo("Error: User not found in localStorage. Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching loans for Advisor ID:", currentUser._id);
      
      const res = await API.get('/admin/all-loans'); 
      console.log("Total loans received from DB:", res.data.length);

      // 🔥 Logic Fix: Match by ID and Name
      const myCustomers = res.data.filter(loan => {
        const isIdMatch = String(loan.fieldOfficerId) === String(currentUser._id);
        const isNameMatch = loan.verifiedByName === currentUser.fullName;
        const isOfficerNameMatch = loan.fieldOfficerName === currentUser.fullName;
        return isIdMatch || isNameMatch || isOfficerNameMatch;
      });
      
      console.log("Filtered Customers for this Advisor:", myCustomers.length);
      
      if (myCustomers.length === 0) {
        setDebugInfo(`No loans linked to ${currentUser.fullName} (ID: ${currentUser._id})`);
      } else {
        setDebugInfo("");
      }

      setTeamData(myCustomers.reverse());
    } catch (err) {
      console.error("Fetch Error:", err);
      setDebugInfo("API Error: Server se data nahi mila.");
    } finally {
      setLoading(false);
    }
  }, [currentUser?._id, currentUser?.fullName]);

  useEffect(() => {
    fetchMyTeam();
  }, []); // Run on mount

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <FiRefreshCw className="animate-spin text-blue-600" size={40} />
      <p className="mt-4 font-black text-slate-400 uppercase tracking-widest text-xs">Accessing Team Ledger...</p>
    </div>
  );

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen font-sans">
      
      {/* Debug Alert (Sirf tab dikhega jab data 0 ho) */}
      {debugInfo && (
        <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-700 flex items-center gap-3 rounded-r-xl shadow-sm">
          <FiAlertCircle size={20}/>
          <span className="text-xs font-bold uppercase tracking-tight">{debugInfo}</span>
        </div>
      )}

      {/* --- Header --- */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">TEAM PORTFOLIO</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{currentUser?.fullName} • Advisor Mode</p>
        </div>
        <button onClick={fetchMyTeam} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 shadow-sm transition-all">
          <FiRefreshCw />
        </button>
      </div>

      {/* --- Search --- */}
      <div className="relative mb-8 max-w-md">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
        <input 
          className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-xs font-bold outline-none shadow-sm focus:ring-2 ring-blue-500/10"
          placeholder="Search Team Member..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- List --- */}
      <div className="grid gap-4">
        {teamData.length > 0 ? teamData.filter(t => t.customerName.toLowerCase().includes(searchTerm.toLowerCase())).map((member) => (
          <div key={member._id} className="bg-white p-6 rounded-[2rem] border border-white shadow-sm flex items-center justify-between hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl font-black">
                {member.customerName.charAt(0)}
              </div>
              <div>
                <h3 className="font-black text-slate-800 uppercase text-sm tracking-tight">{member.customerName}</h3>
                <div className="flex gap-2 mt-1">
                  <span className="text-[9px] font-black px-2 py-0.5 bg-slate-100 text-slate-400 rounded-md">REF: {member.loanId}</span>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${member.status === 'Disbursed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {member.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden md:flex gap-10 text-right mr-10">
               <div>
                  <p className="text-[9px] font-black text-slate-300 uppercase">Principal</p>
                  <p className="text-sm font-black text-slate-800 italic">₹{member.amount.toLocaleString()}</p>
               </div>
               <div>
                  <p className="text-[9px] font-black text-slate-300 uppercase">Collection</p>
                  <p className="text-sm font-black text-emerald-600 italic">₹{member.weeklyEMI}</p>
               </div>
            </div>

            <button className="w-10 h-10 bg-slate-50 text-slate-300 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
              <FiChevronRight />
            </button>
          </div>
        )) : (
          <div className="py-32 text-center bg-white rounded-[3rem] border border-slate-100">
             <div className="text-4xl mb-4 grayscale opacity-20">📂</div>
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No data found in your registry</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTeam;