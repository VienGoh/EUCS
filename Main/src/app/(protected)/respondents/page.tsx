import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function RespondentsPage() {
  const respondents = await prisma.respondent.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      surveys: {
        where: { completed: true },
        include: { analysis: true }
      }
    }
  })

  const totalRespondents = await prisma.respondent.count()
  const completedSurveys = await prisma.survey.count({ where: { completed: true } })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Responden</h1>
          <p className="text-gray-600">Kelola data responden penelitian</p>
        </div>
        <Link
          href="/respondents/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Tambah Responden
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Total Responden</p>
          <p className="text-2xl font-bold text-gray-900">{totalRespondents}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Survey Selesai</p>
          <p className="text-2xl font-bold text-gray-900">{completedSurveys}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Completion Rate</p>
          <p className="text-2xl font-bold text-gray-900">
            {totalRespondents > 0 ? ((completedSurveys / totalRespondents) * 100).toFixed(1) : 0}%
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Demografi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Penggunaan TikTok</th>
                <th className="px6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Survey</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {respondents.map((respondent) => {
                const completed = respondent.surveys.filter(s => s.completed).length
                const total = respondent.surveys.length
                
                return (
                  <tr key={respondent.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{respondent.name}</p>
                        <p className="text-sm text-gray-500">{respondent.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-gray-900">{respondent.age} tahun</p>
                        <p className="text-sm text-gray-500">{respondent.gender} • {respondent.occupation}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 w-24">TikTok:</span>
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-blue-500"
                                style={{ width: `${(respondent.tiktokUsage / 5) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="ml-2 text-sm font-medium">{respondent.tiktokUsage}/5</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 w-24">TikTok Shop:</span>
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-green-500"
                                style={{ width: `${(respondent.tiktokShopUsage / 5) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="ml-2 text-sm font-medium">{respondent.tiktokShopUsage}/5</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-gray-900">{completed} dari {total} selesai</p>
                        {respondent.surveys[0]?.analysis && (
                          <p className="text-sm text-gray-500">
                            Skor: {respondent.surveys[0].analysis.totalScore.toFixed(1)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Link
                          href={`/surveys/create?respondentId=${respondent.id}`}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                        >
                          Survey
                        </Link>
                        <Link
                          href={`/respondents/${respondent.id}`}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                        >
                          Detail
                        </Link>
                        <button className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200">
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}