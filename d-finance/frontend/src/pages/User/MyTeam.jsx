import React, { useState, useEffect, useCallback } from 'react';
import API from "../../api/axios"; 
import { 
  FiUsers, FiRefreshCw, FiSearch, FiChevronRight, FiAlertCircle, 
  FiTrendingUp, FiXCircle, FiClock, FiEdit3, FiX, FiCheckCircle,
  FiHome, FiBriefcase, FiUser, FiInfo, FiDollarSign
} from 'react-icons/fi';

const MyTeam = () => {
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  const [selectedMember, setSelectedMember] = useState(null); 
  const [isUpdating, setIsUpdating] = useState(false);
  
  // --- 🔥 NEW: Cash Collection State ---
  const [cashAmount, setCashAmount] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;

  const fetchMyTeam = useCallback(async () => {
    if (!currentUser) {
      setDebugInfo("Login Again: Session Expired");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await API.get('/admin/all-loans'); 
      
      const myCustomers = res.data.filter(loan => {
        const isIdMatch = String(loan.fieldOfficerId) === String(currentUser._id || currentUser.id);
        const isNameMatch = loan.verifiedByName === currentUser.fullName;
        const isOfficerNameMatch = loan.fieldOfficerName === currentUser.fullName;
        return isIdMatch || isNameMatch || isOfficerNameMatch;
      });
      
      setTeamData(myCustomers.reverse());
      if (myCustomers.length === 0) setDebugInfo("No records found.");
      else setDebugInfo("");

    } catch (err) {
      setDebugInfo("Server Connection Failed.");
    } finally {
      setLoading(false);
    }
  }, [currentUser?._id, currentUser?.id, currentUser?.fullName]);

  useEffect(() => { fetchMyTeam(); }, [fetchMyTeam]);

  // --- Stats ---
  const stats = {
    disbursed: teamData.filter(t => t.status === 'Disbursed').length,
    pending: teamData.filter(t => !['Disbursed', 'Rejected'].includes(t.status)).length,
    rejected: teamData.filter(t => t.status === 'Rejected').length,
    totalVolume: teamData.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
  };

  const handleUpdate = async (e) => {
    if(e) e.preventDefault();
    setIsUpdating(true);
    try {
      await API.patch(`/loans/${selectedMember._id}`, selectedMember);
      alert("✅ Audit Report Synchronized!");
      setSelectedMember(null);
      fetchMyTeam(); 
    } catch (err) {
      alert("❌ Update Failed");
    } finally {
      setIsUpdating(false);
    }
  };

  // --- 🔥 NEW: Cash Payment Handler ---
  const handleCollectCash = async () => {
    if (!cashAmount || cashAmount <= 0) return alert("Please enter a valid amount");
    
    const confirmMsg = `Confirm Cash Collection: ₹${cashAmount} from ${selectedMember.customerName}?`;
    if (!window.confirm(confirmMsg)) return;

    setIsPaying(true);
    try {
      await API.post(`/loans/pay-manual/${selectedMember.loanId}`, {
        amount: Number(cashAmount),
        utr: `CASH_OFFICER_${currentUser.fullName.split(' ')[0].toUpperCase()}_${Date.now().toString().slice(-4)}`,
        customerId: selectedMember.customerId,
        customerName: selectedMember.customerName,
        screenshot: "CASH_RECPT", 
        adminNote: `Cash collected by Officer: ${currentUser.fullName}`
      });

      alert("💰 Cash Repayment Logged! Status: Pending Accountant Approval.");
      setCashAmount("");
      setSelectedMember(null);
      fetchMyTeam();
    } catch (err) {
      alert("❌ Payment Failed: " + (err.response?.data?.error || "Server Error"));
    } finally {
      setIsPaying(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <FiRefreshCw className="animate-spin text-blue-600" size={40} />
      <p className="mt-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Accessing Global Ledger...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-[#f8fafc] min-h-screen font-sans">
      
      {/* Header & Stats */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic">TEAM PORTFOLIO</h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Node: {currentUser?.fullName}</p>
        </div>
        <button onClick={fetchMyTeam} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-blue-600 transition-all"><FiRefreshCw /></button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Disbursed" val={stats.disbursed} icon={<FiCheckCircle/>} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard label="Pending" val={stats.pending} icon={<FiClock/>} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Rejected" val={stats.rejected} icon={<FiXCircle/>} color="text-rose-600" bg="bg-rose-50" />
        <StatCard label="Total Vol." val={`₹${stats.totalVolume.toLocaleString()}`} icon={<FiTrendingUp/>} color="text-slate-800" bg="bg-white" />
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
        <input 
          className="w-full pl-11 pr-4 py-4 bg-white rounded-2xl text-xs font-bold outline-none shadow-sm placeholder:text-slate-300"
          placeholder="Search team member..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Team List */}
      <div className="space-y-3">
        {teamData.filter(t => t.customerName.toLowerCase().includes(searchTerm.toLowerCase())).map((member) => (
          <div key={member._id} onClick={() => setSelectedMember(member)} className="bg-white p-5 rounded-[1.5rem] shadow-sm flex items-center justify-between cursor-pointer hover:border-blue-400 border border-transparent transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-lg">{member.customerName.charAt(0)}</div>
              <div>
                <h3 className="font-black text-slate-800 uppercase text-xs tracking-tight">{member.customerName}</h3>
                <span className="text-[8px] font-black px-2 py-0.5 bg-slate-100 text-slate-400 rounded">ID: {member.loanId}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
                <span className={`text-[8px] font-black px-2 py-1 rounded uppercase ${member.status === 'Disbursed' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>{member.status}</span>
                <FiChevronRight className="text-slate-300" />
            </div>
          </div>
        ))}
      </div>

      {/* --- Detailed Modal (With NEW Side Repayment Section) --- */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black italic text-xl uppercase tracking-tighter">File Control Center</h3>
                <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">ID: {selectedMember.loanId} | Customer: {selectedMember.customerName}</p>
              </div>
              <button onClick={() => setSelectedMember(null)} className="p-2 hover:bg-white/10 rounded-full"><FiX size={24}/></button>
            </div>

            <div className="flex flex-col md:flex-row h-[75vh]">
                {/* Left: Audit Form (Old Section) */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 border-r border-slate-100 custom-scroll">
                    <form onSubmit={handleUpdate} className="space-y-8">
                        <div className="space-y-4">
                            <SectionHeader icon={<FiInfo/>} title="Basic File Info" />
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Customer Name" val={selectedMember.customerName} onChange={(v) => setSelectedMember({...selectedMember, customerName: v})} />
                                <InputGroup label="Customer Phone" val={selectedMember.customerMobile || selectedMember.nomineeMobile} onChange={(v) => setSelectedMember({...selectedMember, customerMobile: v})} />
                                <InputGroup label="Loan Amount" val={selectedMember.amount} type="number" onChange={(v) => setSelectedMember({...selectedMember, amount: v})} />
                                <InputGroup label="EMI Amount" val={selectedMember.installmentAmount || selectedMember.weeklyEMI} type="number" onChange={(v) => setSelectedMember({...selectedMember, installmentAmount: v})} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <SectionHeader icon={<FiHome/>} title="Residential & Area Audit" />
                            <div className="grid grid-cols-2 gap-4">
                                <SelectGroup label="House Type" val={selectedMember.houseType} options={['CONCRETE', 'KUTCHA', 'TILED', 'HUT']} onChange={(v) => setSelectedMember({...selectedMember, houseType: v})} />
                                <SelectGroup label="Area Type" val={selectedMember.areaType} options={['RURAL', 'URBAN', 'SEMI-URBAN']} onChange={(v) => setSelectedMember({...selectedMember, areaType: v})} />
                                <SelectGroup label="House Ownership" val={selectedMember.residenceNature} options={['Owned', 'Rented', 'Ancestral']} onChange={(v) => setSelectedMember({...selectedMember, residenceNature: v})} />
                                <InputGroup label="Monthly Income" val={selectedMember.monthlyIncome} type="number" onChange={(v) => setSelectedMember({...selectedMember, monthlyIncome: v})} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <SectionHeader icon={<FiBriefcase/>} title="File Status Control" />
                            <select className="w-full p-4 bg-slate-100 rounded-2xl text-xs font-black text-slate-700 outline-none" value={selectedMember.status} onChange={(e) => setSelectedMember({...selectedMember, status: e.target.value})}>
                                <option value="Applied">Applied</option>
                                <option value="Verification Pending">Verification Pending</option>
                                <option value="Field Verified">Field Verified</option>
                                <option value="Disbursed">Disbursed</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>

                        <button type="submit" disabled={isUpdating} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase shadow-lg">
                            {isUpdating ? "Processing..." : "Sync Audit Report"}
                        </button>
                    </form>
                </div>

                {/* Right: 🔥 NEW Side Repayment Section */}
                <div className="w-full md:w-80 bg-slate-50 p-8 flex flex-col justify-start">
                    <SectionHeader icon={<FiDollarSign/>} title="Repayment Node" />
                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">If the customer is paying by cash, enter the amount below to log the collection.</p>
                    
                    <div className="mt-8 space-y-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                            <label className="text-[9px] font-black text-slate-400 uppercase block mb-2">Collection Amount</label>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-black text-slate-300">₹</span>
                                <input 
                                    type="number" 
                                    className="w-full text-2xl font-black text-slate-900 outline-none placeholder:text-slate-100" 
                                    placeholder="0.00"
                                    value={cashAmount}
                                    onChange={(e) => setCashAmount(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-[10px] font-bold px-2">
                                <span className="text-slate-400">Balance Due:</span>
                                <span className="text-slate-900">₹{(selectedMember.totalPayable - selectedMember.totalPaid) || 0}</span>
                            </div>
                            <button 
                                onClick={handleCollectCash}
                                disabled={isPaying || !cashAmount}
                                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isPaying ? "Verifying..." : "Collect Cash Now"}
                            </button>
                        </div>

                        {/* Recent Activity Mini-log */}
                        <div className="pt-6 border-t border-slate-200">
                             <p className="text-[9px] font-black text-slate-400 uppercase mb-4">Account Status</p>
                             <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                                 <span className="text-[10px] font-bold text-slate-500">Repayment Type</span>
                                 <span className="text-[10px] font-black text-blue-600">Manual / Cash</span>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Helper Components ---
const StatCard = ({ label, val, icon, color, bg }) => (
  <div className={`${bg} p-4 rounded-3xl border border-white shadow-sm flex items-center gap-4`}>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} bg-white shadow-sm text-lg`}>{icon}</div>
    <div>
      <p className="text-[8px] font-black text-slate-400 uppercase">{label}</p>
      <p className={`text-sm font-black italic ${color}`}>{val}</p>
    </div>
  </div>
);

const SectionHeader = ({ icon, title }) => (
  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
    <span className="text-blue-600">{icon}</span>
    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{title}</h4>
  </div>
);

const InputGroup = ({ label, val, type="text", onChange }) => (
  <div className="space-y-1">
    <label className="text-[9px] font-black uppercase text-slate-400 ml-1">{label}</label>
    <input 
      type={type}
      className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 ring-blue-500/10 transition-all"
      value={val}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const SelectGroup = ({ label, val, options, onChange }) => (
  <div className="space-y-1">
    <label className="text-[9px] font-black uppercase text-slate-400 ml-1">{label}</label>
    <select 
      className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 ring-blue-500/10 transition-all"
      value={val}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export default MyTeam;