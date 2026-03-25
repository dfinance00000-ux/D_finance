import React, { useState } from 'react';
import API from '../../api/axios';
import { FiSearch, FiX, FiUser, FiFileText } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const GlobalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ customers: [], loans: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    const val = e.target.value;
    setQuery(val);

    if (val.length < 3) {
      setResults({ customers: [], loans: [] });
      return;
    }

    setLoading(true);
    try {
      // Backend par ek search endpoint call karenge
      const res = await API.get(`/admin/search?q=${val}`);
      setResults(res.data);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={searchCard} onClick={(e) => e.stopPropagation()}>
        <div style={inputWrapper}>
          <FiSearch style={{ color: '#94a3b8' }} size={20} />
          <input 
            autoFocus
            placeholder="Search Name, Mobile or Loan ID (e.g. DF-101)..." 
            style={searchInput}
            value={query}
            onChange={handleSearch}
          />
          <FiX style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={onClose} />
        </div>

        <div style={resultArea}>
          {loading && <p style={statusText}>Searching Atlas Database...</p>}
          
          {/* Loans Results */}
          {results.loans.length > 0 && (
            <div style={section}>
              <h4 style={sectionTitle}>LOAN RECORDS</h4>
              {results.loans.map(loan => (
                <div key={loan._id} style={resultRow} onClick={() => { navigate(`/admin/approvals`); onClose(); }}>
                  <FiFileText />
                  <div style={{ marginLeft: '12px' }}>
                    <p style={mainText}>{loan.customerName} - {loan.loanId}</p>
                    <p style={subText}>Status: {loan.status} | Amount: ₹{loan.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Customer Results */}
          {results.customers.length > 0 && (
            <div style={section}>
              <h4 style={sectionTitle}>CUSTOMERS</h4>
              {results.customers.map(cust => (
                <div key={cust._id} style={resultRow}>
                  <FiUser />
                  <div style={{ marginLeft: '12px' }}>
                    <p style={mainText}>{cust.fullName}</p>
                    <p style={subText}>Mobile: {cust.mobile} | KYC: {cust.adhaar ? 'Verified' : 'Pending'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {query.length > 2 && results.loans.length === 0 && results.customers.length === 0 && !loading && (
            <p style={statusText}>No records found in Mathura Branch.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Styles ---
const overlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', paddingTop: '100px' };
const searchCard = { width: '100%', maxWidth: '600px', background: '#fff', borderRadius: '20px', overflow: 'hidden', height: 'fit-content', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' };
const inputWrapper = { display: 'flex', alignItems: 'center', padding: '20px', borderBottom: '1px solid #f1f5f9' };
const searchInput = { flex: 1, border: 'none', outline: 'none', fontSize: '16px', marginLeft: '15px', fontWeight: '600' };
const resultArea = { maxHeight: '400px', overflowY: 'auto', padding: '10px' };
const section = { marginBottom: '15px' };
const sectionTitle = { fontSize: '10px', fontWeight: '900', color: '#94a3b8', padding: '10px 15px', textTransform: 'uppercase' };
const resultRow = { display: 'flex', alignItems: 'center', padding: '12px 15px', cursor: 'pointer', borderRadius: '12px', transition: '0.2s', hover: { background: '#f8fafc' } };
const mainText = { margin: 0, fontSize: '14px', fontWeight: '700', color: '#1e293b' };
const subText = { margin: 0, fontSize: '12px', color: '#64748b' };
const statusText = { textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '13px' };

export default GlobalSearch;