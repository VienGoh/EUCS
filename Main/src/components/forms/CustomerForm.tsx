"use client";

import { useState, useEffect } from "react";

export type CustomerFilters = {
  name?: string;
  phone?: string;
  email?: string;
};

export default function CustomerFormFilter({ 
  onFilterChange,
  initialFilters 
}: { 
  onFilterChange?: (filters: CustomerFilters) => void;
  initialFilters?: CustomerFilters;
}) {
  const [filters, setFilters] = useState<CustomerFilters>(initialFilters || {});

  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
    }
  }, [initialFilters]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    
    if (onFilterChange) {
      // Debounce untuk performance
      const timeoutId = setTimeout(() => {
        onFilterChange(newFilters);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  };

  const clearFilters = () => {
    const clearedFilters: CustomerFilters = {};
    setFilters(clearedFilters);
    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
  };

  return (
    <div className="mb-6 p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-slate-800">Filter</h3>
        <button
          type="button"
          onClick={clearFilters}
          className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nama
          </label>
          <input
            type="text"
            name="name"
            value={filters.name || ""}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Cari nama..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Telepon
          </label>
          <input
            type="text"
            name="phone"
            value={filters.phone || ""}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Cari telepon..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={filters.email || ""}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Cari email..."
          />
        </div>
      </div>
    </div>
  );
}