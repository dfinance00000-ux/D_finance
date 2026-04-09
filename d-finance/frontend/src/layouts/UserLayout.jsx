import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  FiLayout, FiHome, FiUsers, FiDollarSign, FiLogOut, 
  FiCopy, FiShield, FiTrendingUp, FiCheckCircle 
} from 'react-icons/fi';

const UserLayout = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user')) || { fullName: 'Advisor', id: 'ADV-00000' };

  const copyReferral = () => {
    navigator.clipboard.writeText(user.id);
    // Custom beautiful alert use kar sakte ho baad mein
    alert("🚀 Referral ID Copied: " + user.id);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
      
      {/* --- SIDEBAR: Premium Deep Emerald --- */}
      <aside className="w-80 bg-[#022c22] text-white flex flex-col shadow-[10px_0_40px_rgba(0,0,0,0.1)] z-50">
        <div className="p-8">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <FiShield className="text-white text-xl" />
             </div>
             <div>
                <h2 className="text-xl font-black text-white tracking-tighter leading-none">D-FINANCE</h2>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em] mt-1.5">Executive Hub</p>
             </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5">
          <p className="px-4 text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-3">Main Navigation</p>
          
          <MenuLink to="/user" icon={<FiLayout />} label="My Dashboard" active={isActive('/user')} />
          <MenuLink to="/user/field-verification" icon={<FiHome />} label="Field Verification (LUC)" active={isActive('/user/field-verification')} />
          <MenuLink to="/user/my-team" icon={<FiUsers />} label="My Downline" active={isActive('/user/my-team')} />
          <MenuLink to="/user/payouts" icon={<FiDollarSign />} label="Commission Reports" active={isActive('/user/payouts')} />
        </nav>

        {/* --- REFERRAL CARD: Interactive & Bold --- */}
        <div className="px-6 mb-8">
          <div className="bg-emerald-900/30 border border-emerald-800/50 rounded-[2rem] p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Share & Earn</span>
              <FiTrendingUp className="text-emerald-500" />
            </div>
            <div className="flex items-center justify-between bg-emerald-950/80 p-3 rounded-2xl border border-emerald-700 group hover:border-emerald-500 transition-all duration-300">
              <code className="text-sm font-black font-mono text-emerald-200 tracking-wider">
                {user.id?.slice(-8).toUpperCase()}
              </code>
              <button 
                onClick={copyReferral} 
                className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
              >
                <FiCopy size={14} />
              </button>
            </div>
            <p className="text-[9px] text-emerald-600 mt-3 font-bold text-center italic uppercase leading-relaxed">
              Use this code for <br/> new customer onboarding
            </p>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-emerald-900/50 bg-[#011f18]">
          <button 
            onClick={() => { localStorage.clear(); window.location.href='/login'; }}
            className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 py-4 rounded-2xl text-[11px] font-black transition-all border border-white/5 hover:border-rose-500/20"
          >
            <FiLogOut /> EXIT SESSION
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Header: Dynamic & Clean */}
        <header className="h-24 bg-white/70 backdrop-blur-md flex items-center px-12 justify-between border-b border-slate-100 sticky top-0 z-40">
          <div className="flex items-center gap-5">
             <div className="relative">
                <div className="h-14 w-14 rounded-3xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-inner">
                  <span className="text-xl font-black">{user.fullName.charAt(0)}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full"></div>
             </div>
             <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{user.fullName}</h1>
                <div className="flex items-center gap-2 mt-1.5">
                   <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold">ID: {user.id}</span>
                   <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                   <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest flex items-center gap-1">
                      <FiCheckCircle /> Authorized Advisor
                   </span>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden lg:block mr-4">
              <span className="text-[10px] text-slate-400 font-black uppercase block tracking-widest mb-1">Target Achievement</span>
              <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                 <div className="w-3/4 h-full bg-emerald-500 rounded-full"></div>
              </div>
            </div>
            <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[11px] font-black tracking-widest uppercase shadow-xl shadow-slate-900/20">
              Senior Grade
            </div>
          </div>
        </header>
        
        {/* Main Content Scroll Area */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-white p-12 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <Outlet />
            </div>
          </div>
        </main>

        <footer className="h-10 bg-white border-t border-slate-100 px-12 flex items-center justify-between text-[9px] font-black text-slate-300 tracking-[0.2em] uppercase">
          <div>D-Finance Mathura Branch • 2026</div>
          <div className="flex gap-4">
             <span>LUC v2.4</span>
             <span className="text-emerald-400">● System Encrypted</span>
          </div>
        </footer>
      </div>

      {/* Tailwind Specific Animations */}
      <style>{`
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

// --- Sub-component for Sidebar Links ---
const MenuLink = ({ to, icon, label, active }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
      active 
      ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 translate-x-2' 
      : 'text-emerald-100/60 hover:bg-white/5 hover:text-white'
    }`}
  >
    <span className={`text-xl transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
      {icon}
    </span>
    <span className="text-[13px] font-bold tracking-tight">{label}</span>
  </Link>
);

export default UserLayout;