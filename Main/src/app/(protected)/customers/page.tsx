"use client";

import { useState, useEffect, useCallback } from "react";
import CustomerTable from "@/components/tables/CustomerTable";
import CustomerFormFilter from "@/components/forms/CustomerForm";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  const fetchCustomers = useCallback(async (filterParams?: any) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterParams) {
        Object.entries(filterParams).forEach(([key, value]) => {
          if (value) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await fetch(`/api/customers?${params.toString()}`);
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    fetchCustomers(newFilters);
  };

  const handleDelete = async (customerId: number) => {
    if (confirm("Hapus customer ini?")) {
      await fetch(`/api/customers/${customerId}`, { method: "DELETE" });
      fetchCustomers(filters);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-600 mt-1">Kelola data pelanggan</p>
        </div>
        <a
          href="/customers/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Customer
        </a>
      </div>

      {/* Filter Sederhana */}
      <CustomerFormFilter 
        onFilterChange={handleFilterChange}
        initialFilters={filters}
      />

      {/* Tabel */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <CustomerTable 
          customers={customers}
          isLoading={loading}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}