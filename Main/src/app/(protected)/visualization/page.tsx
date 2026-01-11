"use client"

import { useState, useEffect } from 'react'

export default function VisualizationPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/analysis/eucs')
      if (!res.ok) throw new Error('Failed to fetch data')
      
      const json = await res.json()
      setData(json.data)
    } catch (error) {
      console.error('Error:', error)
      // Tetap set data kosong jika error
      setData({
        dimensions: {},
        distribution: {},
        totalSurveys: 0,
        recentAnalyses: [],
        lastUpdated: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    if (!data) return
    
    let csvContent = 'data:text/csv;charset=utf-8,'
    
    // Header
    csvContent += 'LAPORAN ANALISIS EUCS\n'
    csvContent += `Tanggal Export: ${new Date().toLocaleDateString('id-ID')}\n\n`
    
    // Add dimensions data
    csvContent += 'DIMENSI EUCS\n'
    csvContent += 'Dimensi,Rata-rata,Min,Max,Jumlah Data\n'
    
    const dimensionMap: Record<string, string> = {
      'Content': 'Konten',
      'Accuracy': 'Akurasi',
      'Format': 'Format',
      'EaseOfUse': 'Kemudahan',
      'Timeliness': 'Ketepatan Waktu',
      'Loyalty': 'Loyalitas'
    }
    
    Object.entries(data.dimensions || {}).forEach(([key, value]: [string, any]) => {
      const label = dimensionMap[key] || key
      csvContent += `${label},${value.average?.toFixed(2) || '0.00'},${value.min?.toFixed(2) || '0.00'},${value.max?.toFixed(2) || '0.00'},${value.count || 0}\n`
    })
    
    csvContent += '\nDISTRIBUSI SKOR TOTAL\n'
    csvContent += 'Kategori,Rentang Skor,Jumlah,Persentase\n'
    
    const categories = [
      { key: 'veryHigh', label: 'Sangat Tinggi', range: '4.0 - 5.0' },
      { key: 'high', label: 'Tinggi', range: '3.0 - 3.9' },
      { key: 'medium', label: 'Sedang', range: '2.0 - 2.9' },
      { key: 'low', label: 'Rendah', range: '1.0 - 1.9' }
    ]
    
    const totalDistribution = Object.values(data.distribution || {}).reduce((a: number, b: number) => a + b, 0)
    
    categories.forEach(cat => {
      const count = data.distribution?.[cat.key] || 0
      const percentage = totalDistribution > 0 ? ((count / totalDistribution) * 100).toFixed(1) : '0.0'
      csvContent += `${cat.label},${cat.range},${count},${percentage}%\n`
    })
    
    csvContent += `\nTotal Responden:,${totalDistribution}\n`
    
    // Add recent analyses if available
    if (data.recentAnalyses && data.recentAnalyses.length > 0) {
      csvContent += '\nDATA RESPONDEN TERBARU\n'
      csvContent += 'No,Tanggal,Nama,Email,Skor Total,Loyalitas,Konten,Akurasi,Format,Kemudahan,Ketepatan Waktu,Status\n'
      
      data.recentAnalyses.forEach((item: any, index: number) => {
        csvContent += `${index + 1},`
        csvContent += `${new Date(item.createdAt).toLocaleDateString('id-ID')},`
        csvContent += `${item.respondent?.name || 'N/A'},`
        csvContent += `${item.respondent?.email || 'N/A'},`
        csvContent += `${item.totalScore?.toFixed(2) || '0.00'},`
        csvContent += `${(item.scores?.loyalty || 0).toFixed(2)},`
        csvContent += `${(item.scores?.content || 0).toFixed(2)},`
        csvContent += `${(item.scores?.accuracy || 0).toFixed(2)},`
        csvContent += `${(item.scores?.format || 0).toFixed(2)},`
        csvContent += `${(item.scores?.easeOfUse || 0).toFixed(2)},`
        csvContent += `${(item.scores?.timeliness || 0).toFixed(2)},`
        
        const status = item.totalScore >= 4 ? 'Sangat Baik' :
                      item.totalScore >= 3 ? 'Baik' :
                      item.totalScore >= 2 ? 'Cukup' : 'Kurang'
        csvContent += `${status}\n`
      })
    }
    
    // Add summary
    csvContent += '\nRINGKASAN\n'
    csvContent += `Total Survei Selesai:,${data.totalSurveys || 0}\n`
    csvContent += `Total Analisis:,${data.summary?.totalAnalyses || 0}\n`
    csvContent += `Skor Total Rata-rata:,${data.summary?.averageTotalScore?.toFixed(2) || '0.00'}\n`
    csvContent += `Data Terakhir Update:,${new Date(data.lastUpdated || new Date()).toLocaleString('id-ID')}\n`
    
    // Create download link
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `laporan-eucs-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const renderProgressBar = (value: number, max: number = 5) => {
    const percentage = (value / max) * 100
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="h-2.5 rounded-full" 
          style={{ 
            width: `${percentage}%`,
            backgroundColor: percentage >= 80 ? '#10B981' :
                           percentage >= 60 ? '#3B82F6' :
                           percentage >= 40 ? '#F59E0B' : '#EF4444'
          }}
        ></div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Memuat data visualisasi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Visualisasi Data EUCS</h1>
        <p className="text-gray-600">Data real-time dari database penelitian</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="text-sm text-blue-600 font-medium">Total Survei</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">
            {data?.totalSurveys || 0}
          </div>
          <div className="text-xs text-blue-500 mt-1">Selesai diisi</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="text-sm text-green-600 font-medium">Total Analisis</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">
            {data?.summary?.totalAnalyses || 0}
          </div>
          <div className="text-xs text-green-500 mt-1">Data terproses</div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="text-sm text-purple-600 font-medium">Skor Rata-rata</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">
            {data?.summary?.averageTotalScore?.toFixed(2) || '0.00'}
          </div>
          <div className="text-xs text-purple-500 mt-1">Dari skala 5</div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
          <div className="text-sm text-orange-600 font-medium">Update Terakhir</div>
          <div className="text-lg font-semibold text-gray-900 mt-1">
            {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleDateString('id-ID') : '-'}
          </div>
          <div className="text-xs text-orange-500 mt-1">Data terkini</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="flex border-b overflow-x-auto">
          {['dimensi', 'distribusi', 'trend', 'data'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'dimensi' && 'Dimensi EUCS'}
              {tab === 'distribusi' && 'Distribusi Skor'}
              {tab === 'trend' && 'Trend Data'}
              {tab === 'data' && 'Data Mentah'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Dimensi EUCS Tab */}
          {activeTab === 'dimensi' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skor per Dimensi EUCS</h3>
              
              {Object.keys(data?.dimensions || {}).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(data.dimensions).map(([key, value]: [string, any]) => {
                    const dimensionLabels: Record<string, string> = {
                      'Content': 'Konten - Kebermanfaatan informasi',
                      'Accuracy': 'Akurasi - Ketepatan informasi',
                      'Format': 'Format - Penyajian informasi',
                      'EaseOfUse': 'Kemudahan - Penggunaan sistem',
                      'Timeliness': 'Ketepatan Waktu - Kecepatan akses',
                      'Loyalty': 'Loyalitas - Niat penggunaan berkelanjutan'
                    }
                    
                    return (
                      <div key={key} className="bg-gray-50 p-4 rounded-lg border">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {dimensionLabels[key] || key}
                            </h4>
                            <div className="text-sm text-gray-500">
                              {value.count} data • Skala 1-5
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                              {value.average?.toFixed(2) || '0.00'}
                            </div>
                            <div className="text-xs text-gray-500">
                              Rata-rata
                            </div>
                          </div>
                        </div>
                        
                        {renderProgressBar(value.average || 0)}
                        
                        <div className="flex justify-between text-sm text-gray-600 mt-2">
                          <div>Min: {value.min?.toFixed(2) || '0.00'}</div>
                          <div>Max: {value.max?.toFixed(2) || '0.00'}</div>
                          <div>
                            {((value.average / 5) * 100).toFixed(1)}% dari maksimal
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">Belum ada data dimensi</p>
                  <p className="text-sm text-gray-400 mt-1">Mulai dengan mengisi survei</p>
                </div>
              )}
            </div>
          )}

          {/* Distribusi Tab */}
          {activeTab === 'distribusi' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Skor Total</h3>
              
              {data?.distribution && Object.values(data.distribution).some((val: any) => val > 0) ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      { key: 'veryHigh', label: 'Sangat Tinggi', color: 'green', range: '4.0 - 5.0' },
                      { key: 'high', label: 'Tinggi', color: 'blue', range: '3.0 - 3.9' },
                      { key: 'medium', label: 'Sedang', color: 'yellow', range: '2.0 - 2.9' },
                      { key: 'low', label: 'Rendah', color: 'red', range: '1.0 - 1.9' }
                    ].map(({ key, label, color, range }) => {
                      const count = data.distribution[key] || 0
                      const total = Object.values(data.distribution).reduce((a: number, b: number) => a + b, 0)
                      const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0'
                      
                      const colorClasses = {
                        green: 'bg-green-50 border-green-200 text-green-800',
                        blue: 'bg-blue-50 border-blue-200 text-blue-800',
                        yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
                        red: 'bg-red-50 border-red-200 text-red-800'
                      }
                      
                      return (
                        <div key={key} className={`p-4 rounded-lg border ${colorClasses[color as keyof typeof colorClasses]}`}>
                          <div className="text-sm font-medium">{label}</div>
                          <div className="text-2xl font-bold mt-1">{count}</div>
                          <div className="text-sm opacity-75 mt-1">{range}</div>
                          <div className="text-sm font-medium mt-2">{percentage}% dari total</div>
                        </div>
                      )
                    })}
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium">Total Responden</div>
                      <div className="text-lg font-bold">
                        {Object.values(data.distribution).reduce((a: number, b: number) => a + b, 0)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Distribusi berdasarkan skor total dari semua responden
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">Belum ada data distribusi</p>
                </div>
              )}
            </div>
          )}

          {/* Trend Tab */}
          {activeTab === 'trend' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Responden Terbaru</h3>
              
              {data?.recentAnalyses && data.recentAnalyses.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">#</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tanggal</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nama</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Skor Total</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Loyalitas</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data.recentAnalyses.map((item: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{index + 1}</td>
                          <td className="px-4 py-3 text-gray-600">
                            {new Date(item.createdAt).toLocaleDateString('id-ID')}
                          </td>
                          <td className="px-4 py-3">
                            {item.respondent?.name || 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold">
                              {item.totalScore?.toFixed(2) || '0.00'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              (item.scores?.loyalty || 0) >= 4 ? 'bg-green-100 text-green-800' :
                              (item.scores?.loyalty || 0) >= 3 ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {(item.scores?.loyalty || 0).toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.totalScore >= 4 ? 'bg-green-100 text-green-800' :
                              item.totalScore >= 3 ? 'bg-blue-100 text-blue-800' :
                              item.totalScore >= 2 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.totalScore >= 4 ? 'Sangat Baik' :
                               item.totalScore >= 3 ? 'Baik' :
                               item.totalScore >= 2 ? 'Cukup' : 'Kurang'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">Belum ada data responden</p>
                  <p className="text-sm text-gray-400 mt-1">Data akan tampil setelah survei diisi</p>
                </div>
              )}
            </div>
          )}

          {/* Data Mentah Tab */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Mentah untuk Analisis</h3>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-blue-800">Ekspor Data</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Download data dalam format CSV untuk analisis lebih lanjut di Excel, SPSS, atau software statistik lainnya.
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleExportCSV}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export CSV
                </button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Informasi Data:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Total data yang tersedia: {data?.totalSurveys || 0} survei</li>
                  <li>• Dimensi EUCS yang diukur: {Object.keys(data?.dimensions || {}).length} dimensi</li>
                  <li>• Format ekspor: CSV (Comma Separated Values)</li>
                  <li>• Data terakhir update: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString('id-ID') : 'N/A'}</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center text-sm"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Data
        </button>
        
        <div className="text-sm text-gray-500">
          Data real-time dari database • Auto refresh setiap 5 menit
        </div>
      </div>
    </div>
  )
}