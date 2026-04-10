import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiPieChart, FiPlusCircle, FiActivity, FiCreditCard, 
  FiLogOut, FiUser, FiBell, FiChevronRight, FiMenu, FiX 
} from 'react-icons/fi';

const CustomerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans antialiased text-slate-900 overflow-x-hidden">
      
      {/* --- SIDEBAR: Mobile Logic Included --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out shadow-2xl
        lg:translate-x-0 
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-emerald-400 tracking-tighter italic">D-FINANCE</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Customer Portal</p>
          </div>
          {/* Close button for Mobile */}
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400">
            <FiX size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <MenuLink to="/customer/dashboard" icon={<FiPieChart />} label="Dashboard" active={isActive('/customer/dashboard')} onClick={() => setIsMobileMenuOpen(false)} />
          <MenuLink to="/customer/apply-loan" icon={<FiPlusCircle />} label="Apply for Loan" active={isActive('/customer/apply-loan')} onClick={() => setIsMobileMenuOpen(false)} />
          <MenuLink to="/customer/tracking" icon={<FiActivity />} label="Track Application" active={isActive('/customer/tracking')} onClick={() => setIsMobileMenuOpen(false)} />
          <MenuLink to="/customer/emi" icon={<FiCreditCard />} label="EMI Payments" active={isActive('/customer/emi')} onClick={() => setIsMobileMenuOpen(false)} />
        </nav>

        {/* User Card at Bottom */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/40 mb-4">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 font-bold flex-shrink-0">
              {user?.fullName?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black truncate">{user?.fullName}</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">ID: {user?.id?.slice(-8).toUpperCase()}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-black text-xs tracking-widest border border-red-500/20"
          >
            <FiLogOut /> LOGOUT
          </button>
        </div>
      </aside>

      {/* --- OVERLAY for Mobile --- */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-72 transition-all duration-300">
        
        {/* Navbar / Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 lg:px-10 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {/* Hamburger button */}
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 bg-slate-100 rounded-xl text-slate-600">
              <FiMenu size={20} />
            </button>

            <div className="hidden sm:flex items-center gap-2 text-slate-400 font-medium text-sm">
              <span>Portal</span>
              <FiChevronRight size={14} />
              <span className="text-slate-900 font-bold capitalize">
                {location.pathname.split('/').pop().replace('-', ' ')}
              </span>
            </div>
            {/* Small text for mobile breadcrumb */}
            <span className="sm:hidden text-slate-900 font-black text-xs uppercase tracking-widest">
                {location.pathname.split('/').pop().replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <div className="relative cursor-pointer p-2 hover:bg-slate-50 rounded-xl transition-colors">
              <FiBell className="text-slate-400" size={20} />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
            </div>
            <div className="h-8 w-[1px] bg-slate-100"></div>
            <div className="flex items-center gap-3">
               <div className="text-right hidden md:block">
                  <p className="text-xs font-black text-slate-800 leading-none">Status</p>
                  <p className="text-[9px] text-emerald-600 font-black uppercase mt-1">Verified</p>
               </div>
               <div className="w-9 h-9 lg:w-10 lg:h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 shadow-inner">
                  <FiUser size={18} />
               </div>
            </div>
          </div>
        </header>

        {/* Content Injection */}
        <main className="p-4 lg:p-10 flex-1">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="max-w-6xl mx-auto">
                <Outlet />
            </div>
          </div>
        </main>

        <footer className="p-6 text-center text-[9px] lg:text-[11px] font-bold text-slate-300 uppercase tracking-[0.2em] leading-loose">
          D-Finance Mathura • Secured Transaction Node • 2026
        </footer>
      </div>

      <style>{`
        @keyframes slide-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: slide-in 0.5s ease-out; }
      `}</style>
    </div>
  );
};

const MenuLink = ({ to, icon, label, active, onClick }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
      active 
      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <span className={`text-lg transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
      {icon}
    </span>
    <span className="text-sm font-bold tracking-tight">{label}</span>
  </Link>
);

export default CustomerLayout;