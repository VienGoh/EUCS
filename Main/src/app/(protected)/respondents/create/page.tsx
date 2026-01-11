"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateRespondentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Laki-laki',
    email: '',
    phone: '',
    occupation: 'Mahasiswa',
    education: 'S1',
    incomeRange: '< 3jt',
    tiktokUsage: '3',
    tiktokShopUsage: '3',
    lastPurchase: new Date().toISOString().split('T')[0]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/respondents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        router.push('/respondents')
      } else {
        alert('Gagal menyimpan data')
      }
    } catch (error) {
      console.error(error)
      alert('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tambah Responden Baru</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Info */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Nama responden"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Usia</label>
            <input
              type="number"
              required
              min="17"
              max="60"
              value={formData.age}
              onChange={(e) => setFormData({...formData, age: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: 25"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="email@example.com"
            />
          </div>

          {/* Contact & Demographics */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Telepon</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="081234567890"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Pekerjaan</label>
            <select
              value={formData.occupation}
              onChange={(e) => setFormData({...formData, occupation: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Mahasiswa">Mahasiswa</option>
              <option value="Pelajar">Pelajar</option>
              <option value="Pegawai Swasta">Pegawai Swasta</option>
              <option value="PNS">PNS</option>
              <option value="Wiraswasta">Wiraswasta</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Pendidikan</label>
            <select
              value={formData.education}
              onChange={(e) => setFormData({...formData, education: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="SMA">SMA</option>
              <option value="D3">D3</option>
              <option value="S1">S1</option>
              <option value="S2">S2</option>
              <option value="S3">S3</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Range Pendapatan</label>
            <select
              value={formData.incomeRange}
              onChange={(e) => setFormData({...formData, incomeRange: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="< 3jt">{"< 3 juta"}</option>
              <option value="3-5jt">3 - 5 juta</option>
              <option value="5-10jt">5 - 10 juta</option>
              <option value="> 10jt">{"> 10 juta"}</option>
            </select>
          </div>

          {/* TikTok Usage */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Frekuensi Penggunaan TikTok (1-5)
            </label>
            <select
              value={formData.tiktokUsage}
              onChange={(e) => setFormData({...formData, tiktokUsage: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num} ({getUsageLabel(num)})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Frekuensi Penggunaan TikTok Shop (1-5)
            </label>
            <select
              value={formData.tiktokShopUsage}
              onChange={(e) => setFormData({...formData, tiktokShopUsage: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num} ({getUsageLabel(num)})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Tanggal Pembelian Terakhir
            </label>
            <input
              type="date"
              required
              value={formData.lastPurchase}
              onChange={(e) => setFormData({...formData, lastPurchase: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan Responden'}
          </button>
        </div>
      </form>
    </div>
  )
}

function getUsageLabel(score: number): string {
  switch(score) {
    case 1: return 'Sangat Jarang'
    case 2: return 'Jarang'
    case 3: return 'Kadang-kadang'
    case 4: return 'Sering'
    case 5: return 'Sangat Sering'
    default: return ''
  }
}