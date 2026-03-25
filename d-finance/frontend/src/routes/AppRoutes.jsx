import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// --- NEW LANDING PAGE ---
import LandingPage from '../pages/LandingPage'; 

// Layouts
import AdminLayout from '../layouts/AdminLayout';
import UserLayout from '../layouts/UserLayout'; 
import CustomerLayout from '../layouts/CustomerLayout'; 
import AccountantLayout from '../layouts/AccountantLayout';

// Auth Pages
import Login from '../pages/Auth/Login'; 
import Signup from '../pages/Auth/Signup';

// Admin Pages
import Dashboard from '../pages/Dashboard/Dashboard';
import BranchMaster from '../pages/Master/BranchMaster/BranchMaster';
import CustomerEntry from '../pages/Customer/CustomerEntry/CustomerEntry';
import LoanMaster from '../pages/Master/LoanMaster/LoanMaster';
import AdvisorEntry from '../pages/Advisor/AdvisorEntry/AdvisorEntry';
import CollectionEntry from '../pages/Collection/CollectionEntry';
import BulkDataRetrieval from '../pages/Admin/BulkDataRetrieval'; 
import ManageBlogs from '../pages/Admin/ManageBlogs'; 

// User (Advisor) Pages
import UserDashboard from '../pages/User/UserDashboard';
import AdvisorVerification from '../pages/Advisor/AdvisorVerification'; 

// Accountant Pages
import AccountantApproval from '../pages/Accountant/AccountantApproval'; 

// Customer Pages
import CustomerDashboard from "../pages/Customer/CustomerDashboard";
import LoanApply from "../pages/Customer/ApplyLoan";
import LoanTracking from "../pages/Customer/LoanTracking"; 
import EMIPayments from "../pages/Customer/EMIPayments";

const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Website Home (Landing Page) */}
      <Route path="/" element={<LandingPage />} />

      {/* 2. Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* 3. Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="master/branch" element={<BranchMaster />} />
        <Route path="customer/entry" element={<CustomerEntry />} />
        <Route path="loan" element={<LoanMaster />} />
        <Route path="advisor" element={<AdvisorEntry />} />
        <Route path="collection" element={<CollectionEntry />} />
        <Route path="bulk-data-retrieval" element={<BulkDataRetrieval />} /> 
        <Route path="manage-blogs" element={<ManageBlogs />} />
      </Route>

      {/* 4. User (Advisor) Routes */}
      <Route path="/user" element={<UserLayout />}>
        <Route index element={<UserDashboard />} />
        <Route path="field-verification" element={<AdvisorVerification />} /> 
        <Route path="my-team" element={<div className="p-10 font-bold text-gray-400 text-center">Advisor Tree Section</div>} />
        <Route path="payouts" element={<div className="p-10 font-bold text-gray-400 text-center">Commission Reports</div>} />
      </Route>

      {/* 5. Accountant Routes */}
      <Route path="/accountant" element={<AccountantLayout />}>
        <Route index element={<Navigate to="approval" replace />} />
        <Route path="approval" element={<AccountantApproval />} />
        <Route path="reports" element={<div className="p-10 font-bold text-gray-400 text-center">Audit & Compliance Logs</div>} />
      </Route>

      {/* 6. Customer Routes */}
      <Route path="/customer" element={<CustomerLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="apply-loan" element={<LoanApply />} />
        <Route path="tracking" element={<LoanTracking />} />
        <Route path="emi" element={<EMIPayments />} />
      </Route>

      {/* 7. Error 404 Redirect */}
      <Route path="*" element={<div className="h-screen flex items-center justify-center font-bold text-2xl text-red-500 bg-gray-100">404: Path Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;