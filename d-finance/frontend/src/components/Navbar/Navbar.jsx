import React from 'react';
import { FiSearch, FiBell, FiUser } from 'react-icons/fi';

const Navbar = () => {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="relative w-96">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search Member ID, Loan No..." 
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center space-x-4">
        <FiBell className="text-gray-500 cursor-pointer hover:text-blue-600" size={20} />
        <div className="flex items-center space-x-3 border-l pl-4 border-gray-200">
          <div className="text-right">
            <p className="text-xs font-bold text-gray-800">Admin User</p>
            <p className="text-[10px] text-gray-500 uppercase">Super Admin</p>
          </div>
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <FiUser size={20} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;