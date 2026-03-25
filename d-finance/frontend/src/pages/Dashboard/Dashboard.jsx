import React, { useState, useEffect } from 'react';
import { FiUsers, FiTrash2, FiPlus, FiFileText, FiCheckCircle, FiClock, FiShield } from 'react-icons/fi';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Advisors');
  const [data, setData] = useState({ users: [], loans: [] });
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', mobile: '', password: '', role: 'User' });

  // Data Fetching: Sabhi users aur loans ko ek sath lana
  const fetchData = async () => {
    try {
      const [uRes, lRes] = await Promise.all([
        fetch('http://localhost:5000/users'),
        fetch('http://localhost:5000/loans')
      ]);
      const users = await uRes.json();
      const loans = await lRes.json();
      setData({ users, loans });
    } catch (err) { console.error("Data Sync Error"); }
  };

  useEffect(() => { fetchData(); }, []);

  // Admin Add Logic (Advisor/Accountant)
  const handleAddUser = async (e) => {
    e.preventDefault();
    const newUser = { ...formData, id: Date.now().toString(), createdAt: new Date().toISOString() };
    
    await fetch('http://localhost:5000/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });

    alert(`${formData.role} added successfully! Now they can login.`);
    setShowModal(false);
    setFormData({ fullName: '', email: '', mobile: '', password: '', role: 'User' });
    fetchData();
  };

  // Admin Delete Logic (Universal Delete)
  const handleDelete = async (endpoint, id, name) => {
    if (window.confirm(`Warning: Are you sure you want to remove ${name}?`)) {
      await fetch(`http://localhost:5000/${endpoint}/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  // Filters for Tabs
  const advisors = data.users.filter(u => u.role === 'User' || u.role === 'Advisor');
  const accountants = data.users.filter(u => u.role === 'Accountant');
  const customers = data.users.filter(u => u.role === 'Customer');

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* --- TOP TAB NAVIGATION --- */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-200/50 rounded-2xl w-fit">
        {['Advisors', 'Accountants', 'Customers', 'Loans'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${
              activeTab === tab ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* --- MASTER LIST CONTAINER --- */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div>
            <h3 className="font-black text-slate-800 uppercase tracking-tighter text-lg">Manage {activeTab}</h3>
            <p className="text-[10px] text-slate-400 font-bold">Total {activeTab}: {
              activeTab === 'Advisors' ? advisors.length : 
              activeTab === 'Accountants' ? accountants.length : 
              activeTab === 'Customers' ? customers.length : data.loans.length
            }</p>
          </div>
          
          {(activeTab === 'Advisors' || activeTab === 'Accountants') && (
            <button 
              onClick={() => { setFormData({...formData, role: activeTab === 'Advisors' ? 'User' : 'Accountant'}); setShowModal(true); }}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all"
            >
              <FiPlus /> Add {activeTab.slice(0, -1)}
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="p-5">Details</th>
                <th className="p-5">Information</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {/* Render Rows based on Tab */}
              {activeTab === 'Advisors' && advisors.map(u => <DataRow key={u.id} item={u} type="users" onDelete={handleDelete} />)}
              {activeTab === 'Accountants' && accountants.map(u => <DataRow key={u.id} item={u} type="users" onDelete={handleDelete} />)}
              {activeTab === 'Customers' && customers.map(u => <DataRow key={u.id} item={u} type="users" onDelete={handleDelete} />)}
              {activeTab === 'Loans' && data.loans.map(l => <LoanRow key={l.id} loan={l} onDelete={handleDelete} />)}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD MODAL (For Advisors/Accountants) --- */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-[2rem] w-full max-w-md shadow-2xl border border-white/20">
            <h3 className="text-xl font-black text-slate-800 mb-1">New {formData.role} Registration</h3>
            <p className="text-xs text-slate-400 mb-6 font-medium">Only Admin can create these credentials.</p>
            <form onSubmit={handleAddUser} className="space-y-4">
              <input className="w-full p-4 rounded-2xl bg-slate-50 border-none text-sm font-bold" placeholder="Full Name" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
              <input className="w-full p-4 rounded-2xl bg-slate-50 border-none text-sm font-bold" type="email" placeholder="Email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <input className="w-full p-4 rounded-2xl bg-slate-50 border-none text-sm font-bold" placeholder="Mobile" required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
              <input className="w-full p-4 rounded-2xl bg-slate-50 border-none text-sm font-bold" type="password" placeholder="Set Password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 p-4 font-bold text-slate-400 text-sm">Cancel</button>
                <button type="submit" className="flex-1 p-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 text-sm">Create Access</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Helper Row Components ---
const DataRow = ({ item, type, onDelete }) => (
  <tr className="hover:bg-slate-50/50 transition-colors group">
    <td className="p-5">
      <div className="text-sm font-black text-slate-700">{item.fullName}</div>
      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: {item.id}</div>
    </td>
    <td className="p-5 text-xs text-slate-500 font-bold">{item.email || item.mobile}</td>
    <td className="p-5"><span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase">{item.role}</span></td>
    <td className="p-5 text-right">
      <button onClick={() => onDelete(type, item.id, item.fullName)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
        <FiTrash2 size={18} />
      </button>
    </td>
  </tr>
);

const LoanRow = ({ loan, onDelete }) => (
  <tr className="hover:bg-slate-50/50 transition-colors group">
    <td className="p-5">
      <div className="text-sm font-black text-slate-700">{loan.customerName}</div>
      <div className="text-[10px] text-slate-400 font-bold uppercase">Loan ID: {loan.id}</div>
    </td>
    <td className="p-5 text-sm font-black text-emerald-600">₹{Number(loan.amount).toLocaleString()}</td>
    <td className="p-5">
      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
        loan.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
      }`}>
        {loan.status}
      </span>
    </td>
    <td className="p-5 text-right">
      <button onClick={() => onDelete('loans', loan.id, `Loan for ${loan.customerName}`)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
        <FiTrash2 size={18} />
      </button>
    </td>
  </tr>
);

export default Dashboard;