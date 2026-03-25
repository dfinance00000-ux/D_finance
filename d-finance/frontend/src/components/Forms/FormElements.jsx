import React from 'react';

// Standard Input Field
export const Input = ({ label, type = "text", placeholder, name, value, onChange, required = false }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-semibold text-gray-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>}
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
    />
  </div>
);

// Standard Select Dropdown
export const Select = ({ label, name, options, value, onChange, required = false }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-semibold text-gray-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>}
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm transition-all"
    >
      <option value="">Select Option</option>
      {options.map((opt, index) => (
        <option key={index} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

// Action Button
export const Button = ({ children, type = "button", variant = "primary", onClick, className = "" }) => {
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-6 py-2 rounded-md font-semibold text-sm transition-all shadow-sm active:scale-95 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};