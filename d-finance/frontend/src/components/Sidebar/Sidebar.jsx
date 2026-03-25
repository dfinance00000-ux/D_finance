import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiCheckCircle, 
  FiPieChart, 
  FiUsers, 
  FiDollarSign, 
  FiLayers, 
  FiLogOut,
  FiMapPin
} from 'react-icons/fi';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Naye Pages ke paths yahan add kiye hain:
  const menuItems = [
    { title: 'Business Stats', path: '/admin/analytics', icon: <FiPieChart /> },
    { title: 'Pending Approvals', path: '/admin/approvals', icon: <FiCheckCircle /> },
    { title: 'Advisor Payouts', path: '/admin/advisor-performance', icon: <FiDollarSign /> },
    { title: 'Loan Master', path: '/admin/loan', icon: <FiLayers /> },
    { title: 'Branch Master', path: '/admin/master/branch', icon: <FiMapPin /> },
    { title: 'Customer Entry', path: '/admin/customer/entry', icon: <FiUsers /> },
    { title: 'Advisor Entry', path: '/admin/advisor', icon: <FiBriefcase /> },
    { title: 'Collection Module', path: '/admin/collection', icon: <FiFileText /> },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="w-64 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-emerald-400 tracking-wider">D-FINANCE</h1>
        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">Mathura Branch | V3.0 Live</p>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 mt-4 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
              location.pathname === item.path 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 translate-x-1' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            <span className="text-sm font-semibold">{item.title}</span>
          </Link>
        ))}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-bold text-sm"
        >
          <FiLogOut className="mr-3 text-lg" />
          LOGOUT
        </button>
      </div>
    </div>
  );
};

export default Sidebar;