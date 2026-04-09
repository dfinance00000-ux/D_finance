import React, { useState } from 'react';
import API from '../../api/axios';

const PaymentModal = ({ loan, onClose, onRefresh }) => {
  const [utr, setUtr] = useState('');
  const [loading, setLoading] = useState(false);

  // 🚀 APNA QR CODE LINK YAHAN DALO
  // Aap apna QR image "public" folder mein rakh kar uska path yahan de sakte ho
  const myQrCode = "/image/Payment.jpeg"; 

  const handleSubmitPayment = async () => {
    if (!utr) return alert("Please enter Transaction ID (UTR)");
    
    try {
      setLoading(true);
      const res = await API.post(`/loans/pay-manual/${loan.loanId}`, { 
        utr, 
        amount: loan.weeklyEMI 
      });
      
      if (res.data.success) {
        alert("✅ Payment submitted for verification!");
        onRefresh();
        onClose();
      }
    } catch (err) {
      alert("Error submitting payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-fadeIn">
        
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-black text-slate-800 uppercase tracking-tighter">EMI Payment</h3>
          <button onClick={onClose} className="text-slate-400 font-bold text-xl">✕</button>
        </div>

        <div className="p-6 text-center">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Scan & Pay EMI Amount</p>
          <h2 className="text-3xl font-black text-slate-900 mb-6">₹{loan.weeklyEMI}</h2>

          {/* --- QR CODE IMAGE --- */}
          <div className="bg-slate-50 p-4 rounded-3xl border-2 border-dashed border-slate-200 inline-block mb-6">
            <img 
              src={myQrCode} 
              alt="Payment QR" 
              className="w-48 h-48 md:w-56 md:h-56 object-contain"
            />
          </div>

          <div className="text-left space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Transaction ID / UTR</label>
              <input 
                type="text" 
                placeholder="Enter 12 digit UTR Number"
                className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 font-bold focus:ring-2 focus:ring-emerald-500 transition-all"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
              />
            </div>

            <button 
              onClick={handleSubmitPayment}
              disabled={loading}
              className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-[11px] shadow-lg shadow-slate-900/20 active:scale-95 transition-all"
            >
              {loading ? "Verifying..." : "Confirm Payment"}
            </button>
          </div>

          <p className="mt-4 text-[9px] text-slate-400 font-bold uppercase italic">
            * Payment will reflect after admin verification
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;