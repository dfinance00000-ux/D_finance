import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  FiUsers, FiTrash2, FiPlus, FiCheckCircle, FiDollarSign, 
  FiActivity, FiKey, FiSearch, FiRefreshCw, FiClock, FiCalendar, 
  FiUser, FiLogOut, FiSettings, FiBell, FiChevronDown 
} from 'react-icons/fi';
import axios from 'axios';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Advisors');
  const [data, setData] = useState({ users: [], loans: [] });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({ fullName: '', email: '', mobile: '', password: '', role: 'User' });
  const [currentTime, setCurrentTime] = useState(new Date());

  const profileMenuRef = useRef(null);
  const adminInfo = JSON.parse(localStorage.getItem('user')) || { fullName: 'Master Admin', role: 'Admin' };

  const API_BASE = "http://localhost:5000/api";
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  };

  // Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [uRes, lRes] = await Promise.all([
        axios.get(`${API_BASE}/admin/all-users`, config),
        axios.get(`${API_BASE}/admin/all-loans`, config)
      ]);
      setData({ users: uRes.data, loans: lRes.data });
    } catch (err) {
      console.error("Atlas Sync Error:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const handleResetPassword = async (userId, name) => {
    const newPass = window.prompt(`Master Security: New Access Key for ${name}:`);
    if (!newPass || newPass.length < 4) return alert("Security Warning: Key too short!");
    try {
      await axios.post(`${API_BASE}/admin/change-password`, { userId, newPassword: newPass }, config);
      alert("✅ Access Key Updated!");
    } catch (err) { alert("❌ Reset failed."); }
  };

  // --- Search Logic Fix ---
  // Ye logic ab Users aur Loans dono par search apply karega
  const filteredUsers = data.users.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || u.mobile.includes(searchTerm);
    const matchesTab = activeTab === 'Advisors' ? ['user', 'fieldofficer'].includes(u.role.toLowerCase()) :
                       activeTab === 'Accountants' ? u.role.toLowerCase() === 'accountant' :
                       activeTab === 'Customers' ? u.role.toLowerCase() === 'customer' : true;
    return matchesSearch && matchesTab;
  });

  const filteredLoans = data.loans.filter(l => 
    l.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || l.loanId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#f0f2f5]">
      <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 font-black text-slate-900 uppercase tracking-widest text-[10px]">Initializing Command Center...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f7fe] font-sans text-slate-800">
      
      {/* 1. TOP NAVBAR (Landing Page Style) */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
              <FiShield size={20}/>
            </div>
            <span className="font-black text-xl tracking-tighter uppercase italic">D-Finance</span>
          </div>

          {/* Search Bar Working Fix */}
          <div className="hidden md:flex items-center bg-slate-100 rounded-2xl px-4 py-2 w-80 group focus-within:bg-white focus-within:ring-2 ring-slate-200 transition-all">
            <FiSearch className="text-slate-400 group-focus-within:text-slate-900" />
            <input 
              className="bg-transparent border-none outline-none pl-3 w-full text-xs font-bold"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:block text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}</p>
            <p className="text-[9px] font-bold text-slate-300 uppercase">{currentTime.toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric'})}</p>
          </div>

          <div className="h-8 w-[1px] bg-slate-200"></div>

          {/* Admin Profile with Options */}
          <div className="relative" ref={profileMenuRef}>
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-1 pr-3 rounded-2xl hover:bg-slate-100 transition-all"
            >
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-black shadow-md">
                {adminInfo.fullName.charAt(0)}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-black text-slate-900 leading-none">{adminInfo.fullName.split(' ')[0]}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Master Admin</p>
              </div>
              <FiChevronDown className={`text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 animate-in fade-in slide-in-from-top-2">
                <div className="p-3 border-b border-slate-50 mb-1">
                  <p className="text-xs font-black text-slate-900">{adminInfo.fullName}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Administrator Access</p>
                </div>
                <button className="w-full flex items-center gap-3 p-3 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                  <FiSettings/> System Settings
                </button>
                <button className="w-full flex items-center gap-3 p-3 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                  <FiActivity/> Activity Logs
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <FiLogOut/> Sign Out System
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="p-6 lg:p-10 space-y-10">
        
        {/* 2. DASHBOARD LANDING HERO */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Command Center</h2>
            <p className="text-slate-400 font-bold text-sm mt-3 uppercase tracking-widest italic">Node: Mathura_Branch_Secondary</p>
          </div>
          
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
            {['Advisors', 'Accountants', 'Customers', 'Loans'].map(tab => (
              <button 
                key={tab} 
                onClick={() => { setActiveTab(tab); setSearchTerm(""); }}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* 3. FINANCIAL HUD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard title="Gross Outflow" val={data.loans.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)} icon={<FiDollarSign/>} color="bg-blue-600" />
          <StatCard title="Total Recovery" val={data.loans.reduce((acc, curr) => acc + (Number(curr.totalPaid) || 0), 0)} icon={<FiCheckCircle/>} color="bg-emerald-500" />
          <StatCard title="Risk Exposure" val={data.loans.reduce((acc, curr) => acc + (Number(curr.totalPending) || 0), 0)} icon={<FiActivity/>} color="bg-rose-500" />
        </div>

        {/* 4. MASTER DATA LIST */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden">
          <div className="p-8 flex justify-between items-center border-b border-slate-50">
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">{activeTab} Master Registry</h3>
              <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Authorized Access Only</p>
            </div>
            
            {(activeTab === 'Advisors' || activeTab === 'Accountants') && (
              <button 
                onClick={() => { 
                  setFormData({...formData, role: activeTab === 'Advisors' ? 'User' : 'Accountant'}); 
                  setShowModal(true); 
                }}
                className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl text-[10px] font-black flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg"
              >
                <FiPlus size={18}/> REGISTER NEW PERSONNEL
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity Details</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Authentication</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">System Role</th>
                  <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeTab === 'Loans' ? (
                  filteredLoans.map(l => <LoanRow key={l._id} loan={l} />)
                ) : (
                  filteredUsers.map(u => (
                    <UserRow 
                      key={u._id} 
                      user={u} 
                      onReset={handleResetPassword}
                      onDelete={(id, name) => {
                        if(window.confirm(`Wipe ${name}?`)) axios.delete(`${API_BASE}/admin/users/${id}`, config).then(fetchData);
                      }}
                    />
                  ))
                )}
              </tbody>
            </table>
            {(activeTab === 'Loans' ? filteredLoans : filteredUsers).length === 0 && (
               <div className="p-20 text-center text-slate-300 font-black uppercase tracking-[0.5em]">No Matching Records</div>
            )}
          </div>
        </div>
      </div>

      {/* --- SIGNUP MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="bg-white p-12 rounded-[3.5rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-3xl font-black text-slate-800 mb-8 uppercase tracking-tighter">Personnel Authorization</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <input className="w-full p-4 rounded-2xl bg-slate-100 border-none font-bold text-sm" placeholder="Full Name" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
              <input className="w-full p-4 rounded-2xl bg-slate-100 border-none font-bold text-sm" type="email" placeholder="Official Email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <input className="w-full p-4 rounded-2xl bg-slate-100 border-none font-bold text-sm" placeholder="Mobile Number" required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
              <input className="w-full p-4 rounded-2xl bg-slate-100 border-none font-bold text-sm" type="password" placeholder="Define Password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              
              <div className="flex gap-4 pt-8">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 font-black text-slate-400 uppercase text-[10px] tracking-widest">Cancel</button>
                <button type="submit" className="flex-[2] py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-[10px] shadow-2xl hover:bg-emerald-600 transition-all tracking-widest">Authorize Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Component UI Helpers
const StatCard = ({ title, val, icon, color }) => (
  <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-white flex items-center gap-6 group hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500">
    <div className={`p-5 ${color} rounded-[2rem] text-white shadow-xl group-hover:scale-110 transition-transform`}>{icon}</div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <h2 className="text-3xl font-black tracking-tighter text-slate-900">₹{Number(val).toLocaleString()}</h2>
    </div>
  </div>
);

const UserRow = ({ user, onReset, onDelete }) => (
  <tr className="hover:bg-slate-50/50 transition-all group">
    <td className="px-10 py-7">
      <div className="text-[15px] font-black text-slate-900">{user.fullName}</div>
      <div className="text-[10px] text-slate-400 font-bold lowercase">{user.email}</div>
    </td>
    <td className="px-10 py-7">
      <div className="text-xs font-black text-slate-600">{user.mobile}</div>
      <div className="text-[9px] text-slate-300 font-mono">UID: {user._id.slice(-8).toUpperCase()}</div>
    </td>
    <td className="px-10 py-7">
      <span className="px-4 py-1.5 bg-slate-100 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest">{user.role}</span>
    </td>
    <td className="px-10 py-7 text-right">
      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
        <button onClick={() => onReset(user._id, user.fullName)} className="p-3 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-emerald-600 transition-all"><FiKey size={14}/></button>
        <button onClick={() => onDelete(user._id, user.fullName)} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><FiTrash2 size={14}/></button>
      </div>
    </td>
  </tr>
);

const LoanRow = ({ loan }) => (
  <tr className="hover:bg-slate-50/50 transition-all group">
    <td className="px-10 py-7">
      <div className="text-[15px] font-black text-slate-900 uppercase">{loan.customerName}</div>
      <div className="text-[10px] text-slate-400 font-bold">LID: {loan.loanId}</div>
    </td>
    <td className="px-10 py-7">
      <div className="text-[15px] font-black text-emerald-600">₹{Number(loan.amount).toLocaleString()}</div>
      <div className="text-[10px] text-slate-400 font-black uppercase">O/S: ₹{loan.totalPending}</div>
    </td>
    <td className="px-10 py-7">
      <div className={`text-[10px] font-black uppercase tracking-widest ${loan.status === 'Disbursed' ? 'text-emerald-500' : 'text-amber-500'}`}>
        ● {loan.status}
      </div>
    </td>
    <td className="px-10 py-7 text-right">
       <button className="text-[10px] font-black text-slate-900 border-b-2 border-slate-900 pb-1">AUDIT FILE</button>
    </td>
  </tr>
);

export default AdminDashboard;  