import React, { useState, useEffect } from 'react';
import API from '../../api/axios'; // Apna axios path sahi kar lena
import { FiSearch, FiUser, FiCalendar, FiDollarSign, FiCreditCard, FiPrinter, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const CollectionEntry = () => {
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [loanDetails, setLoanDetails] = useState(null);
  const [paymentData, setPaymentData] = useState({
    lateFine: 0,
    mode: 'UPI/Online',
    remarks: ''
  });

  // 1. Search Functionality (Live Data)
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchId) return alert("Bhai, Loan ID toh daalo!");

    try {
      setLoading(true);
      // Backend route: /admin/loan-details/:id
      const res = await API.get(`/admin/all-loans`); 
      const foundLoan = res.data.find(l => 
        l.loanId.toLowerCase() === searchId.toLowerCase() || 
        l.mobile === searchId
      );

      if (foundLoan) {
        setLoanDetails(foundLoan);
        console.log("Loan Found:", foundLoan);
      } else {
        alert("Record Not Found! Sahi ID daalo.");
        setLoanDetails(null);
      }
    } catch (err) {
      console.error("Search Error:", err);
      alert("Database error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit Collection Logic
  const handleCollect = async () => {
    if (!window.confirm(`Collect ₹${Number(loanDetails.weeklyEMI) + Number(paymentData.lateFine)} from ${loanDetails.customerName}?`)) return;

    try {
      setLoading(true);
      const res = await API.post(`/accountant/collect-emi`, {
        loanId: loanDetails.loanId,
        amount: Number(loanDetails.weeklyEMI) + Number(paymentData.lateFine),
        lateFine: paymentData.lateFine,
        mode: paymentData.mode
      });

      if (res.data.success) {
        alert("✅ Payment Successful! Receipt Generated.");
        setLoanDetails(null);
        setSearchId('');
      }
    } catch (err) {
      alert("❌ Payment Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      {/* --- HEADER --- */}
      <div style={headerStyle}>
        <h2 style={{ margin: 0, fontWeight: 900, fontSize: '26px', color: '#0f172a' }}>💸 EMI RECOVERY POINT</h2>
        <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px', fontWeight: 'bold' }}>Process EMI Collection & Digital Receipts</p>
      </div>

      {/* --- SEARCH BOX --- */}
      <form onSubmit={handleSearch} style={searchCard}>
        <div style={{ position: 'relative', flex: 1 }}>
          <FiSearch style={searchIcon} />
          <input 
            type="text" 
            placeholder="Search by Loan ID (e.g. LN-9458) or Mobile Number..." 
            style={searchInput}
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading} style={fetchBtn}>
          {loading ? 'Searching...' : 'Pull Records'}
        </button>
      </form>

      {/* --- DETAILS SECTION --- */}
      {loanDetails && (
        <div style={mainGrid} className="animate-in">
          {/* Left: Digital Passport (Summary) */}
          <div style={summaryCard}>
            <div style={cardHeader}>
              <div style={badge}>ACTIVE FILE</div>
              <FiUser size={20} color="#94a3b8" />
            </div>
            
            <h3 style={custName}>{loanDetails.customerName}</h3>
            <p style={loanIdText}>Ref: {loanDetails.loanId}</p>

            <div style={infoBox}>
              <div style={infoRow}><span>Principal</span><b>₹{loanDetails.amount}</b></div>
              <div style={infoRow}><span>Pending EMI</span><b>₹{loanDetails.weeklyEMI}</b></div>
              <div style={infoRow}><span>OS Balance</span><b style={{color: '#ef4444'}}>₹{loanDetails.totalPending}</b></div>
            </div>

            <div style={receiptVisual}>
               <p style={{fontSize: '10px', fontWeight: 900, color: '#94a3b8', textAlign: 'center', marginBottom: '10px'}}>PAYMENT PREVIEW</p>
               <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 900}}>
                  <span>Total Net:</span>
                  <span style={{color: '#10b981'}}>₹{Number(loanDetails.weeklyEMI) + Number(paymentData.lateFine)}</span>
               </div>
            </div>
          </div>

          {/* Right: Payment Form */}
          <div style={formCard}>
             <h4 style={formTitle}><FiDollarSign/> Transaction Details</h4>
             
             <div style={inputGroup}>
               <label style={labelStyle}>Apply Late Fine (₹)</label>
               <input 
                 type="number" 
                 style={formInput} 
                 value={paymentData.lateFine}
                 onChange={(e) => setPaymentData({...paymentData, lateFine: e.target.value})}
               />
             </div>

             <div style={inputGroup}>
               <label style={labelStyle}>Payment Method</label>
               <select 
                 style={formInput}
                 value={paymentData.mode}
                 onChange={(e) => setPaymentData({...paymentData, mode: e.target.value})}
               >
                 <option value="UPI/Online">UPI / Digital QR</option>
                 <option value="Cash">Direct Cash</option>
                 <option value="Bank Transfer">Bank Transfer (IMPS/NEFT)</option>
               </select>
             </div>

             <div style={inputGroup}>
               <label style={labelStyle}>Official Remarks</label>
               <input 
                 placeholder="e.g. Paid by brother"
                 style={formInput}
                 onChange={(e) => setPaymentData({...paymentData, remarks: e.target.value})}
               />
             </div>

             <button onClick={handleCollect} disabled={loading} style={confirmBtn}>
               <FiCheckCircle /> {loading ? 'Processing...' : 'Confirm & Generate Receipt'}
             </button>
             <button onClick={() => setLoanDetails(null)} style={cancelBtn}><FiXCircle/> Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- STYLES (Professional & Enterprise) ---
const containerStyle = { padding: '30px', background: '#f4f7fe', minHeight: '100vh', fontFamily: '"Inter", sans-serif' };
const headerStyle = { marginBottom: '30px' };

const searchCard = { background: '#fff', padding: '15px', borderRadius: '20px', display: 'flex', gap: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.02)', border: '1px solid #eee', marginBottom: '30px' };
const searchIcon = { position: 'absolute', left: '20px', top: '15px', color: '#cbd5e1' };
const searchInput = { width: '100%', padding: '15px 15px 15px 50px', borderRadius: '15px', border: '1.5px solid #f1f5f9', background: '#f8fafc', outline: 'none', fontWeight: 'bold' };
const fetchBtn = { background: '#0f172a', color: '#fff', border: 'none', borderRadius: '15px', padding: '0 30px', fontWeight: '900', cursor: 'pointer' };

const mainGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' };

const summaryCard = { background: '#fff', padding: '30px', borderRadius: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.03)', border: '1px solid #fff' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const badge = { background: '#f0fdf4', color: '#16a34a', padding: '5px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: '900' };
const custName = { margin: 0, fontSize: '24px', fontWeight: '900', color: '#0f172a' };
const loanIdText = { margin: '5px 0 25px 0', fontSize: '13px', color: '#94a3b8', fontWeight: 'bold' };

const infoBox = { background: '#f8fafc', padding: '20px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px' };
const infoRow = { display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#64748b' };
const receiptVisual = { marginTop: '30px', padding: '20px', border: '2px dashed #e2e8f0', borderRadius: '20px' };

const formCard = { background: '#fff', padding: '35px', borderRadius: '30px', border: '1px solid #eee' };
const formTitle = { margin: '0 0 25px 0', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: '900' };
const inputGroup = { marginBottom: '20px' };
const labelStyle = { display: 'block', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' };
const formInput = { width: '100%', padding: '14px', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#f8fafc', fontWeight: 'bold', boxSizing: 'border-box' };

const confirmBtn = { width: '100%', padding: '18px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '18px', fontWeight: '900', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' };
const cancelBtn = { width: '100%', marginTop: '15px', background: 'none', border: 'none', color: '#94a3b8', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' };

export default CollectionEntry;