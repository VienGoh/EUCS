"use client"

import { useState, useEffect } from 'react'

interface RegressionItem {
  dimension: string
  coefficient: number
  tValue: number
  pValue: number
  significance: 'Signifikan' | 'Tidak Signifikan'
  interpretation: string
}

export default function RegressionAnalysisPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<RegressionItem[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Simulasi data regresi
      setTimeout(() => {
        const mockData: RegressionItem[] = [
          { dimension: 'Content', coefficient: 0.32, tValue: 3.45, pValue: 0.001, significance: 'Signifikan', interpretation: 'Pengaruh positif signifikan' },
          { dimension: 'Accuracy', coefficient: 0.28, tValue: 2.98, pValue: 0.004, significance: 'Signifikan', interpretation: 'Pengaruh positif signifikan' },
          { dimension: 'Format', coefficient: 0.21, tValue: 2.15, pValue: 0.035, significance: 'Signifikan', interpretation: 'Pengaruh positif signifikan' },
          { dimension: 'Ease of Use', coefficient: 0.45, tValue: 4.87, pValue: 0.000, significance: 'Signifikan', interpretation: 'Pengaruh positif paling kuat' },
          { dimension: 'Timeliness', coefficient: 0.19, tValue: 1.95, pValue: 0.056, significance: 'Tidak Signifikan', interpretation: 'Pengaruh tidak signifikan' }
        ]
        setData(mockData)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Memuat analisis regresi...</p>
        </div>
      </div>
    )
  }

  const rSquared = 0.78
  const adjustedRSquared = 0.76
  const significantCount = data.filter(d => d.significance === 'Signifikan').length
  const totalCount = data.length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Analisis Regresi</h2>
        <p className="text-gray-600">Pengaruh dimensi EUCS terhadap Loyalitas Pengguna</p>
      </div>

      {/* Model Summary */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Ringkasan Model Regresi</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">R Square</div>
            <div className="text-2xl font-bold text-gray-900">{rSquared.toFixed(3)}</div>
            <div className="text-xs text-blue-500">Koefisien Determinasi</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Adjusted R²</div>
            <div className="text-2xl font-bold text-gray-900">{adjustedRSquared.toFixed(3)}</div>
            <div className="text-xs text-green-500">R² yang disesuaikan</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-purple-600 font-medium">Signifikansi</div>
            <div className="text-2xl font-bold text-gray-900">{significantCount}/{totalCount}</div>
            <div className="text-xs text-purple-500">Variabel signifikan</div>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>Model regresi mampu menjelaskan <strong>{Math.round(rSquared * 100)}%</strong> variasi loyalitas pengguna.</p>
        </div>
      </div>

      {/* Regression Coefficients Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-900">Koefisien Regresi</h3>
          <p className="text-sm text-gray-600 mt-1">Pengaruh setiap dimensi terhadap Loyalitas (α = 0.05)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variabel Independen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Koefisien (β)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  t-value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  p-value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Signifikansi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Interpretasi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((item) => (
                <tr key={item.dimension} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{item.dimension}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-lg font-bold ${
                      item.coefficient >= 0.4 ? 'text-green-600' :
                      item.coefficient >= 0.2 ? 'text-blue-600' :
                      'text-yellow-600'
                    }`}>
                      {item.coefficient.toFixed(3)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-bold text-gray-900">
                      {item.tValue.toFixed(3)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-bold ${
                      item.pValue < 0.01 ? 'text-green-600' :
                      item.pValue < 0.05 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {item.pValue.toFixed(3)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.significance === 'Signifikan' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.significance}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{item.interpretation}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interpretation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-800 mb-3">Kesimpulan:</h4>
          <ul className="space-y-2 text-sm text-green-700">
            <li>• <strong>Ease of Use</strong> memiliki pengaruh terkuat (β = 0.450)</li>
            <li>• <strong>Content</strong> dan <strong>Accuracy</strong> juga berpengaruh signifikan</li>
            <li>• <strong>Timeliness</strong> tidak signifikan mempengaruhi loyalitas</li>
            <li>• Model memiliki daya prediksi yang baik (R² = {rSquared.toFixed(3)})</li>
          </ul>
        </div>
        
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-3">Rekomendasi:</h4>
          <ul className="space-y-2 text-sm text-blue-700">
            <li>• Fokus pada peningkatan <strong>kemudahan penggunaan</strong> sistem</li>
            <li>• Perbaiki <strong>ketepatan waktu</strong> untuk meningkatkan signifikansi</li>
            <li>• Pertahankan kualitas <strong>konten</strong> dan <strong>akurasi</strong> informasi</li>
            <li>• Model regresi valid untuk prediksi loyalitas pengguna</li>
          </ul>
        </div>
      </div>

      {/* Regression Equation */}
      <div className="bg-gray-50 p-6 rounded-lg border">
        <h4 className="font-semibold text-gray-900 mb-3">Persamaan Regresi:</h4>
        <div className="font-mono text-lg bg-white p-4 rounded border">
          Y = {data[0]?.coefficient.toFixed(3)}X₁ + {data[1]?.coefficient.toFixed(3)}X₂ + {data[2]?.coefficient.toFixed(3)}X₃ + {data[3]?.coefficient.toFixed(3)}X₄ + {data[4]?.coefficient.toFixed(3)}X₅
        </div>
        <div className="mt-3 text-sm text-gray-600">
          <p>Dimana: Y = Loyalitas, X₁ = Content, X₂ = Accuracy, X₃ = Format, X₄ = Ease of Use, X₅ = Timeliness</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
        >
          Refresh Data
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          Export Report
        </button>
      </div>
    </div>
  )
}