// app/usability-testing/page.tsx
"use client";

import { useState, useEffect } from "react";
import TaskSuccessChart from "@/components/charts/task-success-chart";
import TimeDistributionChart from "@/components/charts/time-distribution-chart";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface PlatformData {
  platform: string;
  totalResponden: number;
  totalTasks: number;
  successTasks: number;
  successRate: number;
  avgTime: number;
  avgErrors: number;
  color: string;
}

interface TaskPerformance {
  taskId: number;
  taskName: string;
  description: string;
  totalAttempts: number;
  successRate: number;
  avgTime: number;
  avgErrors: number;
  platformBreakdown: Array<{
    platform: string;
    total: number;
    successRate: number;
    color: string;
  }>;
}

interface TimeDistribution {
  task: string;
  "Sangat Cepat (< 30s)": number;
  "Cepat (30-60s)": number;
  "Sedang (60-120s)": number;
  "Lambat (120-180s)": number;
  "Sangat Lambat (> 180s)": number;
}

interface ErrorAnalysis {
  task: string;
  "0 Error": number;
  "1-2 Error": number;
  "3-5 Error": number;
  ">5 Error": number;
}

interface Platform {
  id: number;
  name: string;
}

export default function UsabilityTestingPage() {
  const [platformData, setPlatformData] = useState<PlatformData[]>([]);
  const [taskPerformance, setTaskPerformance] = useState<TaskPerformance[]>([]);
  const [timeDistribution, setTimeDistribution] = useState<TimeDistribution[]>([]);
  const [errorAnalysis, setErrorAnalysis] = useState<ErrorAnalysis[]>([]);
  const [overallStats, setOverallStats] = useState({
    totalTasks: 0,
    totalSuccess: 0,
    overallSuccessRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [platforms, setPlatforms] = useState<Platform[]>([]);

  // Fetch platforms untuk dropdown
  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const res = await fetch("/api/platform");
        const result = await res.json();
        if (result.success) {
          setPlatforms(result.data);
        }
      } catch (err) {
        console.error("Error fetching platforms:", err);
      }
    };
    fetchPlatforms();
  }, []);

  const fetchData = async (platformFilter: string = selectedPlatform) => {
    try {
      setLoading(true);
      setError("");
      
      // Build query parameters
      const params = new URLSearchParams();
      if (platformFilter !== "all") {
        params.append("platformId", platformFilter);
      }
      
      const url = params.toString() 
        ? `/api/usability-testing/stats?${params.toString()}`
        : "/api/usability-testing/stats";
      
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const result = await res.json();
      
      if (result.success) {
        setPlatformData(result.data.platformData || []);
        setTaskPerformance(result.data.taskPerformance || []);
        setTimeDistribution(result.data.timeDistribution || []);
        setErrorAnalysis(result.data.errorAnalysis || []);
        setOverallStats({
          totalTasks: result.data.totalTasks || 0,
          totalSuccess: result.data.totalSuccess || 0,
          overallSuccessRate: result.data.overallSuccessRate || 0
        });
      } else {
        setError(result.error || "Gagal memuat data");
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "Gagal memuat data usability testing");
      // Reset data jika error
      setPlatformData([]);
      setTaskPerformance([]);
      setTimeDistribution([]);
      setErrorAnalysis([]);
      setOverallStats({
        totalTasks: 0,
        totalSuccess: 0,
        overallSuccessRate: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPlatform]);

  const handleExport = async () => {
    try {
      setExportLoading(true);
      
      // Ambil data lengkap untuk export
      const exportData = {
        metadata: {
          title: "Laporan Usability Testing",
          generatedAt: new Date().toISOString(),
          filter: selectedPlatform === "all" ? "Semua Platform" : 
                  platforms.find(p => p.id.toString() === selectedPlatform)?.name || selectedPlatform
        },
        summary: {
          ...overallStats,
          totalPlatforms: platformData.length,
          totalTasksAnalyzed: taskPerformance.reduce((sum, t) => sum + t.totalAttempts, 0)
        },
        platformComparison: platformData,
        taskPerformance: taskPerformance.map(t => ({
          task: t.taskName,
          description: t.description,
          totalAttempts: t.totalAttempts,
          successRate: t.successRate,
          avgTimeSeconds: t.avgTime,
          avgErrors: t.avgErrors,
          platformBreakdown: t.platformBreakdown
        })),
        timeDistribution: timeDistribution,
        errorAnalysis: errorAnalysis,
        insights: generateInsights()
      };

      // Buat workbook Excel
      const workbook = XLSX.utils.book_new();

      // Sheet 1: Summary
      const summarySheet = XLSX.utils.json_to_sheet([
        {
          "Judul Laporan": exportData.metadata.title,
          "Waktu Generate": new Date(exportData.metadata.generatedAt).toLocaleString("id-ID"),
          "Filter": exportData.metadata.filter
        },
        {},
        {
          "Metrik": "Nilai",
          "Total Tugas": exportData.summary.totalTasks,
          "Tugas Berhasil": exportData.summary.totalSuccess,
          "Success Rate": `${exportData.summary.overallSuccessRate.toFixed(2)}%`,
          "Platform Dianalisis": exportData.summary.totalPlatforms,
          "Total Attempts": exportData.summary.totalTasksAnalyzed
        }
      ]);
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Ringkasan");

      // Sheet 2: Platform Comparison
      const platformSheetData = platformData.map(p => ({
        "Platform": p.platform,
        "Total Responden": p.totalResponden,
        "Total Tugas": p.totalTasks,
        "Tugas Berhasil": p.successTasks,
        "Success Rate (%)": p.successRate,
        "Rata-rata Waktu (detik)": p.avgTime,
        "Rata-rata Error": p.avgErrors
      }));
      const platformSheet = XLSX.utils.json_to_sheet(platformSheetData);
      XLSX.utils.book_append_sheet(workbook, platformSheet, "Perbandingan Platform");

      // Sheet 3: Task Performance
      const taskSheetData = taskPerformance.map(t => ({
        "Task": t.taskName,
        "Deskripsi": t.description,
        "Total Attempts": t.totalAttempts,
        "Success Rate (%)": t.successRate,
        "Rata-rata Waktu (detik)": t.avgTime,
        "Rata-rata Error": t.avgErrors
      }));
      const taskSheet = XLSX.utils.json_to_sheet(taskSheetData);
      XLSX.utils.book_append_sheet(workbook, taskSheet, "Performa Task");

      // Sheet 4: Time Distribution
      const timeSheet = XLSX.utils.json_to_sheet(timeDistribution);
      XLSX.utils.book_append_sheet(workbook, timeSheet, "Distribusi Waktu");

      // Sheet 5: Error Analysis
      const errorSheet = XLSX.utils.json_to_sheet(errorAnalysis);
      XLSX.utils.book_append_sheet(workbook, errorSheet, "Analisis Error");

      // Sheet 6: Insights
      const insightsData = exportData.insights.map((insight: any, index: number) => ({
        "No": index + 1,
        "Kategori": insight.category,
        "Deskripsi": insight.description,
        "Rekomendasi": insight.recommendation
      }));
      const insightsSheet = XLSX.utils.json_to_sheet(insightsData);
      XLSX.utils.book_append_sheet(workbook, insightsSheet, "Insights & Rekomendasi");

      // Export ke file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const filename = `usability_testing_report_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(blob, filename);
      
    } catch (err) {
      console.error("Error exporting data:", err);
      alert("Gagal mengekspor data. Silakan coba lagi.");
    } finally {
      setExportLoading(false);
    }
  };

  const generateInsights = () => {
    const insights = [];
    
    // Platform insights
    if (platformData.length > 0) {
      const bestPlatform = platformData.reduce((prev, current) => 
        prev.successRate > current.successRate ? prev : current
      );
      const worstPlatform = platformData.reduce((prev, current) => 
        prev.successRate < current.successRate ? prev : current
      );
      
      insights.push({
        category: "Platform Terbaik",
        description: `${bestPlatform.platform} memiliki success rate tertinggi (${bestPlatform.successRate}%)`,
        recommendation: "Pertimbangkan untuk mengadopsi best practice dari platform ini"
      });
      
      insights.push({
        category: "Platform Perlu Perbaikan",
        description: `${worstPlatform.platform} memiliki success rate terendah (${worstPlatform.successRate}%)`,
        recommendation: "Fokus pada perbaikan UX di platform ini"
      });
    }
    
    // Task insights
    if (taskPerformance.length > 0) {
      const worstTasks = taskPerformance
        .filter(t => t.successRate < 70)
        .sort((a, b) => a.successRate - b.successRate)
        .slice(0, 3);
      
      worstTasks.forEach(task => {
        insights.push({
          category: "Task Bermasalah",
          description: `${task.taskName} memiliki success rate rendah (${task.successRate}%)`,
          recommendation: "Review alur task dan perbaiki pain points"
        });
      });
      
      const slowTasks = taskPerformance
        .filter(t => t.avgTime > 120)
        .sort((a, b) => b.avgTime - a.avgTime)
        .slice(0, 3);
      
      slowTasks.forEach(task => {
        insights.push({
          category: "Task Lambat",
          description: `${task.taskName} membutuhkan waktu rata-rata ${task.avgTime} detik`,
          recommendation: "Sederhanakan proses atau tambahkan panduan"
        });
      });
    }
    
    return insights;
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPlatform(e.target.value);
  };

  const successRateColors = (rate: number) => {
    if (rate >= 90) return "bg-green-500";
    if (rate >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Memuat data usability testing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Usability Testing</h1>
            <p className="text-gray-600 mt-2">
              Analisis performa pengguna dalam menyelesaikan tugas pada platform e-commerce
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Filter Platform:</label>
              <select
                value={selectedPlatform}
                onChange={handleFilterChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
              >
                <option value="all">Semua Platform</option>
                {platforms.map((platform) => (
                  <option key={platform.id} value={platform.id}>
                    {platform.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleExport}
              disabled={exportLoading || platformData.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {exportLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Mengekspor...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Laporan (Excel)
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={() => fetchData()}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Coba muat ulang
          </button>
        </div>
      )}

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Overall Success Rate</p>
              <p className="text-3xl font-bold text-gray-800">
                {overallStats.overallSuccessRate.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${successRateColors(overallStats.overallSuccessRate)}`}
                style={{ width: `${Math.min(overallStats.overallSuccessRate, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {overallStats.totalSuccess} dari {overallStats.totalTasks} tugas berhasil diselesaikan
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Rata-rata Waktu</p>
              <p className="text-3xl font-bold text-gray-800">
                {taskPerformance.length > 0 
                  ? Math.round(taskPerformance.reduce((sum, t) => sum + t.avgTime, 0) / taskPerformance.length)
                  : 0}s
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Rata-rata waktu penyelesaian semua tugas
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-100">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Rata-rata Error</p>
              <p className="text-3xl font-bold text-gray-800">
                {taskPerformance.length > 0 
                  ? (taskPerformance.reduce((sum, t) => sum + t.avgErrors, 0) / taskPerformance.length).toFixed(1)
                  : "0.0"}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Rata-rata kesalahan per tugas
          </p>
        </div>
      </div>

      {/* Platform Comparison */}
      {platformData.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Perbandingan Platform</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformData.map((platform) => (
              <div key={platform.platform} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">{platform.platform}</h3>
                  <span 
                    className="px-2 py-1 text-xs font-medium rounded-full"
                    style={{ 
                      backgroundColor: `${platform.color}20`,
                      color: platform.color
                    }}
                  >
                    {platform.totalResponden} responden
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Success Rate</span>
                      <span className="font-medium">{platform.successRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${successRateColors(platform.successRate)}`}
                        style={{ width: `${platform.successRate}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500">Avg Time</p>
                      <p className="font-semibold">{platform.avgTime}s</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500">Avg Errors</p>
                      <p className="font-semibold">{platform.avgErrors}</p>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    {platform.successTasks} dari {platform.totalTasks} tugas berhasil
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Performance Chart */}
      {taskPerformance.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Task Performance</h2>
            <div className="text-sm text-gray-600">
              {taskPerformance.length} tugas diuji
            </div>
          </div>
          <TaskSuccessChart data={taskPerformance} />
        </div>
      )}

      {/* Task Details Table */}
      {taskPerformance.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Detail Performa per Task</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Errors</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Attempts</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {taskPerformance.map((task) => (
                  <tr key={task.taskId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{task.taskName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs">{task.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className={`h-2 rounded-full ${successRateColors(task.successRate)}`}
                            style={{ width: `${task.successRate}%` }}
                          ></div>
                        </div>
                        <span className="font-medium">{task.successRate}%</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {task.platformBreakdown.map((pb) => (
                          <span 
                            key={pb.platform}
                            className="text-xs px-2 py-0.5 rounded"
                            style={{ 
                              backgroundColor: `${pb.color}20`,
                              color: pb.color
                            }}
                          >
                            {pb.platform}: {pb.successRate}%
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{task.avgTime}s</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`w-16 bg-gray-200 rounded-full h-2 mr-3`}>
                          <div 
                            className={`h-2 rounded-full ${
                              task.avgErrors === 0 ? 'bg-green-500' :
                              task.avgErrors <= 1 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(task.avgErrors * 20, 100)}%` }}
                          ></div>
                        </div>
                        <span className="font-medium">{task.avgErrors.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{task.totalAttempts}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Time Distribution & Error Analysis */}
      {(timeDistribution.length > 0 || errorAnalysis.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Time Distribution */}
          {timeDistribution.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Distribusi Waktu Penyelesaian</h2>
              <TimeDistributionChart data={timeDistribution} />
            </div>
          )}

          {/* Error Analysis */}
          {errorAnalysis.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Analisis Kesalahan</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={errorAnalysis}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="task" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="0 Error" name="0 Error" fill="#10B981" stackId="a" />
                    <Bar dataKey="1-2 Error" name="1-2 Error" fill="#F59E0B" stackId="a" />
                    <Bar dataKey="3-5 Error" name="3-5 Error" fill="#EF4444" stackId="a" />
                    <Bar dataKey=">5 Error" name=">5 Error" fill="#7C3AED" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Data Message */}
      {!loading && platformData.length === 0 && (
        <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data</h3>
          <p className="text-gray-600 mb-4">
            {selectedPlatform === "all" 
              ? "Belum ada data usability testing yang tersedia."
              : `Tidak ada data untuk platform yang dipilih dengan filter "${selectedPlatform}".`}
          </p>
          {selectedPlatform !== "all" && (
            <button
              onClick={() => setSelectedPlatform("all")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Lihat semua data
            </button>
          )}
        </div>
      )}
    </div>
  );
}