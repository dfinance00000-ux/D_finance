import React, { useState, useEffect } from 'react';
import { 
  FiSearch, FiBell, FiUser, FiSettings, 
  FiChevronDown, FiLogOut, FiMoon, FiSun, FiShield 
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // User Data from LocalStorage
  const user = JSON.parse(localStorage.getItem('user')) || { fullName: 'Admin User', role: 'Super Admin' };

  // --- SEARCH LOGIC ---
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    console.log("Searching for:", searchQuery);
    // Yahan aap redirect kar sakte hain search result page par
    // navigate(`/admin/search?query=${searchQuery}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="w-full h-16 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 relative">
      
      {/* 1. ENABLED SEARCH BAR */}
      <form onSubmit={handleSearch} className="relative group w-full max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
        </div>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Loan ID, UTR or Member..." 
          className="w-full pl-10 pr-4 py-2.5 bg-slate-100/50 border border-slate-200/60 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300"
        />
        {searchQuery && (
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-indigo-600 text-white px-2 py-1 rounded-lg font-black uppercase">
            Find
          </button>
        )}
      </form>

      {/* 2. RIGHT ACTIONS */}
      <div className="flex items-center gap-4">
        
        {/* SETTINGS DROPDOWN */}
        <div className="relative">
          <button 
            onClick={() => { setIsSettingsOpen(!isSettingsOpen); setIsProfileOpen(false); }}
            className={`p-2.5 rounded-xl transition-all ${isSettingsOpen ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            <FiSettings size={18} />
          </button>

          {isSettingsOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-[9999] animate-in fade-in zoom-in duration-200">
              <p className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Quick Settings</p>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isDarkMode ? <FiSun className="text-amber-500" /> : <FiMoon className="text-indigo-600" />}
                  <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                  <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${isDarkMode ? 'right-1' : 'left-1'}`}></div>
                </div>
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-colors">
                <FiBell /> <span>Notifications</span>
              </button>
            </div>
          )}
        </div>

        <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>

        {/* PROFILE DROPDOWN */}
        <div className="relative">
          <button 
            onClick={() => { setIsProfileOpen(!isProfileOpen); setIsSettingsOpen(false); }}
            className="flex items-center gap-3 p-1.5 pr-3 hover:bg-slate-100 rounded-2xl transition-all group"
          >
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <span className="text-xs font-black">{user.fullName?.charAt(0)}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-[12px] font-black text-slate-800 leading-tight">{user.fullName}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase">{user.role}</p>
            </div>
            <FiChevronDown className={`text-slate-300 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-60 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-[9999] animate-in fade-in zoom-in duration-200">
              <div className="px-3 py-3 border-b border-slate-50 mb-1">
                 <p className="text-[11px] font-black text-slate-800">{user.fullName}</p>
                 <p className="text-[10px] text-slate-400 font-medium">System Access: Full</p>
              </div>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-colors">
                <FiUser className="text-indigo-600" /> Manage Profile
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-colors">
                <FiShield className="text-emerald-600" /> Security Keys
              </button>
              <div className="h-[1px] bg-slate-100 my-1 mx-2"></div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 rounded-xl text-xs font-bold text-red-600 transition-colors"
              >
                <FiLogOut /> Sign Out
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Click Outside to Close */}
      {(isProfileOpen || isSettingsOpen) && (
        <div 
          className="fixed inset-0 z-[9998]" 
          onClick={() => { setIsProfileOpen(false); setIsSettingsOpen(false); }}
        ></div>
      )}
    </div>
  );
};

export default Navbar;