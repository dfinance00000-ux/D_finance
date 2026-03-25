import React from 'react';

const CashBook = () => {
  const transactions = [
    { id: 1, date: '2026-02-25', desc: 'EMI Collection - L101', type: 'IN', amount: 2550 },
    { id: 2, date: '2026-02-25', desc: 'Office Tea Expense', type: 'OUT', amount: 120 },
    { id: 3, date: '2026-02-25', desc: 'New Loan Disbursal - L105', type: 'OUT', amount: 50000 },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>📖 Daily Cash Book</h2>
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f1f5f9' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left' }}>Date</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Description</th>
              <th style={{ padding: '15px', textAlign: 'right' }}>Cash IN</th>
              <th style={{ padding: '15px', textAlign: 'right' }}>Cash OUT</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '15px' }}>{t.date}</td>
                <td style={{ padding: '15px' }}>{t.desc}</td>
                <td style={{ padding: '15px', textAlign: 'right', color: 'green', fontWeight: 'bold' }}>{t.type === 'IN' ? `₹${t.amount}` : '-'}</td>
                <td style={{ padding: '15px', textAlign: 'right', color: 'red', fontWeight: 'bold' }}>{t.type === 'OUT' ? `₹${t.amount}` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CashBook;