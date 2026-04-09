import React, { useState } from 'react';
import API from '../../api/axios';

// 🚀 STEP 1: Image ko yahan import karo (src ke andar hai isliye)
import paymentQR from '../../image/Payment.jpeg'; 

const PaymentModal = ({ loan, onClose, onRefresh }) => {
  const [utr, setUtr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitPayment = async () => {
    if (!utr || utr.length < 10) return alert("Please enter a valid Transaction ID (UTR)");
    
    try {
      setLoading(true);
      const res = await API.post(`/loans/pay-manual/${loan.loanId}`, { 
        utr, 
        amount: loan.weeklyEMI || loan.emiAmount 
      });
      
      if (res.data.success) {
        alert("✅ Payment submitted! Admin will verify soon.");
        onRefresh();
        onClose();
      }
    } catch (err) {
      alert("Submission Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-fadeIn">
        
        <div className="p-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-black text-slate-800 uppercase tracking-tighter text-xs">Scan & Pay</h3>
          <button onClick={onClose} className="text-slate-400 font-bold hover:text-red-500">✕</button>
        </div>

        <div className="p-6 text-center">
          <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Pay Weekly EMI</p>
          <h2 className="text-3xl font-black text-slate-900 mb-6">₹{(loan.weeklyEMI || loan.emiAmount)?.toLocaleString()}</h2>

          {/* --- STEP 2: Imported Variable use karo --- */}
          <div className="bg-white p-4 rounded-[2rem] border-2 border-dashed border-slate-200 inline-block mb-6">
            <img 
              src={paymentQR} // ✅ Ab ye 100% dikhega
              alt="Payment QR" 
              className="w-48 h-48 md:w-56 md:h-56 object-contain rounded-xl"
              onError={(e) => console.error("Image still not loading. Check path!")}
            />
          </div>

          <div className="text-left space-y-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">UTR Number</label>
              <input 
                type="text" 
                placeholder="12 Digit Transaction ID"
                className="w-full bg-transparent border-none p-0 font-black text-slate-800 focus:ring-0 text-lg"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
              />
            </div>

            <button 
              onClick={handleSubmitPayment}
              disabled={loading}
              className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-[10px] active:scale-95 transition-all"
            >
              {loading ? "Processing..." : "Confirm Payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;