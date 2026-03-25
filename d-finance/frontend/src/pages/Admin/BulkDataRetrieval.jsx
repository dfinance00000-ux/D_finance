import React, { useState, useEffect } from 'react';

const BulkDataRetrieval = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/loans')
      .then(res => res.json())
      .then(data => {
        setLoans(data);
        setLoading(false);
      });
  }, []);

  const downloadCSV = () => {
    const headers = ["LoanID", "Customer", "Amount", "Status", "HouseType", "Occupation", "Advisor"];
    const rows = loans.map(l => [
      l.id, l.customerName, l.amount, l.status, 
      l.houseType || 'N/A', l.occupationSubCategory || 'N/A', l.verifiedByName || 'N/A'
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LUC_Bulk_Report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">📥 Bulk Data Retrieval</h2>
          <p className="text-sm text-slate-500">SOP Point 3: Federal Bank Audit & LUC Reporting Section</p>
        </div>
        <button 
          onClick={downloadCSV}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-bold transition shadow-lg shadow-emerald-200"
        >
          Download All LUC Reports (.CSV)
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Loan ID</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Customer</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Field Data</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Verified By</th>
            </tr>
          </thead>
          <tbody>
            {loans.map(loan => (
              <tr key={loan.id} className="border-b border-gray-50 hover:bg-slate-50 transition">
                <td className="p-4 text-sm font-medium">{loan.id}</td>
                <td className="p-4">
                  <div className="text-sm font-bold text-slate-700">{loan.customerName}</div>
                  <div className="text-xs text-slate-400">₹{loan.amount}</div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    loan.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {loan.status}
                  </span>
                </td>
                <td className="p-4 text-xs text-slate-600">
                  {loan.houseType ? `${loan.houseType} | ${loan.occupationSubCategory}` : 'Visit Pending'}
                </td>
                <td className="p-4 text-xs font-bold text-slate-500">{loan.verifiedByName || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BulkDataRetrieval;