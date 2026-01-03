// app/dashboard/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PlatformChart from "@/components/charts/platform-chart";
import GenderChart from "@/components/charts/gender-chart";

export default async function DashboardPage() {
  try {
    // ======================
    // DATA UTAMA
    // ======================
    const totalResponden = await prisma.responden.count();
    const totalTask = await prisma.taskResult.count();
    
    // PERBAIKAN: Gunakan where: { success: true } dengan nullable field
    const successTask = await prisma.taskResult.count({
      where: { 
        success: true  // Field success sekarang nullable
      },
    });
    
    const successRate = totalTask === 0 ? 0 : Math.round((successTask / totalTask) * 100);

    // Data platform
    const platforms = await prisma.platform.findMany({
      include: {
        responden: true
      }
    });

    const platformData = platforms.map(p => ({
      name: p.name,
      jumlah: p.responden.length,
      fill: p.name === "Shopee" ? "#FF6B35" : "#00A8E8"
    }));

    // Data jenis kelamin
    const respondenGender = await prisma.responden.groupBy({
      by: ['jenisKelamin'],
      _count: {
        id: true
      }
    });

    const genderData = respondenGender.map(g => ({
      name: g.jenisKelamin,
      value: g._count.id,
      fill: g.jenisKelamin === "Laki-laki" ? "#3B82F6" : "#EC4899"
    }));

    // ======================
    // SUS SCORE CALCULATION - PERBAIKAN: Gunakan SUSAnswer (huruf besar)
    // ======================
    const answers = await prisma.sUSAnswer.findMany({
      include: { question: true },
    });

    const susPerResponden: Record<number, number> = {};

    for (const ans of answers) {
      const base = ans.question.isPositive ? ans.score - 1 : 5 - ans.score;
      susPerResponden[ans.respondenId] = (susPerResponden[ans.respondenId] || 0) + base;
    }

    const susValues = Object.values(susPerResponden).map((total) => total * 2.5);
    const avgSUS = susValues.length === 0 ? 0 : Math.round(susValues.reduce((a, b) => a + b, 0) / susValues.length);

    // Kategori SUS
    let susCategory = "";
    let susColor = "";
    if (avgSUS >= 85) {
      susCategory = "Excellent";
      susColor = "text-green-600";
    } else if (avgSUS >= 70) {
      susCategory = "Good";
      susColor = "text-blue-600";
    } else if (avgSUS >= 50) {
      susCategory = "OK";
      susColor = "text-yellow-600";
    } else {
      susCategory = "Poor";
      susColor = "text-red-600";
    }

    // ======================
    // PERFORMANCE TASK - PERBAIKAN: Handle nullable success field
    // ======================
    const tasks = await prisma.task.findMany({
      include: {
        taskResults: {
          select: {
            success: true,
            timeOnTask: true,
            errorCount: true
          }
        }
      }
    });

    const taskPerformance = tasks.map(task => {
      const results = task.taskResults;
      const total = results.length;
      
      // PERBAIKAN: Filter success yang tidak null dan true
      const successResults = results.filter(r => r.success === true);
      const success = successResults.length;
      
      const avgTime = total === 0 ? 0 : results.reduce((sum, r) => sum + r.timeOnTask, 0) / total;
      const avgError = total === 0 ? 0 : results.reduce((sum, r) => sum + r.errorCount, 0) / total;

      return {
        task: task.namaTask,
        successRate: total === 0 ? 0 : Math.round((success / total) * 100),
        avgTime: Math.round(avgTime),
        avgError: avgError.toFixed(1)
      };
    });

    // ======================
    // PERHITUNGAN TAMBAHAN UNTUK VALIDASI
    // ======================
    // Hitung success rate dari task performance (untuk konfirmasi)
    const avgTaskSuccessRate = taskPerformance.length > 0 
      ? Math.round(taskPerformance.reduce((sum, t) => sum + t.successRate, 0) / taskPerformance.length)
      : 0;

    // Hitung rata-rata completion time
    const avgCompletionTime = taskPerformance.length > 0
      ? Math.round(taskPerformance.reduce((sum, t) => sum + t.avgTime, 0) / taskPerformance.length)
      : 0;

    // Debug log ke console server
    console.log("=== DASHBOARD METRICS ===");
    console.log("Total Responden:", totalResponden);
    console.log("Total Tasks:", totalTask);
    console.log("Success Tasks:", successTask);
    console.log("Success Rate Global:", successRate, "%");
    console.log("Average Task Success Rate:", avgTaskSuccessRate, "%");
    console.log("Avg Completion Time:", avgCompletionTime, "s");
    console.log("Avg SUS:", avgSUS);
    console.log("Task Count:", taskPerformance.length);
    console.log("========================");

    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard Evaluasi User Experience
          </h1>
          <p className="text-gray-600 mt-2">
            Analisis Usability Testing untuk Shopee dan TikTok Shop
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.67 3.137a10.05 10.05 0 01-.67 3.137v0" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Responden</p>
                <p className="text-2xl font-bold text-gray-800">{totalResponden}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Success Rate</p>
                <p className="text-2xl font-bold text-gray-800">{successRate}%</p>
                <p className="text-xs text-gray-500">
                  {successTask} dari {totalTask} tasks
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Average SUS Score</p>
                <p className="text-2xl font-bold text-gray-800">{avgSUS}</p>
                <p className={`text-sm font-medium ${susColor}`}>{susCategory}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-orange-100">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Avg Completion Time</p>
                <p className="text-2xl font-bold text-gray-800">{avgCompletionTime}s</p>
                <p className="text-xs text-gray-500">
                  dari {totalTask} tasks
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Platform Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Distribusi Platform</h2>
            <PlatformChart data={platformData} />
            <div className="mt-4 text-sm text-gray-600">
              <p>• Shopee: {platformData.find(p => p.name === "Shopee")?.jumlah || 0} responden</p>
              <p>• TikTok Shop: {platformData.find(p => p.name === "TikTok Shop")?.jumlah || 0} responden</p>
            </div>
          </div>

          {/* Gender Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Distribusi Jenis Kelamin</h2>
            <GenderChart data={genderData} />
            <div className="mt-4 text-sm text-gray-600">
              {genderData.map(g => (
                <p key={g.name}>• {g.name}: {g.value} responden</p>
              ))}
            </div>
          </div>
        </div>

        {/* Task Performance Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Performance per Task</h2>
            <div className="text-sm text-gray-500">
              Rata-rata: {avgTaskSuccessRate}% success, {avgCompletionTime}s
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Time (s)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Errors</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {taskPerformance.map((task, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {task.task}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              task.successRate >= 80 ? 'bg-green-500' : 
                              task.successRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${task.successRate}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-700">{task.successRate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {task.avgTime} detik
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {task.avgError}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/responden"
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-white/20">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.67 3.137a10.05 10.05 0 01-.67 3.137v0" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold">Data Responden</h3>
                <p className="opacity-90 mt-1">Kelola dan lihat data responden penelitian</p>
              </div>
            </div>
          </Link>

          <Link
            href="/usability-testing"
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-white/20">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold">Usability Testing</h3>
                <p className="opacity-90 mt-1">Hasil pengujian dan task performance</p>
              </div>
            </div>
          </Link>

          <Link
            href="/visualisasi"
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-white/20">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold">Visualisasi Hasil</h3>
                <p className="opacity-90 mt-1">Chart dan grafik analisis mendalam</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Info Konsistensi */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">📊 Info Konsistensi Data</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Success Rate Global: <strong>{successRate}%</strong> (dari semua task)</p>
            <p>• Rata-rata Success per Task: <strong>{avgTaskSuccessRate}%</strong></p>
            <p>• Perbedaan: <strong>{Math.abs(successRate - avgTaskSuccessRate)}%</strong></p>
            <p>• Avg SUS Score: <strong>{avgSUS}</strong> ({susCategory})</p>
            <p className="text-xs">Catatan: Perbedaan kecil wajar karena pembulatan</p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading dashboard:", error);
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard Evaluasi User Experience
          </h1>
          <p className="text-gray-600 mt-2">
            Analisis Usability Testing untuk Shopee dan TikTok Shop
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-red-700">{error.message}</p>
          <p className="text-red-600 mt-2">Silakan refresh halaman atau hubungi administrator.</p>
        </div>
      </div>
    );
  }
}