import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import Navbar from '../components/Navbar/Navbar';

const AdminLayout = () => {
  return (
    <div className="flex h-screen w-full bg-[#f1f5f9] overflow-hidden font-sans">
      
      {/* 1. Sidebar: Persistent on Desktop with Emerald/Slate theme */}
      <aside className="hidden md:flex md:w-72 md:flex-shrink-0 z-30 shadow-[4px_0_24px_rgba(0,0,0,0.05)] bg-slate-900">
        <Sidebar />
      </aside>

      {/* 2. Content Area Wrapper */}
      <div className="flex flex-col flex-1 min-w-0 h-full relative overflow-hidden">
        
        {/* Navbar: High-contrast white header */}
        <header className="h-16 flex-shrink-0 bg-white border-b border-slate-200 z-20 shadow-sm flex items-center">
          <Navbar />
        </header>

        {/* 3. Dynamic Page Content (Outlet) */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-4 md:p-10 scroll-smooth">
          {/* Main Container with max-width for readability on large screens */}
          <div className="max-w-7xl mx-auto">
            {/* Admin Header Context (Optional but looks professional) */}
            <div className="mb-8 flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">System Control Panel</h1>
                <p className="text-sm text-slate-500 font-medium">Manage master data and investor insights.</p>
              </div>
              <div className="text-[10px] bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold border border-emerald-200 uppercase tracking-wider">
                Role: Super Admin
              </div>
            </div>

            {/* Content Injection */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Outlet />
            </div>
          </div>
        </main>

        {/* 4. Mini Footer: Compliance Branding */}
        <footer className="h-10 bg-white border-t border-slate-200 px-10 flex items-center justify-between text-[11px] font-semibold text-slate-400">
          <div className="flex items-center gap-4">
            <span className="text-emerald-600">D-FINANCE Enterprise</span>
            <span className="h-3 w-[1px] bg-slate-200"></span>
            <span>SOP 1.3.11 Compliant</span>
          </div>
          <div className="flex gap-4">
            <span>Uptime: 99.9%</span>
            <span>Rel: 3.0.1</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;