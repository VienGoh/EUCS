// app/usability-testing/page.tsx
"use client";

import { useState, useEffect } from "react";
import TaskSuccessChart from "@/components/charts/task-success-chart";
import TimeDistributionChart from "@/components/charts/time-distribution-chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
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
  const [error, setError] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const url = selectedPlatform === "all" 
        ? "/api/usability-testing/stats"
        : `/api/usability-testing/stats?platformId=${selectedPlatform}`;
      
      const res = await fetch(url);
      const result = await res.json();
      
      if (result.success) {
        setPlatformData(result.data.platformData);
        setTaskPerformance(result.data.taskPerformance);
        setTimeDistribution(result.data.timeDistribution);
        setErrorAnalysis(result.data.errorAnalysis);
        setOverallStats({
          totalTasks: result.data.totalTasks,
          totalSuccess: result.data.totalSuccess,
          overallSuccessRate: result.data.overallSuccessRate
        });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Gagal memuat data usability testing");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPlatform]);

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
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Usability Testing</h1>
            <p className="text-gray-600 mt-2">
              Analisis performa pengguna dalam menyelesaikan tugas pada platform e-commerce
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Platform</option>
              <option value="1">Shopee</option>
              <option value="2">TikTok Shop</option>
            </select>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Export Laporan
            </button>
          </div>
        </div>
      </div>

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

      {/* Task Performance Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Task Performance</h2>
          <div className="text-sm text-gray-600">
            {taskPerformance.length} tugas diuji
          </div>
        </div>
        
        {taskPerformance.length > 0 ? (
          <TaskSuccessChart data={taskPerformance} />
        ) : (
          <div className="text-center py-12 text-gray-500">
            Tidak ada data task performance
          </div>
        )}
      </div>

      {/* Task Details Table */}
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
                    <div className="flex space-x-2 mt-1">
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
                      <div className={`w-16 bg-gray-200 rounded-full h-2 mr-3 ${
                        task.avgErrors === 0 ? 'bg-green-200' :
                        task.avgErrors <= 1 ? 'bg-yellow-200' : 'bg-red-200'
                      }`}>
                        <div 
                          className="h-2 rounded-full bg-gray-400"
                          style={{ width: `${Math.min(task.avgErrors * 20, 100)}%` }}
                        ></div>
                      </div>
                      <span className="font-medium">{task.avgErrors}</span>
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

      {/* Time Distribution & Error Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Time Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Distribusi Waktu Penyelesaian</h2>
          {timeDistribution.length > 0 ? (
            <TimeDistributionChart data={timeDistribution} />
          ) : (
            <div className="text-center py-12 text-gray-500">
              Tidak ada data distribusi waktu
            </div>
          )}
        </div>

        {/* Error Analysis */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Analisis Kesalahan</h2>
          {errorAnalysis.length > 0 ? (
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
          ) : (
            <div className="text-center py-12 text-gray-500">
              Tidak ada data analisis kesalahan
            </div>
          )}
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Insights & Rekomendasi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Task dengan Success Rate Tertinggi</h3>
              {taskPerformance.length > 0 && (() => {
                const bestTask = taskPerformance.reduce((prev, current) => 
                  prev.successRate > current.successRate ? prev : current
                );
                return (
                  <div>
                    <p className="text-blue-700">{bestTask.taskName}</p>
                    <p className="text-sm text-blue-600">Success Rate: {bestTask.successRate}%</p>
                  </div>
                );
              })()}
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Platform Terbaik</h3>
              {platformData.length > 0 && (() => {
                const bestPlatform = platformData.reduce((prev, current) => 
                  prev.successRate > current.successRate ? prev : current
                );
                return (
                  <div>
                    <p className="text-green-700">{bestPlatform.platform}</p>
                    <p className="text-sm text-green-600">
                      Success Rate: {bestPlatform.successRate}% • 
                      Avg Time: {bestPlatform.avgTime}s • 
                      Avg Errors: {bestPlatform.avgErrors}
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Perlu Perhatian</h3>
              {taskPerformance.length > 0 && (() => {
                const worstTask = taskPerformance.reduce((prev, current) => 
                  prev.successRate < current.successRate ? prev : current
                );
                return (
                  <div>
                    <p className="text-yellow-700">{worstTask.taskName}</p>
                    <p className="text-sm text-yellow-600">
                      Success Rate: {worstTask.successRate}% • 
                      Rata-rata error: {worstTask.avgErrors}
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      Rekomendasi: Perbaiki alur atau sederhanakan proses
                    </p>
                  </div>
                );
              })()}
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">Area Perbaikan</h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Fokus pada task dengan success rate di bawah 70%</li>
                <li>• Optimasi waktu untuk task dengan avg time {'>'} 120s</li>
                <li>• Reduksi error pada task dengan avg errors {'>'} 2</li>
                <li>• Pertimbangkan redesign untuk task yang paling sulit</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}