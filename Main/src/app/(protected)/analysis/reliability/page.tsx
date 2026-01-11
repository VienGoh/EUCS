"use client"

import { useState, useEffect } from 'react'

interface ReliabilityData {
  overall: {
    average: number
    min: number
    max: number
    count: number
    reliabilityLevel: string
  }
  categories: {
    excellent: number
    good: number
    acceptable: number
    questionable: number
    poor: number
  }
  byDimension: Record<string, any>
  rawData: Array<any>
}

export default function ReliabilityAnalysisPage() {
  const [data, setData] = useState<ReliabilityData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/analysis/reliability')
      const result = await res.json()
      
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Error fetching reliability analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Memuat analisis reliabilitas...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Gagal memuat data analisis reliabilitas</p>
      </div>
    )
  }

  const dimensions = Object.keys(data.byDimension)

  // Function to get category color
  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'excellent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-blue-100 text-blue-800'
      case 'acceptable': return 'bg-yellow-100 text-yellow-800'
      case 'questionable': return 'bg-orange-100 text-orange-800'
      case 'poor': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Function to get category label
  const getCategoryLabel = (category: string) => {
    switch(category) {
      case 'excellent': return 'Excellent (α ≥ 0.9)'
      case 'good': return 'Good (0.8 ≤ α < 0.9)'
      case 'acceptable': return 'Acceptable (0.7 ≤ α < 0.8)'
      case 'questionable': return 'Questionable (0.6 ≤ α < 0.7)'
      case 'poor': return 'Poor (α < 0.6)'
      default: return category
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analisis Reliabilitas</h1>
        <p className="text-gray-600">Uji konsistensi internal instrumen menggunakan Cronbach's Alpha</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Rata-rata Cronbach's Alpha</p>
          <p className="text-2xl font-bold text-gray-900">{data.overall.average.toFixed(3)}</p>
          <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(
            data.overall.reliabilityLevel.toLowerCase()
          )}`}>
            {data.overall.reliabilityLevel}
          </span>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Range Cronbach's Alpha</p>
          <p className="text-2xl font-bold text-gray-900">
            {data.overall.min.toFixed(3)} - {data.overall.max.toFixed(3)}
          </p>
          <p className="text-xs text-gray-500">Min - Max</p>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Total Item</p>
          <p className="text-2xl font-bold text-gray-900">{data.overall.count}</p>
          <p className="text-xs text-gray-500">Pertanyaan</p>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Dimensi</p>
          <p className="text-2xl font-bold text-gray-900">{dimensions.length}</p>
          <p className="text-xs text-gray-500">Yang Dianalisis</p>
        </div>
      </div>

      {/* Reliability Categories */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Distribusi Kategori Reliabilitas</h2>
        <div className="space-y-4">
          {Object.entries(data.categories).map(([category, count]) => (
            <div key={category} className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">
                  {getCategoryLabel(category)}
                </span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">{count} item</span>
                  <span className="font-bold text-gray-900">
                    {data.overall.count > 0 ? ((count / data.overall.count) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${getCategoryColor(category)}`}
                  style={{ 
                    width: `${data.overall.count > 0 ? (count / data.overall.count) * 100 : 0}%`,
                    backgroundColor: getCategoryColor(category).split(' ')[0].replace('bg-', '').replace('-100', '-500')
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reliability by Dimension */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Reliabilitas per Dimensi</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 text-sm font-medium text-gray-500">Dimensi</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Jumlah Item</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Rata-rata α</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Min α</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Max α</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Tingkat Reliabilitas</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Interpretasi</th>
              </tr>
            </thead>
            <tbody>
              {dimensions.map((dimension) => {
                const dimData = data.byDimension[dimension]
                const stats = dimData.stats || {}
                
                return (
                  <tr key={dimension} className="border-b hover:bg-gray-50">
                    <td className="py-4">
                      <div>
                        <p className="font-medium text-gray-900">{dimension}</p>
                        <p className="text-sm text-gray-500">
                          {dimData.dimension.description}
                        </p>
                      </div>
                    </td>
                    <td className="py-4">
                      <p className="text-gray-900">{stats.count || 0}</p>
                    </td>
                    <td className="py-4">
                      <p className="font-bold text-gray-900">
                        {stats.average?.toFixed(3) || '-'}
                      </p>
                    </td>
                    <td className="py-4">
                      <p className="text-gray-900">
                        {stats.min?.toFixed(3) || '-'}
                      </p>
                    </td>
                    <td className="py-4">
                      <p className="text-gray-900">
                        {stats.max?.toFixed(3) || '-'}
                      </p>
                    </td>
                    <td className="py-4">
                      {stats.reliabilityLevel && (
                        <span className={`px-3 py-1 rounded-full text-sm ${getCategoryColor(
                          stats.reliabilityLevel.toLowerCase()
                        )}`}>
                          {stats.reliabilityLevel}
                        </span>
                      )}
                    </td>
                    <td className="py-4">
                      <p className="text-sm text-gray-600 max-w-xs">
                        {stats.reliabilityLevel === 'Excellent' && 'Konsistensi internal sangat baik'}
                        {stats.reliabilityLevel === 'Good' && 'Konsistensi internal baik'}
                        {stats.reliabilityLevel === 'Acceptable' && 'Konsistensi internal dapat diterima'}
                        {stats.reliabilityLevel === 'Questionable' && 'Konsistensi internal dipertanyakan'}
                        {stats.reliabilityLevel === 'Poor' && 'Konsistensi internal buruk'}
                      </p>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Reliability Table */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Detail Reliabilitas per Item</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 text-sm font-medium text-gray-500">Kode</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Dimensi</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Indikator</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Cronbach's Alpha</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Interpretasi</th>
              </tr>
            </thead>
            <tbody>
              {data.rawData.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3">
                    <p className="font-medium text-gray-900">{item.questionCode}</p>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                      {item.dimension}
                    </span>
                  </td>
                  <td className="py-3">
                    <p className="text-gray-900 text-sm">{item.indicator}</p>
                  </td>
                  <td className="py-3">
                    {item.cronbachAlpha ? (
                      <span className={`font-bold ${
                        item.cronbachAlpha >= 0.9 ? 'text-green-600' :
                        item.cronbachAlpha >= 0.8 ? 'text-blue-600' :
                        item.cronbachAlpha >= 0.7 ? 'text-yellow-600' :
                        item.cronbachAlpha >= 0.6 ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {item.cronbachAlpha.toFixed(3)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-3">
                    {item.cronbachStatus && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.cronbachStatus === 'Reliabel' ? 'bg-green-100 text-green-800' :
                        item.cronbachStatus === 'Cukup' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.cronbachStatus}
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    <p className="text-sm text-gray-600 max-w-xs">
                      {item.cronbachAlpha && (
                        item.cronbachAlpha >= 0.9 ? 'Reliabilitas sangat baik' :
                        item.cronbachAlpha >= 0.8 ? 'Reliabilitas baik' :
                        item.cronbachAlpha >= 0.7 ? 'Reliabilitas dapat diterima' :
                        item.cronbachAlpha >= 0.6 ? 'Reliabilitas perlu diperhatikan' :
                        'Reliabilitas tidak memadai'
                      )}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interpretation */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-bold text-blue-800 mb-2">Interpretasi Cronbach's Alpha</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div className="space-y-2">
            <p><strong>α ≥ 0.9:</strong> Excellent reliability - konsistensi internal sangat baik</p>
            <p><strong>0.8 ≤ α &lt; 0.9:</strong> Good reliability - konsistensi internal baik</p>
            <p><strong>0.7 ≤ α &lt; 0.8:</strong> Acceptable reliability - dapat diterima untuk penelitian</p>
          </div>
          <div className="space-y-2">
            <p><strong>0.6 ≤ α &lt; 0.7:</strong> Questionable reliability - perlu perhatian</p>
            <p><strong>α &lt; 0.6:</strong> Poor reliability - tidak memadai untuk penelitian</p>
            <p><strong>Kesimpulan:</strong> Cronbach's Alpha keseluruhan: <strong>{data.overall.average.toFixed(3)}</strong> ({data.overall.reliabilityLevel})</p>
          </div>
        </div>
      </div>
    </div>
  )
}