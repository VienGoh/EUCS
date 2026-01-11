    import Link from 'next/link'

    const analysisItems = [
    {
        title: 'Analisis EUCS',
        description: 'Skor per dimensi EUCS dan hasil perhitungan',
        href: '/analysis/eucs',
        icon: '📊',
        color: 'bg-blue-50 border-blue-200'
    },
    {
        title: 'Uji Validitas',
        description: 'Hasil uji validitas instrumen penelitian',
        href: '/analysis/validity',
        icon: '✅',
        color: 'bg-green-50 border-green-200'
    },
    {
        title: 'Uji Reliabilitas',
        description: 'Cronbach Alpha dan konsistensi instrumen',
        href: '/analysis/reliability',
        icon: '📈',
        color: 'bg-purple-50 border-purple-200'
    },
    {
        title: 'Analisis Regresi',
        description: 'Pengaruh dimensi EUCS terhadap loyalitas',
        href: '/analysis/regression',
        icon: '📉',
        color: 'bg-orange-50 border-orange-200'
    }
    ]

    export default function AnalysisPage() {
    return (
        <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-sm text-gray-500">Total Analisis</div>
            <div className="text-2xl font-bold">4</div>
            </div>
            <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-sm text-gray-500">Status Valid</div>
            <div className="text-2xl font-bold text-green-600">100%</div>
            </div>
            <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-sm text-gray-500">Reliabilitas</div>
            <div className="text-2xl font-bold text-blue-600">Tinggi</div>
            </div>
            <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-sm text-gray-500">Update Terakhir</div>
            <div className="text-lg font-bold">Hari Ini</div>
            </div>
        </div>

        {/* Analysis Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analysisItems.map((item) => (
            <Link
                key={item.href}
                href={item.href}
                className={`${item.color} border rounded-lg p-6 hover:shadow-md transition-shadow`}
            >
                <div className="flex items-start gap-4">
                <div className="text-3xl">{item.icon}</div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.title}
                    </h3>
                    <p className="text-gray-600">{item.description}</p>
                    <div className="mt-4 text-blue-600 text-sm font-medium flex items-center">
                    Lihat Analisis
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    </div>
                </div>
                </div>
            </Link>
            ))}
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 p-6 rounded-lg border">
            <h3 className="font-semibold text-gray-900 mb-3">Petunjuk Analisis:</h3>
            <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
                <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Pastikan data survei sudah lengkap sebelum melakukan analisis
            </li>
            <li className="flex items-start">
                <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Analisis EUCS akan otomatis terhitung setelah survei selesai
            </li>
            <li className="flex items-start">
                <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Hasil analisis dapat diekspor untuk keperluan laporan
            </li>
            </ul>
        </div>
        </div>
    )
    }