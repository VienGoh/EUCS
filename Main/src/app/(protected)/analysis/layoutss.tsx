export default function AnalysisLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analisis Data</h1>
        <p className="text-gray-600">Analisis statistik hasil penelitian EUCS</p>
      </div>
      {children}
    </div>
  )
}