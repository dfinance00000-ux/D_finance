import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import Navbar from '../components/Navbar/Navbar';
import { FiCommand, FiShield, FiActivity, FiGlobe } from 'react-icons/fi';

const AdminLayout = () => {
  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden font-sans antialiased text-slate-900">
      
      {/* 1. Sidebar: Bold & Professional */}
      <aside className="hidden md:flex md:w-72 md:flex-shrink-0 z-30 bg-slate-900 shadow-[20px_0_40px_rgba(0,0,0,0.08)]">
        <Sidebar />
      </aside>

      {/* 2. Content Area Wrapper */}
      <div className="flex flex-col flex-1 min-w-0 h-full relative">
        
        {/* Navbar: Frosted Glass Effect */}
        <header className="h-16 flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-200/60 z-20 sticky top-0 flex items-center px-4">
          <Navbar />
        </header>

        {/* 3. Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] p-6 md:p-10 scroll-smooth">
          
          <div className="max-w-7xl mx-auto">
            
            {/* Header: Command Center Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
                  <FiCommand className="text-white text-2xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                    System Control
                  </h1>
                  <p className="text-sm text-slate-500 font-semibold mt-1">
                    Master Console <span className="mx-2 text-slate-300">|</span> <FiGlobe className="inline mr-1" /> Mathura Hub
                  </p>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="flex items-center gap-3">
                 <div className="flex flex-col items-end mr-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Status</span>
                    <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                       <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Encrypted & Online
                    </span>
                 </div>
                 <div className="h-12 w-[1px] bg-slate-200 mx-2 hidden md:block"></div>
                 <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
                    <FiShield className="text-indigo-600" />
                    <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">Super Admin</span>
                 </div>
              </div>
            </div>

            {/* Dynamic Page Content Injection */}
            <div className="transition-all duration-500 ease-in-out">
              <Outlet />
            </div>
          </div>
        </main>

        {/* 4. Mini Footer: The "Tech-Ready" Look */}
        <footer className="h-12 bg-white border-t border-slate-100 px-8 flex items-center justify-between text-[10px] md:text-[11px] font-bold text-slate-400">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <span className="text-slate-900 uppercase tracking-widest">D-Finance Enterprise v3.0</span>
            </div>
            <span className="hidden md:inline px-3 py-1 bg-slate-100 rounded-md text-slate-500">
               SECURITY COMPLIANT: ISO-27001
            </span>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md">
               <FiActivity /> <span>LATENCY: 24ms</span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="hover:text-indigo-600 cursor-help transition-colors">HELP CENTER</span>
          </div>
        </footer>
      </div>

      {/* Tailwind Specific Animations Setup */}
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default AdminLayout;