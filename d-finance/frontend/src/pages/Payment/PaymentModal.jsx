import React, { useState } from 'react';
import API from '../../api/axios';

const PaymentModal = ({ loan, customAmount, onClose, onRefresh }) => {
  const [utr, setUtr] = useState('');
  const [loading, setLoading] = useState(false);

  // User details for backend tracking
  const user = JSON.parse(localStorage.getItem('user')) || {};

  // Logic: Dashboard se aaya hua amount priority hai
  const finalAmount = Number(customAmount) || Number(loan?.dailyEMI) || 0;

  const handleSubmitPayment = async () => {
    // 1. Client-side Validations
    const cleanUtr = utr.trim();
    if (!cleanUtr || cleanUtr.length < 10) {
      return alert("⚠️ Please enter a valid 12-digit UTR Number.");
    }

    if (finalAmount < 200) {
      return alert("⚠️ Minimum payment must be ₹200.");
    }
    
    try {
      setLoading(true);
      
      // 🔥 Payload: Ensuring all fields required by the new backend logic are sent
      const payload = { 
        utr: cleanUtr, 
        amount: finalAmount,
        customerId: user.id || user._id, // Mapping for both possible ID formats
        paymentDate: new Date().toISOString()
      };

      const res = await API.post(`/loans/pay-manual/${loan.loanId}`, payload);
      
      if (res.data.success || res.status === 200) {
        alert(`✅ Payment Logged!\nAmount: ₹${finalAmount}\nUTR: ${cleanUtr}\n\nAdmin will verify this shortly.`);
        onRefresh(); // Refreshing parent component (Dashboard)
        onClose();   // Closing modal
      }
    } catch (err) {
      console.error("Submission Error Details:", err.response?.data);
      
      // 🔥 Specific Error Handling for Duplicate UTR or Database Index Issues
      const serverError = err.response?.data?.error || "";
      let userFriendlyError = "Server Error: Could not log payment.";

      if (serverError.includes("E11000") || serverError.includes("duplicate")) {
        userFriendlyError = "❌ This UTR has already been used. Please enter a new Transaction ID.";
      } else if (serverError) {
        userFriendlyError = "❌ " + serverError;
      }

      alert(userFriendlyError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-300">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
            <p className="font-black text-slate-800 uppercase text-[10px] tracking-widest">Secure UPI Payment</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center bg-white text-slate-400 rounded-full shadow-sm hover:text-red-500 hover:shadow-md transition-all"
          >✕</button>
        </div>

        <div className="p-8 text-center">
          <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Payable Amount</p>
          <div className="flex items-center justify-center gap-1 mb-6">
            <span className="text-xl font-black text-slate-300 mt-1">₹</span>
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter">
              {finalAmount.toLocaleString('en-IN')}
            </h2>
          </div>

          {/* QR Container */}
          <div className="relative inline-block mb-8 group">
            <div className="absolute -inset-2 bg-indigo-500/10 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative bg-white p-4 rounded-[2rem] border-2 border-dashed border-slate-200">
              <img 
                src="/Payment.jpeg" 
                alt="QR Code" 
                className="w-40 h-40 object-contain rounded-xl mx-auto"
                onError={(e) => { e.target.src = "https://placehold.co/400?text=QR+NOT+FOUND"; }}
              />
            </div>
          </div>

          <div className="text-left space-y-4">
            {/* Input Field */}
            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1 tracking-widest">Transaction UTR Number</label>
              <input 
                type="text" 
                placeholder="Ex: 4123887700..."
                className="w-full bg-transparent border-none p-0 font-black text-slate-800 focus:ring-0 text-lg placeholder:text-slate-300"
                value={utr}
                onChange={(e) => setUtr(e.target.value.toUpperCase())}
              />
            </div>

            {/* Submit Button */}
            <button 
              onClick={handleSubmitPayment}
              disabled={loading || utr.length < 10}
              className={`w-full py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-lg
                ${loading || utr.length < 10 
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1 active:scale-95 shadow-indigo-200'
                }`}
            >
              {loading ? "Verifying Transaction..." : "Submit Receipt"}
            </button>
            
            <p className="text-[9px] text-slate-400 text-center leading-relaxed font-medium">
              Take a screenshot after payment. <br/>
              Verification usually takes <span className="text-slate-800 font-bold">10-30 minutes</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;