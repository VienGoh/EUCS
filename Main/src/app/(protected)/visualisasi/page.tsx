// app/(protected)/visualisasi/page.tsx
import DashboardHeader from '@/components/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { prisma } from '@/lib/prisma';
import PlatformChart from '@/components/charts/platform-chart';
import GenderChart from '@/components/charts/gender-chart';
import SUSScoreDistribution from '@/components/SUSScoreDistribution';
import PlatformComparisonChart from '@/components/PlatformComparisonChart';
import ClientActions from './ClientActions';

async function getVisualizationData() {
  // Data platform
  const platforms = await prisma.platform.findMany({
    include: { 
      responden: {
        include: {
          taskResults: true,
          susAnswers: {
            include: { question: true }
          }
        }
      }
    }
  });

  const platformData = platforms.map(p => ({
    name: p.name,
    jumlah: p.responden.length,
    fill: p.name === "Shopee" ? "#FF6B35" : "#00A8E8"
  }));

  // Data gender
  const respondenGender = await prisma.responden.groupBy({
    by: ['jenisKelamin'],
    _count: { id: true }
  });

  const genderData = respondenGender.map(g => ({
    name: g.jenisKelamin,
    value: g._count.id,
    fill: g.jenisKelamin === "Laki-laki" ? "#3B82F6" : "#EC4899"
  }));

  // Data task performance
  const tasks = await prisma.task.findMany({
    include: {
      taskResults: {
        select: { 
          success: true, 
          timeOnTask: true, 
          errorCount: true,
          responden: {
            select: {
              platform: true
            }
          }
        }
      }
    }
  });

  const taskPerformance = tasks.map(task => {
    const results = task.taskResults;
    const total = results.length;
    const success = results.filter(r => r.success).length;
    const avgTime = total === 0 ? 0 : results.reduce((sum, r) => sum + r.timeOnTask, 0) / total;
    const avgError = total === 0 ? 0 : results.reduce((sum, r) => sum + r.errorCount, 0) / total;

    return {
      task: task.namaTask,
      successRate: total === 0 ? 0 : Math.round((success / total) * 100),
      avgTime: Math.round(avgTime),
      avgError: avgError.toFixed(1)
    };
  });

  // Get platforms for filter
  const platformsFilter = await prisma.platform.findMany({
    select: {
      id: true,
      name: true
    }
  });

  return {
    platformData,
    genderData,
    taskPerformance,
    platformsFilter
  };
}

export default async function VisualisasiPage() {
  const { platformData, genderData, taskPerformance, platformsFilter } = await getVisualizationData();

  // Hitung statistik ringkasan
  const totalResponden = platformData.reduce((sum, p) => sum + p.jumlah, 0);
  const avgSuccessRate = taskPerformance.length > 0 
    ? Math.round(taskPerformance.reduce((sum, t) => sum + t.successRate, 0) / taskPerformance.length)
    : 0;
  const avgCompletionTime = taskPerformance.length > 0
    ? Math.round(taskPerformance.reduce((sum, t) => sum + t.avgTime, 0) / taskPerformance.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title="Visualisasi Hasil Evaluasi UX"
        subtitle="Analisis mendalam data usability testing dari Shopee dan TikTok Shop"
      >
        <ClientActions 
          platformData={platformData}
          genderData={genderData}
          taskPerformance={taskPerformance}
          totalResponden={totalResponden}
          avgSuccessRate={avgSuccessRate}
          avgCompletionTime={avgCompletionTime}
          platformsFilter={platformsFilter}
        />
      </DashboardHeader>

      <div className="p-6">
        {/* Statistik Ringkasan */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-gray-900">{totalResponden}</div>
              <div className="text-sm text-gray-500 mt-1">Total Responden</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-green-600">{avgSuccessRate}%</div>
              <div className="text-sm text-gray-500 mt-1">Success Rate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-blue-600">
                78.2 {/* Contoh data, nanti bisa diambil dari API */}
              </div>
              <div className="text-sm text-gray-500 mt-1">Avg SUS Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-purple-600">{avgCompletionTime}s</div>
              <div className="text-sm text-gray-500 mt-1">Avg Completion Time</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Platform Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2 bg-blue-500"></div>
                Distribusi Platform
              </CardTitle>
            </CardHeader>
            <CardContent>
              {platformData.length > 0 ? (
                <PlatformChart data={platformData} />
              ) : (
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Tidak ada data platform</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gender Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2 bg-pink-500"></div>
                Distribusi Jenis Kelamin
              </CardTitle>
            </CardHeader>
            <CardContent>
              {genderData.length > 0 ? (
                <GenderChart data={genderData} />
              ) : (
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Tidak ada data gender</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Task Performance Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2 bg-green-500"></div>
              Performance per Task
            </CardTitle>
          </CardHeader>
          <CardContent>
            {taskPerformance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TASK</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SUCCESS RATE</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AVG TIME (s)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AVG ERRORS</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {taskPerformance.map((task, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {task.task}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-32 bg-gray-200 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${
                                  task.successRate >= 80 ? 'bg-green-500' : 
                                  task.successRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${task.successRate}%` }}
                              ></div>
                            </div>
                            <span className="ml-3 text-sm font-medium text-gray-700">
                              {task.successRate}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                              <span className="text-xs font-bold text-blue-600">⏱️</span>
                            </div>
                            {task.avgTime} detik
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mr-2">
                              <span className="text-xs font-bold text-red-600">⚠️</span>
                            </div>
                            {task.avgError}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Tidak ada data task performance
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SUS Score Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2 bg-purple-500"></div>
                Distribusi Skor SUS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SUSScoreDistribution />
            </CardContent>
          </Card>

          {/* Platform Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2 bg-orange-500"></div>
                Perbandingan Shopee vs TikTok Shop
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PlatformComparisonChart />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}