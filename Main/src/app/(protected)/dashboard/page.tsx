import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Users, FileText, CheckCircle, TrendingUp, Target, Shield, Layout, Clock, ThumbsUp } from 'lucide-react'

export default async function DashboardPage() {
  // Fetch data for dashboard
  const [
    totalRespondents,
    totalSurveys,
    completedSurveys,
    respondentsByGender,
    recentSurveys
  ] = await Promise.all([
    prisma.respondent.count(),
    prisma.survey.count(),
    prisma.survey.count({ where: { completed: true } }),
    prisma.respondent.groupBy({
      by: ['gender'],
      _count: true
    }),
    prisma.survey.findMany({
      take: 5,
      where: { completed: true },
      orderBy: { completedAt: 'desc' },
      include: {
        respondent: true,
        analysis: true
      }
    })
  ])

  // Calculate average scores
  const allAnalyses = await prisma.analysis.findMany()
  const avgScores = {
    content: 0,
    accuracy: 0,
    format: 0,
    easeOfUse: 0,
    timeliness: 0,
    loyalty: 0
  }

  if (allAnalyses.length > 0) {
    avgScores.content = allAnalyses.reduce((sum, a) => sum + a.content, 0) / allAnalyses.length
    avgScores.accuracy = allAnalyses.reduce((sum, a) => sum + a.accuracy, 0) / allAnalyses.length
    avgScores.format = allAnalyses.reduce((sum, a) => sum + a.format, 0) / allAnalyses.length
    avgScores.easeOfUse = allAnalyses.reduce((sum, a) => sum + a.easeOfUse, 0) / allAnalyses.length
    avgScores.timeliness = allAnalyses.reduce((sum, a) => sum + a.timeliness, 0) / allAnalyses.length
    avgScores.loyalty = allAnalyses.reduce((sum, a) => sum + a.loyalty, 0) / allAnalyses.length
  }

  const completionRate = totalSurveys > 0 ? (completedSurveys / totalSurveys) * 100 : 0
  const maleCount = respondentsByGender.find(g => g.gender === 'Laki-laki')?._count || 0
  const femaleCount = respondentsByGender.find(g => g.gender === 'Perempuan')?._count || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Analisis EUCS</h1>
        <p className="text-gray-600 mt-2">Ringkasan hasil penelitian TikTok Shop</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Responden</p>
                <p className="text-2xl font-bold text-gray-900">{totalRespondents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{completionRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">{completedSurveys} dari {totalSurveys}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Gender Ratio</p>
                <p className="text-2xl font-bold text-gray-900">{maleCount}:{femaleCount}</p>
                <p className="text-xs text-gray-500">Laki : Perempuan</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-orange-100">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Avg Loyalty Score</p>
                <p className="text-2xl font-bold text-gray-900">{avgScores.loyalty.toFixed(1)}/5</p>
                <p className="text-xs text-gray-500">Skor Loyalitas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* EUCS Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Skor Rata-rata Dimensi EUCS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Content', score: avgScores.content, icon: Target, color: 'bg-blue-100 text-blue-600' },
              { name: 'Accuracy', score: avgScores.accuracy, icon: Shield, color: 'bg-green-100 text-green-600' },
              { name: 'Format', score: avgScores.format, icon: Layout, color: 'bg-purple-100 text-purple-600' },
              { name: 'EaseOfUse', score: avgScores.easeOfUse, icon: TrendingUp, color: 'bg-yellow-100 text-yellow-600' },
              { name: 'Timeliness', score: avgScores.timeliness, icon: Clock, color: 'bg-red-100 text-red-600' },
              { name: 'Loyalty', score: avgScores.loyalty, icon: ThumbsUp, color: 'bg-pink-100 text-pink-600' }
            ].map((dimension) => (
              <div key={dimension.name} className="text-center">
                <div className={`inline-flex p-3 rounded-lg ${dimension.color} mb-2`}>
                  <dimension.icon className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-gray-900">{dimension.name}</p>
                <p className="text-xl font-bold text-gray-900">{dimension.score.toFixed(1)}</p>
                <p className="text-xs text-gray-500">/5</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Surveys */}
      <Card>
        <CardHeader>
          <CardTitle>Survey Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Responden</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Tanggal</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Skor Total</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSurveys.map((survey) => (
                  <tr key={survey.id} className="border-b hover:bg-gray-50">
                    <td className="py-3">
                      <p className="font-medium text-gray-900">{survey.respondent.name}</p>
                      <p className="text-sm text-gray-500">{survey.respondent.email}</p>
                    </td>
                    <td className="py-3">
                      <p className="text-gray-900">
                        {survey.completedAt?.toLocaleDateString('id-ID')}
                      </p>
                    </td>
                    <td className="py-3">
                      <p className="font-bold text-gray-900">
                        {survey.analysis?.totalScore.toFixed(1) || 'N/A'}
                      </p>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        Selesai
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}