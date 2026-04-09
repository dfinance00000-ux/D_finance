import React, { useState, useEffect, useCallback } from 'react';
import { FiDollarSign, FiPercent, FiCalendar, FiArrowRight, FiInfo } from 'react-icons/fi';

const LoanCalculator = () => {
  const [p, setP] = useState(10000); // Principal (Min 10,000)
  const [r, setR] = useState(10);    // Monthly Interest Rate (Fixed 10%)
  const [t, setT] = useState(12);    // Months
  const [emi, setEmi] = useState(0);

  // --- Configuration ---
  const PROCESSING_FEE_PERCENT = 2; 

  // --- Real-time Calculation ---
  const calculateEMI = useCallback(() => {
    // Formula: [P x R x (1+R)^N]/[(1+R)^N-1]
    // Yahan R monthly rate hai (10% = 0.10)
    const monthlyRate = r / 100; 
    
    if (p >= 10000 && r > 0 && t > 0) {
      const emiCalc = (p * monthlyRate * Math.pow(1 + monthlyRate, t)) / (Math.pow(1 + monthlyRate, t) - 1);
      setEmi(emiCalc.toFixed(0));
    } else {
      setEmi(0);
    }
  }, [p, r, t]);

  useEffect(() => {
    calculateEMI();
  }, [calculateEMI]);

  const processingFee = (p * PROCESSING_FEE_PERCENT) / 100;
  const netDisbursed = p - processingFee;
  const totalRepayment = emi * t;
  const totalInterest = totalRepayment - p;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-2">
      {/* --- Input Section --- */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <h3 className="font-black text-xl mb-8 text-slate-800 uppercase tracking-tighter flex items-center gap-2">
          <FiDollarSign className="text-indigo-600" /> Loan Estimator
        </h3>
        
        <div className="space-y-8">
          {/* Principal Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Loan Amount (Min ₹10k)</label>
              <span className="font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">₹{Number(p).toLocaleString()}</span>
            </div>
            <input type="range" min="10000" max="500000" step="5000" value={p} onChange={(e)=>setP(Number(e.target.value))} 
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
          </div>

          {/* Rate Display (Fixed 10%) */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Monthly Interest Rate</label>
              <span className="font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">{r}% Per Month</span>
            </div>
            <div className="h-2 bg-emerald-100 rounded-full w-full relative">
                <div className="absolute h-full bg-emerald-500 rounded-full w-[100%]"></div>
            </div>
          </div>

          {/* Tenure Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tenure (Duration)</label>
              <span className="font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-lg">{t} Months</span>
            </div>
            <input type="range" min="1" max="36" step="1" value={t} onChange={(e)=>setT(Number(e.target.value))} 
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500" />
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="mt-10 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
            <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <FiInfo /> Payout Breakdown
            </h4>
            <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Requested Loan:</span>
                    <span className="text-slate-700">₹{Number(p).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-red-500">
                    <span>Processing Fee (2%):</span>
                    <span>- ₹{Number(processingFee).toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-indigo-200 flex justify-between text-sm font-black text-indigo-700">
                    <span>In-Hand Amount:</span>
                    <span>₹{Number(netDisbursed).toLocaleString()}</span>
                </div>
            </div>
        </div>
      </div>

      {/* --- Output Section --- */}
      <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-900/20 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl"></div>
        
        <div>
            <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] mb-4">Estimated EMI</p>
            <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black tracking-tighter italic">₹{Number(emi).toLocaleString()}</span>
                <span className="text-indigo-400 font-bold">/month</span>
            </div>
        </div>

        <div className="mt-12 space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Principal Amount</span>
                </div>
                <span className="font-black">₹{Number(p).toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Interest (Total)</span>
                </div>
                <span className="font-black text-emerald-400">₹{totalInterest > 0 ? Number(totalInterest.toFixed(0)).toLocaleString() : 0}</span>
            </div>

            <div className="pt-4 flex justify-between items-center">
                <span className="text-sm font-black uppercase tracking-widest text-indigo-200">Total Payable</span>
                <span className="text-2xl font-black text-white">₹{totalRepayment > 0 ? Number(totalRepayment.toFixed(0)).toLocaleString() : 0}</span>
            </div>
        </div>

        <button className="mt-10 w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-900/40">
            Request Disbursement <FiArrowRight />
        </button>
      </div>
    </div>
  );
};

export default LoanCalculator;