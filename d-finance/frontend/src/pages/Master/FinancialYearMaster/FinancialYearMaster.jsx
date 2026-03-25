import React, { useState } from 'react';
import { Input, Button, Select } from '../../../components/Forms/FormElements';
import Table from '../../../components/Table/Table';

const FinancialYearMaster = () => {
  const columns = [
    { header: 'Year Name', accessor: 'yearName' },
    { header: 'Start Date', accessor: 'startDate' },
    { header: 'End Date', accessor: 'endDate' },
    { header: 'Current Year', accessor: 'isCurrent' },
  ];

  const data = [
    { yearName: '2023-24', startDate: '01-04-2023', endDate: '31-03-2024', isCurrent: 'No' },
    { yearName: '2024-25', startDate: '01-04-2024', endDate: '31-03-2025', isCurrent: 'Yes' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-6">Financial Year Setup</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input label="Year Name" placeholder="e.g. 2024-25" />
          <Input label="Start Date" type="date" />
          <Input label="End Date" type="date" />
          <div className="flex items-end mb-4">
            <Button variant="success" className="w-full">Activate Year</Button>
          </div>
        </div>
      </div>
      <Table columns={columns} data={data} onEdit={() => {}} onDelete={() => {}} />
    </div>
  );
};

export default FinancialYearMaster;