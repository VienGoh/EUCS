"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function EucsAnalysisPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/analysis/eucs')
      const json = await res.json()
      setData(json.data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Memuat analisis EUCS...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Analisis EUCS</h2>
          <p className="text-gray-600">End User Computing Satisfaction Scores</p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
        >
          Refresh Data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-sm text-gray-500">Skor Total Rata-rata</div>
          <div className="text-3xl font-bold text-blue-600">
            {data?.summary?.averageTotalScore?.toFixed(2) || '0.00'}
          </div>
          <div className="text-xs text-gray-400">Dari skala 5</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-sm text-gray-500">Dimensi Tertinggi</div>
          <div className="text-xl font-bold text-green-600">
            {data?.dimensions ? Object.entries(data.dimensions)
              .sort((a: any, b: any) => b[1].average - a[1].average)[0]?.[0] : '-'}
          </div>
          <div className="text-xs text-gray-400">Skor terbaik</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-sm text-gray-500">Dimensi Terendah</div>
          <div className="text-xl font-bold text-red-600">
            {data?.dimensions ? Object.entries(data.dimensions)
              .sort((a: any, b: any) => a[1].average - b[1].average)[0]?.[0] : '-'}
          </div>
          <div className="text-xs text-gray-400">Perlu perbaikan</div>
        </div>
      </div>

      {/* EUCS Dimensions Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-900">Skor Dimensi EUCS</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dimensi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rata-rata
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Max
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Interpretasi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.dimensions && Object.entries(data.dimensions).map(([key, value]: [string, any]) => {
                const dimensionLabels: Record<string, string> = {
                  'Content': 'Content (Konten)',
                  'Accuracy': 'Accuracy (Akurasi)',
                  'Format': 'Format (Format)',
                  'EaseOfUse': 'Ease of Use (Kemudahan)',
                  'Timeliness': 'Timeliness (Ketepatan Waktu)',
                  'Loyalty': 'Loyalty (Loyalitas)'
                }
                
                const getInterpretation = (score: number) => {
                  if (score >= 4) return { text: 'Sangat Baik', color: 'bg-green-100 text-green-800' }
                  if (score >= 3) return { text: 'Baik', color: 'bg-blue-100 text-blue-800' }
                  if (score >= 2) return { text: 'Cukup', color: 'bg-yellow-100 text-yellow-800' }
                  return { text: 'Kurang', color: 'bg-red-100 text-red-800' }
                }
                
                const interpretation = getInterpretation(value.average)
                
                return (
                  <tr key={key} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {dimensionLabels[key] || key}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-gray-900">
                        {value.average?.toFixed(2) || '0.00'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {value.min?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {value.max?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {value.count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${interpretation.color}`}>
                        {interpretation.text}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Distribution */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Distribusi Skor Total</h3>
        {data?.distribution ? (
          <div className="space-y-4">
            {[
              { key: 'veryHigh', label: 'Sangat Tinggi (4.0 - 5.0)', color: 'bg-green-500' },
              { key: 'high', label: 'Tinggi (3.0 - 3.9)', color: 'bg-blue-500' },
              { key: 'medium', label: 'Sedang (2.0 - 2.9)', color: 'bg-yellow-500' },
              { key: 'low', label: 'Rendah (1.0 - 1.9)', color: 'bg-red-500' }
            ].map(({ key, label, color }) => {
              const count = data.distribution[key] || 0
              const total = Object.values(data.distribution).reduce((a: number, b: number) => a + b, 0)
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0
              
              return (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{label}</span>
                    <span className="text-gray-600">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${color}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
            <div className="pt-4 border-t text-sm text-gray-500">
              Total Responden: {Object.values(data.distribution).reduce((a: number, b: number) => a + b, 0)}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Belum ada data distribusi</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Link
          href="/visualization"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          Lihat Visualisasi
        </Link>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
          Export Report
        </button>
      </div>
    </div>
  )
}