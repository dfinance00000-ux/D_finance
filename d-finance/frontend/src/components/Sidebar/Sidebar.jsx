import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiBriefcase, FiUsers, FiDollarSign, FiFileText } from 'react-icons/fi';

const Sidebar = () => {
  const location = useLocation();

  // Menu items mein ye paths check karein:
const menuItems = [
  { title: 'Dashboard', path: '/admin' },
  { title: 'Branch Master', path: '/admin/master/branch' },
  { title: 'Customer Entry', path: '/admin/customer/entry' },
  { title: 'Advisor Module', path: '/admin/advisor' }, // Path match check karein
  { title: 'Collection Module', path: '/admin/collection' }, // Path match check karein
  { title: 'Loan Module', path: '/admin/loan' },
];
  return (
    <div className="w-64 h-full bg-slate-900 text-white flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-emerald-400 tracking-wider">D-FINANCE</h1>
        <p className="text-[10px] text-slate-400 mt-1">V3.0 Production</p>
      </div>
      
      <nav className="flex-1 mt-4 px-3 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-3 rounded-lg transition-all ${
              location.pathname === item.path 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            <span className="text-sm font-medium">{item.title}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;