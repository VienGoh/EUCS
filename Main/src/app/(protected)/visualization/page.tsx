import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BarChart3, CheckCircle, TrendingUp, Download, Users, Target, Shield, Star } from 'lucide-react'

// Data statistik - akan diambil dari API/database nanti
const stats = [
  {
    title: 'Total Responden',
    value: 0, // Akan diisi dari data real
    icon: <Users className="h-5 w-5" />,
    color: 'bg-blue-50 text-blue-700',
    description: 'Jumlah partisipan survei'
  },
  {
    title: 'Item Valid',
    value: 0, // Akan diisi dari data real
    icon: <Target className="h-5 w-5" />,
    color: 'bg-green-50 text-green-700',
    description: 'Dari total item instrumen'
  },
  {
    title: 'Cronbach Alpha',
    value: '0.000', // Akan diisi dari data real
    icon: <Shield className="h-5 w-5" />,
    color: 'bg-purple-50 text-purple-700',
    description: 'Tingkat reliabilitas'
  },
  {
    title: 'Kepuasan',
    value: '0.0', // Akan diisi dari data real
    icon: <Star className="h-5 w-5" />,
    color: 'bg-orange-50 text-orange-700',
    description: 'Skor rata-rata EUCS'
  }
]

const analysisItems = [
  {
    title: 'Analisis EUCS',
    description: 'Statistik deskriptif skor per dimensi EUCS',
    href: '/analysis/eucs',
    icon: <BarChart3 className="h-6 w-6" />,
    status: 'pending', // 'completed', 'pending', 'error'
    lastUpdated: null
  },
  {
    title: 'Uji Validitas',
    description: 'Korelasi Pearson tiap item instrumen',
    href: '/analysis/validity',
    icon: <CheckCircle className="h-6 w-6" />,
    status: 'pending',
    lastUpdated: null
  },
  {
    title: 'Uji Reliabilitas',
    description: 'Konsistensi internal dengan Cronbach Alpha',
    href: '/analysis/reliability',
    icon: <TrendingUp className="h-6 w-6" />,
    status: 'pending',
    lastUpdated: null
  },
  {
    title: 'Analisis Regresi',
    description: 'Pengaruh dimensi terhadap loyalitas',
    href: '/analysis/regression',
    icon: <BarChart3 className="h-6 w-6" />,
    status: 'pending',
    lastUpdated: null
  }
]

// TODO: Fungsi untuk mengambil data statistik dari API
async function getAnalysisStats() {
  // Contoh: Ambil dari API endpoint
  // const response = await fetch('/api/analysis/stats')
  // const data = await response.json()
  // return data
  
  // Untuk sementara, return data kosong
  return {
    totalRespondents: 0,
    validItems: 0,
    totalItems: 10,
    cronbachAlpha: 0,
    averageSatisfaction: 0,
    lastUpdated: null
  }
}

// TODO: Fungsi untuk mengambil status analisis dari API
async function getAnalysisStatus() {
  // Contoh: Ambil dari API endpoint
  // const response = await fetch('/api/analysis/status')
  // const data = await response.json()
  // return data
  
  // Untuk sementara, return status pending semua
  return analysisItems.map(item => ({
    ...item,
    status: 'pending' as const
  }))
}

export default async function AnalysisPage() {
  // Ambil data statistik
  const statsData = await getAnalysisStats()
  const analysisStatus = await getAnalysisStatus()
  
  // Update nilai statistik dengan data real
  const updatedStats = stats.map(stat => {
    if (stat.title === 'Total Responden') {
      return { ...stat, value: statsData.totalRespondents }
    }
    if (stat.title === 'Item Valid') {
      return { ...stat, value: `${statsData.validItems}/${statsData.totalItems}` }
    }
    if (stat.title === 'Cronbach Alpha') {
      return { ...stat, value: statsData.cronbachAlpha.toFixed(3) }
    }
    if (stat.title === 'Kepuasan') {
      return { ...stat, value: statsData.averageSatisfaction.toFixed(1) }
    }
    return stat
  })

  // Fungsi untuk menentukan warna status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Fungsi untuk menentukan teks status
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Selesai'
      case 'pending': return 'Belum Analisis'
      case 'error': return 'Error'
      default: return 'Unknown'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Analisis</h1>
          <p className="text-gray-600 mt-2">
            Statistik hasil penelitian End-User Computing Satisfaction (EUCS)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Ekspor Data
          </Button>
          <Button className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analisis Sekarang
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {updatedStats.map((stat, index) => (
          <Card key={index} className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </span>
                    {stat.title === 'Cronbach Alpha' && stat.value !== '0.000' && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        parseFloat(stat.value) >= 0.7 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {parseFloat(stat.value) >= 0.7 ? 'Baik' : 'Buruk'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analysis Navigation */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Jenis Analisis</h2>
          <p className="text-sm text-gray-500">
            {statsData.lastUpdated ? `Update terakhir: ${new Date(statsData.lastUpdated).toLocaleDateString('id-ID')}` : 'Data belum diupdate'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysisStatus.map((item) => (
            <Link
              key={item.href}
              href={item.status === 'completed' ? item.href : '#'}
              className={`block border rounded-lg p-6 hover:shadow-md transition-shadow ${
                item.status === 'completed' 
                  ? 'bg-white hover:bg-gray-50 cursor-pointer' 
                  : 'bg-gray-50 cursor-not-allowed opacity-80'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    item.status === 'completed' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.title}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{item.description}</p>
                    
                    {item.status === 'completed' && item.lastUpdated && (
                      <p className="text-xs text-gray-500 mt-2">
                        Update: {new Date(item.lastUpdated).toLocaleDateString('id-ID')}
                      </p>
                    )}
                    
                    {item.status === 'pending' && (
                      <p className="text-sm text-yellow-600 mt-2">
                        Jalankan analisis terlebih dahulu
                      </p>
                    )}
                  </div>
                </div>
                
                {item.status === 'completed' && (
                  <div className="text-blue-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Information Panel */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Informasi Analisis</span>
          </CardTitle>
          <CardDescription>
            Petunjuk dan persyaratan untuk menjalankan analisis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium text-blue-900">Persyaratan Data</p>
                <p className="text-sm text-blue-800 mt-1">
                  Pastikan data survei minimal dari 30 responden untuk analisis yang valid
                </p>
              </div>
            </div>

            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Analisis EUCS: Memerlukan data skor setiap dimensi</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Uji Validitas: Minimal 10 item instrumen</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Uji Reliabilitas: Data lengkap semua responden</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Analisis Regresi: Data variabel dependen dan independen</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}