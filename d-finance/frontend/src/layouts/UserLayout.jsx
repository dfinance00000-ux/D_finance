import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FiLayout, FiHome, FiUsers, FiDollarSign, FiLogOut, FiCopy } from 'react-icons/fi';

const UserLayout = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user')) || { fullName: 'Advisor', id: 'N/A' };

  // Copy Referral ID function
  const copyReferral = () => {
    navigator.clipboard.writeText(user.id);
    alert("Referral ID Copied: " + user.id);
  };

  const linkStyle = (path) => `flex items-center gap-3 p-3.5 rounded-xl mb-2 transition-all font-bold text-sm ${
    location.pathname === path 
      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' 
      : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
  }`;

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans">
      {/* --- Advisor Sidebar --- */}
      <div className="w-72 bg-emerald-950 text-white p-6 flex flex-col shadow-2xl border-r border-emerald-900">
        <div className="mb-10 px-2">
          <h2 className="text-2xl font-black text-white tracking-tighter italic">D-FINANCE</h2>
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-1">Field Officer Panel</p>
        </div>
        
        <nav className="flex-1">
          <Link to="/user" className={linkStyle('/user')}>
            <FiLayout size={18} /> My Dashboard
          </Link>
          
          <Link to="/user/field-verification" className={linkStyle('/user/field-verification')}>
            <FiHome size={18} /> Field Verification (LUC)
          </Link>
          
          <Link to="/user/my-team" className={linkStyle('/user/my-team')}>
            <FiUsers size={18} /> My Downline
          </Link>
          
          <Link to="/user/payouts" className={linkStyle('/user/payouts')}>
            <FiDollarSign size={18} /> Commission Reports
          </Link>
        </nav>

        {/* --- REFERRAL CARD: Highly Important for Advisor --- */}
        <div className="bg-emerald-900/50 p-4 rounded-2xl border border-emerald-800 mb-6">
          <p className="text-[10px] font-black text-emerald-400 uppercase mb-2">My Referral ID</p>
          <div className="flex items-center justify-between bg-emerald-950 p-2 rounded-lg border border-emerald-700">
            <code className="text-xs font-mono text-emerald-200">{user.id}</code>
            <button onClick={copyReferral} className="text-emerald-400 hover:text-white transition-colors">
              <FiCopy size={14} />
            </button>
          </div>
          <p className="text-[9px] text-emerald-500 mt-2 italic">*Share this with customers during signup</p>
        </div>

        <div className="pt-6 border-t border-emerald-900">
          <p className="text-[9px] text-emerald-600 mb-4 uppercase font-black text-center tracking-widest">
            SOP Version 1.3.11 Compliant 
          </p>
          <button 
            onClick={() => { localStorage.clear(); window.location.href='/login'; }}
            className="w-full flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white p-3 rounded-xl text-xs font-black transition-all shadow-lg shadow-rose-900/20"
          >
            <FiLogOut /> Logout Session
          </button>
        </div>
      </div>

      {/* --- Main Area --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white shadow-sm flex items-center px-10 justify-between border-b border-slate-200">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-sm">
                {user.fullName.charAt(0)}
              </div>
              <div>
                <span className="font-black text-slate-800 text-lg block leading-none">{user.fullName}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Advisor Portal • ID: {user.id}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right mr-4 hidden md:block">
              <span className="text-[10px] text-orange-600 font-black uppercase block tracking-widest">Responsibility</span>
              <span className="text-xs font-bold text-slate-500 italic">Data Correctness in KYCV stage</span>
            </div>
            <div className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-md">
              Senior Advisor
            </div>
          </div>
        </header>
        
        <main className="p-10 overflow-y-auto bg-slate-50/50 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserLayout;