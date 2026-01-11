import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function SurveysPage() {
  const surveys = await prisma.survey.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      respondent: true,
      answers: true,
      analysis: true
    }
  })

  const stats = {
    total: surveys.length,
    completed: surveys.filter(s => s.completed).length,
    inProgress: surveys.filter(s => !s.completed).length,
    avgScore: surveys.filter(s => s.analysis)
      .reduce((sum, s) => sum + (s.analysis?.totalScore || 0), 0) / 
      (surveys.filter(s => s.analysis).length || 1)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Survey</h1>
          <p className="text-gray-600">Kelola kuesioner penelitian EUCS</p>
        </div>
        <Link
          href="/surveys/create"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          + Survey Baru
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Total Survey</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Selesai</p>
          <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Dalam Proses</p>
          <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Rata-rata Skor</p>
          <p className="text-2xl font-bold text-gray-900">{stats.avgScore.toFixed(1)}</p>
          <p className="text-xs text-gray-500">/5</p>
        </div>
      </div>

      {/* Surveys Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responden</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jawaban</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {surveys.map((survey) => (
                <tr key={survey.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{survey.respondent.name}</p>
                      <p className="text-sm text-gray-500">
                        {survey.respondent.age} tahun • {survey.respondent.occupation}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-gray-900">
                        {survey.createdAt.toLocaleDateString('id-ID')}
                      </p>
                      {survey.completedAt && (
                        <p className="text-sm text-gray-500">
                          Selesai: {survey.completedAt.toLocaleDateString('id-ID')}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      survey.completed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {survey.completed ? 'Selesai' : 'Dalam Proses'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">
                      {survey.answers.length} / 27 pertanyaan
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${(survey.answers.length / 27) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">
                      {survey.analysis?.totalScore?.toFixed(1) || '-'}
                    </p>
                    <p className="text-sm text-gray-500">/5</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      {survey.completed ? (
                        <>
                          <Link
                            href={`/analysis/eucs?surveyId=${survey.id}`}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                          >
                            Analisis
                          </Link>
                          <Link
                            href={`/surveys/${survey.id}`}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                          >
                            Detail
                          </Link>
                        </>
                      ) : (
                        <Link
                          href={`/surveys/${survey.id}`}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                        >
                          Lanjutkan
                        </Link>
                      )}
                      <button className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200">
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}