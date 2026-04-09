import React, { useState, useEffect, useCallback } from 'react';
import { FiDollarSign, FiPercent, FiCalendar, FiArrowRight } from 'react-icons/fi';

const LoanCalculator = () => {
  const [p, setP] = useState(100000); // Principal
  const [r, setR] = useState(12);     // Rate
  const [t, setT] = useState(12);     // Months
  const [emi, setEmi] = useState(0);

  // --- Real-time Calculation ---
  const calculateEMI = useCallback(() => {
    const monthlyRate = r / 12 / 100;
    if (p > 0 && r > 0 && t > 0) {
      const emiCalc = (p * monthlyRate * Math.pow(1 + monthlyRate, t)) / (Math.pow(1 + monthlyRate, t) - 1);
      setEmi(emiCalc.toFixed(0));
    } else {
      setEmi(0);
    }
  }, [p, r, t]);

  useEffect(() => {
    calculateEMI();
  }, [calculateEMI]);

  const totalRepayment = emi * t;
  const totalInterest = totalRepayment - p;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-2">
      {/* --- Input Section --- */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <h3 className="font-black text-xl mb-8 text-slate-800 uppercase tracking-tighter flex items-center gap-2">
          <FiDollarSign className="text-blue-600" /> Loan Estimator
        </h3>
        
        <div className="space-y-8">
          {/* Principal Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Loan Amount (₹)</label>
              <span className="font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">₹{Number(p).toLocaleString()}</span>
            </div>
            <input type="range" min="10000" max="1000000" step="10000" value={p} onChange={(e)=>setP(e.target.value)} 
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
          </div>

          {/* Rate Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Interest Rate (% P.A.)</label>
              <span className="font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">{r}%</span>
            </div>
            <input type="range" min="1" max="36" step="0.5" value={r} onChange={(e)=>setR(e.target.value)} 
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
          </div>

          {/* Tenure Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tenure (Months)</label>
              <span className="font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-lg">{t} Mo</span>
            </div>
            <input type="range" min="3" max="60" step="1" value={t} onChange={(e)=>setT(e.target.value)} 
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500" />
          </div>
        </div>

        <div className="mt-10 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                * This is a tentative estimate. Processing fees and other charges may apply at the time of disbursement.
            </p>
        </div>
      </div>

      {/* --- Output Section --- */}
      <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl shadow-blue-900/20 flex flex-col justify-between relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-blue-600/10 rounded-full blur-3xl"></div>
        
        <div>
            <p className="text-blue-400 font-black uppercase tracking-[0.3em] text-[10px] mb-4">Monthly Installment</p>
            <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black tracking-tighter italic">₹{Number(emi).toLocaleString()}</span>
                <span className="text-blue-400 font-bold">/month</span>
            </div>
        </div>

        <div className="mt-12 space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Principal Amount</span>
                </div>
                <span className="font-black">₹{Number(p).toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Interest</span>
                </div>
                <span className="font-black text-emerald-400">₹{totalInterest > 0 ? Number(totalInterest.toFixed(0)).toLocaleString() : 0}</span>
            </div>

            <div className="pt-4 flex justify-between items-center">
                <span className="text-sm font-black uppercase tracking-widest text-blue-200">Total Repayable</span>
                <span className="text-2xl font-black text-white">₹{totalRepayment > 0 ? Number(totalRepayment.toFixed(0)).toLocaleString() : 0}</span>
            </div>
        </div>

        <button className="mt-10 w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
            Apply Now <FiArrowRight />
        </button>
      </div>
    </div>
  );
};

export default LoanCalculator;