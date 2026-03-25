import React from 'react';

const UserDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border-b-4 border-emerald-500">
          <h4 className="text-gray-500 text-sm font-bold">MY TOTAL SALES</h4>
          <p className="text-3xl font-black mt-2">₹4,50,000</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-b-4 border-blue-500">
          <h4 className="text-gray-500 text-sm font-bold">PENDING COMMISSION</h4>
          <p className="text-3xl font-black mt-2">₹12,400</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-b-4 border-orange-500">
          <h4 className="text-gray-500 text-sm font-bold">TEAM SIZE</h4>
          <p className="text-3xl font-black mt-2">12 Members</p>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="font-bold mb-4">My Recent Submissions</h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="p-3">24 Feb 2026</td>
              <td className="p-3">Amit Singh</td>
              <td className="p-3">₹50,000</td>
              <td className="p-3 text-orange-500 font-bold">Pending Approval</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserDashboard;