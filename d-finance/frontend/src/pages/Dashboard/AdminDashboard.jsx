import React, { useState, useEffect, useCallback } from 'react';
import { FiUsers, FiTrash2, FiPlus, FiFileText, FiCheckCircle, FiDollarSign, FiShield, FiTrendingUp, FiActivity } from 'react-icons/fi';
import axios from 'axios';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Advisors');
  const [data, setData] = useState({ users: [], loans: [] });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', mobile: '', password: '', role: 'User' });

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // 🔥 FIX: Backend routes matching
      const [uRes, lRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/all-users', config),
        axios.get('http://localhost:5000/api/admin/all-loans', config)
      ]);
      setData({ users: uRes.data, loans: lRes.data });
    } catch (err) {
      console.error("Sync Error:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- Financial Calculations ---
  const totalLoanAmount = data.loans.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalCollection = data.loans.reduce((acc, curr) => acc + (Number(curr.totalPaid) || 0), 0);
  const totalDue = data.loans.reduce((acc, curr) => acc + (Number(curr.totalPending) || 0), 0);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/signup', formData, config);
      alert(`${formData.role} added successfully to Cloud Registry!`);
      setShowModal(false);
      setFormData({ fullName: '', email: '', mobile: '', password: '', role: 'User' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Registration failed");
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Remove ${name} from system?`)) return;
    try {
        await axios.delete(`http://localhost:5000/api/admin/user/${id}`, config);
        fetchData();
    } catch (err) { alert("Delete route not active in backend"); }
  };

  // Roles Filtering (Backend case sensitive match)
  const advisors = data.users.filter(u => ['User', 'user', 'FieldOfficer'].includes(u.role));
  const accountants = data.users.filter(u => u.role === 'Accountant' || u.role === 'accountant');
  const customers = data.users.filter(u => u.role === 'Customer' || u.role === 'customer');

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-slate-400 animate-pulse uppercase tracking-widest">D-Finance Cloud Syncing...</div>;

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen space-y-8 font-sans">
      
      {/* --- FINANCIAL OVERVIEW --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinanceCard title="Disbursed" value={totalLoanAmount} icon={<FiDollarSign/>} color="bg-blue-600" />
        <FinanceCard title="Collected" value={totalCollection} icon={<FiCheckCircle/>} color="bg-emerald-600" />
        <FinanceCard title="Total Due" value={totalDue} icon={<FiActivity/>} color="bg-rose-600" />
      </div>

      {/* --- TAB NAVIGATION --- */}
      <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 w-fit">
        {['Advisors', 'Accountants', 'Customers', 'Loans'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab ? 'bg-slate-900 text-white shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* --- LIST TABLE --- */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 flex justify-between items-center border-b border-slate-50 bg-white">
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">{activeTab} Master Registry</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Live Database: MongoDB Atlas</p>
          </div>
          
          {(activeTab === 'Advisors' || activeTab === 'Accountants') && (
            <button 
              onClick={() => { 
                setFormData({...formData, role: activeTab === 'Advisors' ? 'User' : 'Accountant'}); 
                setShowModal(true); 
              }}
              className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg"
            >
              <FiPlus size={16}/> REGISTER {activeTab.slice(0, -1).toUpperCase()}
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-5">Personnel Details</th>
                <th className="px-8 py-5">Contact / Atlas ID</th>
                <th className="px-8 py-5">{activeTab === 'Loans' ? 'Principal' : 'Role'}</th>
                <th className="px-8 py-5 text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activeTab === 'Advisors' && advisors.map(u => <UserRow key={u._id} user={u} onDelete={handleDeleteUser} />)}
              {activeTab === 'Accountants' && accountants.map(u => <UserRow key={u._id} user={u} onDelete={handleDeleteUser} />)}
              {activeTab === 'Customers' && customers.map(u => <UserRow key={u._id} user={u} onDelete={handleDeleteUser} />)}
              {activeTab === 'Loans' && data.loans.map(l => <LoanRow key={l._id} loan={l} />)}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD STAFF MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white p-10 rounded-[3rem] w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tighter">New {formData.role} Entry</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <input className="w-full p-4 rounded-2xl bg-slate-100 border-none font-bold text-sm" placeholder="Full Name" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
              <input className="w-full p-4 rounded-2xl bg-slate-100 border-none font-bold text-sm" type="email" placeholder="Email Address" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <input className="w-full p-4 rounded-2xl bg-slate-100 border-none font-bold text-sm" placeholder="Mobile Number" required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
              <input className="w-full p-4 rounded-2xl bg-slate-100 border-none font-bold text-sm" type="password" placeholder="Create Access Password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 font-black text-slate-400 uppercase text-[10px]">Abort</button>
                <button type="submit" className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-lg hover:bg-emerald-700 transition-all">Authorize Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const FinanceCard = ({ title, value, icon, color }) => (
  <div className={`${color} p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200`}>
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-white/20 rounded-xl">{icon}</div>
    </div>
    <p className="text-xs font-bold opacity-80 uppercase mb-1">{title}</p>
    <h2 className="text-3xl font-black tracking-tighter">₹{Number(value).toLocaleString()}</h2>
  </div>
);

const UserRow = ({ user, onDelete }) => (
  <tr className="hover:bg-slate-50 transition-all">
    <td className="px-8 py-6">
      <div className="text-sm font-black text-slate-700">{user.fullName}</div>
      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{user.email}</div>
    </td>
    <td className="px-8 py-6">
      <div className="text-xs font-bold text-slate-500">{user.mobile}</div>
      <div className="text-[9px] text-slate-300 font-mono italic">UID: {user._id.slice(-8)}</div>
    </td>
    <td className="px-8 py-6">
      <span className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-500 uppercase">{user.role}</span>
    </td>
    <td className="px-8 py-6 text-right">
      <button onClick={() => onDelete(user._id, user.fullName)} className="text-slate-200 hover:text-rose-600 transition-colors"><FiTrash2 size={16}/></button>
    </td>
  </tr>
);

const LoanRow = ({ loan }) => (
  <tr className="hover:bg-slate-50 transition-all">
    <td className="px-8 py-6">
      <div className="text-sm font-black text-slate-700">{loan.customerName}</div>
      <div className="text-[10px] text-slate-400 font-bold">LID: {loan.loanId}</div>
    </td>
    <td className="px-8 py-6">
      <div className="text-sm font-black text-emerald-600">₹{Number(loan.amount).toLocaleString()}</div>
      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">OS: ₹{loan.totalPending}</div>
    </td>
    <td className="px-8 py-6">
      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase ${
        loan.status === 'Disbursed' ? 'bg-emerald-500 text-white shadow-md' : 'bg-amber-400 text-white'
      }`}>
        {loan.status}
      </span>
    </td>
    <td className="px-8 py-6 text-right text-slate-300 font-black text-[10px] hover:text-slate-900 cursor-pointer">VIEW HISTORY</td>
  </tr>
);

export default AdminDashboard;