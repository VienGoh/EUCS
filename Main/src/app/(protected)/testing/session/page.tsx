"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Session {
  id: number;
  responden: {
    id: number;
    nama: string;
    platform: {
      name: string;
    };
  };
  startedAt: string;
  endedAt: string | null;
  duration: number;
  success: boolean;
}

export default function TestingSessionPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
  try {
    const res = await fetch("/api/testing/sessions");
    const data = await res.json();
    if (data.success) {
      setSessions(data.data);
    }
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 5000); // Refresh setiap 5 detik
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Testing Sessions</h1>
            <p className="text-gray-600 mt-2">
              Monitor responden yang sedang melakukan usability testing
            </p>
          </div>
          <Link
            href="/usability-testing"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Lihat Analisis
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Total Sessions</p>
          <p className="text-2xl font-bold text-gray-800">{sessions.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Sedang Testing</p>
          <p className="text-2xl font-bold text-gray-800">
            {sessions.filter(s => !s.endedAt).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Success Rate</p>
          <p className="text-2xl font-bold text-gray-800">
            {sessions.length > 0 
              ? Math.round((sessions.filter(s => s.success).length / sessions.length) * 100)
              : 0}%
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Avg Duration</p>
          <p className="text-2xl font-bold text-gray-800">
            {sessions.length > 0 
              ? formatDuration(Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length))
              : "0m 0s"}
          </p>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Memuat data sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Belum ada testing session</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responden
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Waktu Mulai
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durasi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hasil
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {session.responden.nama}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {session.responden.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        session.responden.platform.name === "Shopee" 
                          ? "bg-orange-100 text-orange-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {session.responden.platform.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(session.startedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{formatDuration(session.duration)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {session.endedAt ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          Selesai
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          Sedang Berjalan
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {session.success ? (
                        <span className="text-green-600 font-medium">✅ Berhasil</span>
                      ) : (
                        <span className="text-red-600 font-medium">❌ Gagal</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/testing/monitor/${session.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Monitor
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-blue-800 mb-3">Cara Menggunakan:</h3>
        <ol className="text-blue-700 space-y-2 list-decimal pl-5">
          <li>Beri link testing ke responden: <code className="bg-white px-2 py-1 rounded">/testing?id=[ID_RESPONDEN]</code></li>
          <li>Responden akan mengakses halaman testing tersebut</li>
          <li>Monitor progress responden di tabel di atas</li>
          <li>Hasil akan otomatis tersimpan ke database</li>
        </ol>
      </div>
    </div>
  );
}