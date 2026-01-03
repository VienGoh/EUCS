// src/components/modals/responden-modal.tsx
"use client";

import { useState, useEffect } from "react";

interface Platform {
  id: number;
  name: string;
}

interface Responden {
  id?: number;
  nama: string;
  umur: number;
  jenisKelamin: string;
  platformId: number;
}

interface RespondenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (responden: Responden) => void;
  platforms: Platform[];
  initialData?: Responden | null;
}

export default function RespondenModal({
  isOpen,
  onClose,
  onSave,
  platforms,
  initialData
}: RespondenModalProps) {
  const [formData, setFormData] = useState<Responden>({
    nama: "",
    umur: 20,
    jenisKelamin: "Laki-laki",
    platformId: platforms[0]?.id || 1
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        nama: "",
        umur: 20,
        jenisKelamin: "Laki-laki",
        platformId: platforms[0]?.id || 1
      });
    }
  }, [initialData, platforms]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {initialData ? "Edit Responden" : "Tambah Responden Baru"}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan nama responden"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Umur
                </label>
                <input
                  type="number"
                  required
                  min="18"
                  max="100"
                  value={formData.umur}
                  onChange={(e) => setFormData({...formData, umur: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Kelamin
                </label>
                <select
                  value={formData.jenisKelamin}
                  onChange={(e) => setFormData({...formData, jenisKelamin: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Platform
                </label>
                <select
                  value={formData.platformId}
                  onChange={(e) => setFormData({...formData, platformId: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {platforms.map((platform) => (
                    <option key={platform.id} value={platform.id}>
                      {platform.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {initialData ? "Update" : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}