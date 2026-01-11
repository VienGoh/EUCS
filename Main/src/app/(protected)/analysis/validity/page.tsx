"use client"

import { useState, useEffect } from 'react'

interface ValidityData {
  summary: {
    totalItems: number
    totalValid: number
    validityRate: number
    avgRHitung: number
    avgCronbach: number
  }
  byDimension: Record<string, any>
  allItems: Array<any>
}

export default function ValidityAnalysisPage() {
  const [data, setData] = useState<ValidityData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/analysis/validity')
      const result = await res.json()
      
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Error fetching validity analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Memuat analisis validitas...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Gagal memuat data analisis validitas</p>
      </div>
    )
  }

  const dimensions = Object.keys(data.byDimension)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analisis Validitas</h1>
        <p className="text-gray-600">Uji validitas instrumen penelitian menggunakan metode korelasi Pearson</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Total Item</p>
          <p className="text-2xl font-bold text-gray-900">{data.summary.totalItems}</p>
          <p className="text-xs text-gray-500">Pertanyaan</p>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Valid</p>
          <p className="text-2xl font-bold text-gray-900">{data.summary.totalValid}</p>
          <p className="text-xs text-gray-500">Item</p>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Tingkat Validitas</p>
          <p className="text-2xl font-bold text-gray-900">{data.summary.validityRate}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="h-2 rounded-full bg-green-500"
              style={{ width: `${data.summary.validityRate}%` }}
            ></div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Rata-rata r hitung</p>
          <p className="text-2xl font-bold text-gray-900">{data.summary.avgRHitung.toFixed(3)}</p>
          <p className="text-xs text-gray-500">r tabel = 0.361</p>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Rata-rata Cronbach</p>
          <p className="text-2xl font-bold text-gray-900">{data.summary.avgCronbach.toFixed(3)}</p>
          <p className="text-xs text-gray-500">Alpha</p>
        </div>
      </div>

      {/* Validity by Dimension */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Validitas per Dimensi</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 text-sm font-medium text-gray-500">Dimensi</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Total Item</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Valid</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Tidak Valid</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Tingkat Validitas</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Rata-rata r</th>
              </tr>
            </thead>
            <tbody>
              {dimensions.map((dimension) => {
                const dimData = data.byDimension[dimension]
                const validityRate = dimData.items.length > 0 
                  ? (dimData.validCount / dimData.items.length) * 100 
                  : 0
                
                return (
                  <tr key={dimension} className="border-b hover:bg-gray-50">
                    <td className="py-4">
                      <p className="font-medium text-gray-900">{dimension}</p>
                      <p className="text-sm text-gray-500">
                        {dimData.dimension.description}
                      </p>
                    </td>
                    <td className="py-4">
                      <p className="text-gray-900">{dimData.items.length}</p>
                    </td>
                    <td className="py-4">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {dimData.validCount}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                        {dimData.invalidCount}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="h-2 rounded-full bg-blue-500"
                            style={{ width: `${validityRate}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-900">{validityRate.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="py-4">
                      {dimData.items.length > 0 && (
                        <p className="text-gray-900">
                          {(dimData.items.reduce((sum: number, item: any) => sum + item.rHitung, 0) / dimData.items.length).toFixed(3)}
                        </p>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Validity Table */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Detail Validitas Item</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 text-sm font-medium text-gray-500">Kode</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Pertanyaan</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Dimensi</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">r hitung</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">r tabel</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Cronbach α</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Status Cronbach</th>
              </tr>
            </thead>
            <tbody>
              {data.allItems.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3">
                    <p className="font-medium text-gray-900">{item.questionCode}</p>
                  </td>
                  <td className="py-3 max-w-xs">
                    <p className="text-gray-900 text-sm truncate" title={item.questionText}>
                      {item.questionText}
                    </p>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                      {item.dimension}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`font-bold ${
                      item.rHitung > item.rTabel ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.rHitung.toFixed(3)}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-gray-600">{item.rTabel.toFixed(3)}</span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.status === 'Valid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3">
                    {item.cronbachAlpha ? (
                      <span className="font-bold text-gray-900">
                        {item.cronbachAlpha.toFixed(3)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-3">
                    {item.cronbachStatus && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.cronbachStatus === 'Reliabel' 
                          ? 'bg-green-100 text-green-800' 
                          : item.cronbachStatus === 'Cukup'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.cronbachStatus}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interpretation */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-bold text-blue-800 mb-2">Interpretasi Hasil Validitas</h3>
        <div className="space-y-2 text-blue-700 text-sm">
          <p><strong>Kriteria Validitas:</strong> r hitung {">"} r tabel (0.361) = Valid</p>
          <p><strong>Kriteria Reliabilitas:</strong> Cronbach's Alpha ≥ 0.7 = Reliabel</p>
          <p><strong>Tingkat Validitas Keseluruhan:</strong> {data.summary.validityRate}%</p>
          <p>
            <strong>Kesimpulan:</strong> {data.summary.validityRate >= 80 
              ? 'Instrumen penelitian memiliki validitas yang baik'
              : 'Perlu revisi pada item yang tidak valid'}
          </p>
        </div>
      </div>
    </div>
  )
}