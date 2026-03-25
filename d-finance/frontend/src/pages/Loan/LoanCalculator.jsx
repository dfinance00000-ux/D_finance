import React, { useState } from 'react';

const LoanCalculator = () => {
  const [p, setP] = useState(100000); // Principal
  const [r, setR] = useState(12);     // Rate
  const [t, setT] = useState(12);     // Months
  const [emi, setEmi] = useState(0);

  const calculate = () => {
    const monthlyRate = r / 12 / 100;
    const emiCalc = (p * monthlyRate * Math.pow(1 + monthlyRate, t)) / (Math.pow(1 + monthlyRate, t) - 1);
    setEmi(emiCalc.toFixed(2));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-lg mb-6 text-blue-900 uppercase">Quick Loan Calculator</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Loan Amount (Principal)</label>
            <input type="number" value={p} onChange={(e)=>setP(e.target.value)} className="w-full border p-2 rounded focus:ring-2 ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm mb-1">Annual Interest Rate (%)</label>
            <input type="number" value={r} onChange={(e)=>setR(e.target.value)} className="w-full border p-2 rounded focus:ring-2 ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm mb-1">Tenure (Months)</label>
            <input type="number" value={t} onChange={(e)=>setT(e.target.value)} className="w-full border p-2 rounded focus:ring-2 ring-blue-500 outline-none" />
          </div>
          <button onClick={calculate} className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700">Calculate EMI</button>
        </div>
      </div>

      <div className="bg-blue-900 text-white p-8 rounded-xl shadow-lg flex flex-col justify-center items-center">
        <p className="text-blue-200 uppercase tracking-widest text-sm mb-2">Estimated Monthly EMI</p>
        <h2 className="text-5xl font-extrabold">₹{emi}</h2>
        <div className="mt-8 w-full border-t border-blue-800 pt-6 grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-xs text-blue-300">Total Interest</p>
            <p className="font-bold text-lg">₹{(emi * t - p).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-blue-300">Total Repayment</p>
            <p className="font-bold text-lg">₹{(emi * t).toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculator;