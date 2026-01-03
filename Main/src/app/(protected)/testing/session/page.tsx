// app/(protected)/testing/session/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Task, Platform, Responden, SUSQuestion } from '@prisma/client';
import { API_ROUTES } from '@/lib/constants';

// Types untuk data session
interface TaskResultInput {
  taskId: number;
  success: boolean;
  timeOnTask: number;
  errorCount: number;
}

interface SUSAnswerInput {
  questionId: number;
  score: number;
}

export default function TestingSessionPage() {
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<Date>(new Date());

  const [currentStep, setCurrentStep] = useState<'registrasi' | 'tugas' | 'kuesioner' | 'selesai'>('registrasi');
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [taskTime, setTaskTime] = useState(0); // dalam detik
  const [errorCount, setErrorCount] = useState(0);
  
  // State untuk data yang diambil dari API
  const [tasks, setTasks] = useState<Task[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [susQuestions, setSusQuestions] = useState<SUSQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Data responden
  const [respondenData, setRespondenData] = useState({
    nama: '',
    umur: '',
    jenisKelamin: '',
    platformId: '',
    pengalamanECommerce: 'menengah',
  });

  // Data kuesioner
  const [susAnswers, setSusAnswers] = useState<Record<number, number>>({});

  // Data hasil task yang akan dikirim ke API
  const [taskResults, setTaskResults] = useState<TaskResultInput[]>([]);
  
  // ID responden setelah registrasi
  const [respondenId, setRespondenId] = useState<number | null>(null);

  const currentTask = tasks[currentTaskIndex];
  const totalTasks = tasks.length;

  // Fetch data dari API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch tasks
        const tasksRes = await fetch('/api/tasks');
        const tasksData = await tasksRes.json();
        setTasks(tasksData.data || []);

        // Fetch platforms
        const platformsRes = await fetch('/api/platform');
        const platformsData = await platformsRes.json();
        setPlatforms(platformsData.data || []);

        // Fetch SUS questions
        const susRes = await fetch('/api/sus-question');
        const susData = await susRes.json();
        setSusQuestions(susData.data || []);

        // Inisialisasi jawaban SUS
        const initialAnswers: Record<number, number> = {};
        susData.data?.forEach((q: SUSQuestion) => {
          initialAnswers[q.id] = 3; // Default value netral
        });
        setSusAnswers(initialAnswers);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Timer untuk mengukur waktu tugas
  useEffect(() => {
    if (currentStep === 'tugas') {
      startTimeRef.current = new Date();
      timerRef.current = setInterval(() => {
        const now = new Date();
        const diff = (now.getTime() - startTimeRef.current.getTime()) / 1000;
        setTaskTime(Math.round(diff));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentStep]);

  const handleRegistrasiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi data
    if (!respondenData.nama || !respondenData.umur || !respondenData.jenisKelamin || !respondenData.platformId) {
      alert('Harap isi semua data yang diperlukan');
      return;
    }

    try {
      // Simpan data responden ke API
      const response = await fetch('/api/responden', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nama: respondenData.nama,
          umur: parseInt(respondenData.umur),
          jenisKelamin: respondenData.jenisKelamin,
          platformId: parseInt(respondenData.platformId),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setRespondenId(data.data.id);
        localStorage.setItem('currentTestingSession', JSON.stringify({
          respondenId: data.data.id,
          respondenData: respondenData,
          startedAt: new Date().toISOString(),
        }));
        
        setCurrentStep('tugas');
      } else {
        alert('Gagal menyimpan data responden: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat menyimpan data');
    }
  };

  const handleTaskComplete = async (success: boolean) => {
    if (!respondenId || !currentTask) return;

    // Simpan hasil task ke state sementara
    const taskResult: TaskResultInput = {
      taskId: currentTask.id,
      success: success,
      timeOnTask: taskTime,
      errorCount: errorCount,
    };

    const updatedResults = [...taskResults, taskResult];
    setTaskResults(updatedResults);

    try {
      // Simpan ke API
      await fetch('/api/task-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          respondenId: respondenId,
          ...taskResult,
        }),
      });
    } catch (error) {
      console.error('Error saving task result:', error);
    }

    // Reset untuk task berikutnya
    setTaskTime(0);
    setErrorCount(0);

    // Cek apakah ada task berikutnya
    if (currentTaskIndex < totalTasks - 1) {
      setCurrentTaskIndex(prev => prev + 1);
    } else {
      setCurrentStep('kuesioner');
    }
  };

  const handleSUSAnswer = (questionId: number, score: number) => {
    setSusAnswers(prev => ({
      ...prev,
      [questionId]: score,
    }));
  };

  const handleSubmitSUS = async () => {
    if (!respondenId) {
      alert('Tidak ada data responden');
      return;
    }

    // Validasi semua pertanyaan terjawab
    if (Object.keys(susAnswers).length !== susQuestions.length) {
      alert('Harap jawab semua pertanyaan');
      return;
    }

    // Format data untuk API
    const susAnswersData = Object.entries(susAnswers).map(([questionId, score]) => ({
      respondenId: respondenId,
      questionId: parseInt(questionId),
      score: score,
    }));

    try {
      // Simpan ke API
      const response = await fetch('/api/sus-answers/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers: susAnswersData }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update session data di localStorage
        const sessionData = {
          respondenId: respondenId,
          respondenData: respondenData,
          taskResults: taskResults,
          susAnswers: susAnswersData,
          completedAt: new Date().toISOString(),
        };
        
        // Simpan ke history
        const history = JSON.parse(localStorage.getItem('testingSessionHistory') || '[]');
        history.push(sessionData);
        localStorage.setItem('testingSessionHistory', JSON.stringify(history));
        
        // Hapus session aktif
        localStorage.removeItem('currentTestingSession');
        
        setCurrentStep('selesai');
      } else {
        alert('Gagal menyimpan data kuesioner: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat menyimpan data');
    }
  };

  const handleAddError = () => {
    setErrorCount(prev => prev + 1);
  };

  const handleResetSession = () => {
    setCurrentStep('registrasi');
    setCurrentTaskIndex(0);
    setTaskTime(0);
    setErrorCount(0);
    setRespondenData({
      nama: '',
      umur: '',
      jenisKelamin: '',
      platformId: '',
      pengalamanECommerce: 'menengah',
    });
    setSusAnswers({});
    setTaskResults([]);
    setRespondenId(null);
    localStorage.removeItem('currentTestingSession');
  };

  // Load session yang terputus
  useEffect(() => {
    const savedSession = localStorage.getItem('currentTestingSession');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      setRespondenId(session.respondenId);
      setRespondenData(session.respondenData);
      setCurrentStep('tugas');
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (currentStep === 'registrasi') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Registrasi Peserta Testing Session
              </h1>
              <p className="text-gray-600">
                Silakan isi data diri Anda sebelum memulai pengujian sistem e-commerce
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Total Tasks: {tasks.length}
            </div>
          </div>

          <form onSubmit={handleRegistrasiSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  value={respondenData.nama}
                  onChange={(e) => setRespondenData({ ...respondenData, nama: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Umur (18-40) *
                </label>
                <input
                  type="number"
                  min="18"
                  max="40"
                  value={respondenData.umur}
                  onChange={(e) => setRespondenData({ ...respondenData, umur: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="Contoh: 25"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Kelamin *
              </label>
              <div className="flex space-x-4">
                {['Laki-laki', 'Perempuan'].map((gender) => (
                  <label key={gender} className="flex items-center">
                    <input
                      type="radio"
                      name="jenisKelamin"
                      value={gender}
                      checked={respondenData.jenisKelamin === gender}
                      onChange={(e) => setRespondenData({ ...respondenData, jenisKelamin: e.target.value })}
                      className="mr-2 h-4 w-4 text-blue-600"
                      required
                    />
                    <span>{gender}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platform E-commerce yang Dites *
              </label>
              <select
                value={respondenData.platformId}
                onChange={(e) => setRespondenData({ ...respondenData, platformId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Pilih Platform</option>
                {platforms.map((platform) => (
                  <option key={platform.id} value={platform.id}>
                    {platform.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pengalaman Menggunakan E-commerce
              </label>
              <select
                value={respondenData.pengalamanECommerce}
                onChange={(e) => setRespondenData({ ...respondenData, pengalamanECommerce: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pemula">Pemula (1-6 bulan)</option>
                <option value="menengah">Menengah (6 bulan - 2 tahun)</option>
                <option value="mahir">Mahir (lebih dari 2 tahun)</option>
              </select>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition duration-200 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 10v4a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Mulai Pengujian
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Daftar Task yang Akan Diuji:</h3>
            <div className="space-y-2">
              {tasks.map((task, index) => (
                <div key={task.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mr-3 font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{task.namaTask}</div>
                    <div className="text-sm text-gray-600">{task.deskripsi}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'tugas') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Skenario Usability Testing
                </h1>
                <p className="text-gray-600">
                  Platform: {platforms.find(p => p.id.toString() === respondenData.platformId)?.name}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-500">Progress</div>
                  <div className="text-2xl font-bold">
                    {currentTaskIndex + 1} <span className="text-gray-400">/</span> {totalTasks}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-500">Waktu</div>
                  <div className="text-2xl font-mono font-bold text-gray-800">
                    {Math.floor(taskTime / 60)}:{String(taskTime % 60).padStart(2, '0')}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${((currentTaskIndex + 1) / totalTasks) * 100}%` }}
              ></div>
            </div>

            {/* Task info */}
            {currentTask && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-semibold mr-3">
                        {currentTaskIndex + 1}
                      </span>
                      <h2 className="text-xl font-semibold text-gray-800">
                        {currentTask.namaTask}
                      </h2>
                    </div>
                    <p className="text-gray-700 pl-11">{currentTask.deskripsi}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-blue-100 min-w-[200px]">
                    <div className="text-sm text-gray-500 mb-2">Task Stats</div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Errors:</span>
                        <span className="font-medium text-red-600">{errorCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium text-yellow-600">Sedang Berjalan</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Task tools */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <button
                onClick={handleAddError}
                className="bg-red-50 border border-red-200 text-red-700 py-4 px-6 rounded-lg font-medium hover:bg-red-100 transition duration-200 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                Laporkan Error
                <span className="ml-3 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm">
                  {errorCount}
                </span>
              </button>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center text-gray-700 mb-2">
                  <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span className="font-medium">Instruksi:</span>
                </div>
                <ul className="list-disc pl-5 text-gray-600 space-y-1">
                  <li>Selesaikan tugas sesuai deskripsi di atas</li>
                  <li>Klik "Laporkan Error" jika mengalami kesulitan</li>
                  <li>Gunakan aplikasi e-commerce yang ditentukan</li>
                  <li>Perhatikan waktu yang digunakan</li>
                </ul>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center text-gray-700 mb-2">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span className="font-medium">Tips:</span>
                </div>
                <ul className="list-disc pl-5 text-gray-600 space-y-1">
                  <li>Usahakan selesaikan tanpa error</li>
                  <li>Gunakan aplikasi asli, bukan simulasi</li>
                  <li>Catat kesulitan yang ditemui</li>
                </ul>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleTaskComplete(true)}
                className="bg-green-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-green-700 transition duration-200 flex items-center justify-center text-lg"
              >
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Tugas Selesai (Berhasil)
              </button>
              
              <button
                onClick={() => handleTaskComplete(false)}
                className="bg-yellow-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-yellow-700 transition duration-200 flex items-center justify-center text-lg"
              >
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                Tugas Gagal
              </button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleResetSession}
                className="text-gray-600 hover:text-gray-800 flex items-center text-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z"></path>
                </svg>
                Batalkan & Mulai Ulang Session
              </button>
            </div>
          </div>

          {/* Simulation area */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Simulasi E-commerce Interface
              </h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                Panduan Visual
              </span>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h4 className="text-xl font-medium text-gray-800 mb-2">
                  Gunakan Aplikasi {platforms.find(p => p.id.toString() === respondenData.platformId)?.name} di Perangkat Anda
                </h4>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Buka aplikasi {platforms.find(p => p.id.toString() === respondenData.platformId)?.name} di smartphone/komputer Anda dan lakukan tugas sesuai instruksi di atas.
                  Area ini hanya sebagai pengingat dan panduan visual.
                </p>
              </div>
              
              {/* Mock interface */}
              <div className="max-w-md mx-auto border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                <div className="bg-blue-600 text-white p-3 text-center font-medium">
                  {platforms.find(p => p.id.toString() === respondenData.platformId)?.name} Mock Interface
                </div>
                <div className="p-4">
                  <div className="flex items-center mb-4 p-2 bg-white rounded border">
                    <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <input
                      type="text"
                      placeholder="Cari produk..."
                      className="flex-1 outline-none"
                      disabled
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-white rounded border p-3">
                        <div className="h-32 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'kuesioner') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Kuesioner System Usability Scale (SUS)
                </h1>
                <p className="text-gray-600">
                  Berikan penilaian Anda berdasarkan pengalaman menggunakan sistem
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Responden ID</div>
                <div className="font-mono text-lg font-bold text-gray-800">
                  #{respondenId?.toString().padStart(4, '0')}
                </div>
              </div>
            </div>

            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <p className="text-blue-800 font-medium mb-1">Petunjuk Pengisian:</p>
                  <ul className="list-disc pl-5 text-blue-700 text-sm space-y-1">
                    <li>Berdasarkan pengalaman Anda menggunakan sistem selama testing session</li>
                    <li>Berikan nilai 1-5 untuk setiap pernyataan menggunakan skala berikut:</li>
                  </ul>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-5 gap-2">
                    {[
                      { value: 1, label: 'Sangat Tidak Setuju', color: 'bg-red-100 text-red-800' },
                      { value: 2, label: 'Tidak Setuju', color: 'bg-orange-100 text-orange-800' },
                      { value: 3, label: 'Netral', color: 'bg-yellow-100 text-yellow-800' },
                      { value: 4, label: 'Setuju', color: 'bg-green-100 text-green-800' },
                      { value: 5, label: 'Sangat Setuju', color: 'bg-blue-100 text-blue-800' },
                    ].map((item) => (
                      <div key={item.value} className={`p-2 rounded text-center ${item.color}`}>
                        <div className="font-bold text-lg">{item.value}</div>
                        <div className="text-xs mt-1">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {susQuestions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition">
                  <div className="flex items-start mb-6">
                    <div className="mr-4">
                      <span className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-800 rounded-full font-bold text-lg">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-medium text-gray-800 mb-2">
                        {question.question}
                      </p>
                      {question.isPositive === false && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                          </svg>
                          Pernyataan Negatif
                        </span>
                      )}
                      {question.isPositive === true && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          Pernyataan Positif
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <span className="text-sm text-gray-500 font-medium">Sangat Tidak Setuju</span>
                    
                    <div className="flex justify-center space-x-2">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => handleSUSAnswer(question.id, score)}
                          className={`
                            w-12 h-12 rounded-full flex items-center justify-center border-2 text-lg font-medium
                            transition-all duration-200 transform hover:scale-105
                            ${susAnswers[question.id] === score
                              ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                              : 'border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                            }
                          `}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                    
                    <span className="text-sm text-gray-500 font-medium">Sangat Setuju</span>
                  </div>
                  
                  {susAnswers[question.id] && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-center">
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          Dipilih: <span className="font-bold">{susAnswers[question.id]}</span> - 
                          {susAnswers[question.id] === 1 && ' Sangat Tidak Setuju'}
                          {susAnswers[question.id] === 2 && ' Tidak Setuju'}
                          {susAnswers[question.id] === 3 && ' Netral'}
                          {susAnswers[question.id] === 4 && ' Setuju'}
                          {susAnswers[question.id] === 5 && ' Sangat Setuju'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="text-gray-600">
                  <p className="font-medium">Status Pengisian:</p>
                  <p className="text-sm">
                    {Object.keys(susAnswers).filter(k => susAnswers[parseInt(k)]).length} dari {susQuestions.length} pertanyaan terjawab
                  </p>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => setCurrentStep('tugas')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    Kembali ke Tugas
                  </button>
                  
                  <button
                    onClick={handleSubmitSUS}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Submit Kuesioner
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'selesai') {
    // Hitung statistik
    const totalTasksCompleted = taskResults.length;
    const successfulTasks = taskResults.filter(t => t.success).length;
    const successRate = totalTasksCompleted > 0 ? (successfulTasks / totalTasksCompleted) * 100 : 0;
    const totalTime = taskResults.reduce((sum, t) => sum + t.timeOnTask, 0);
    const totalErrors = taskResults.reduce((sum, t) => sum + t.errorCount, 0);
    
    // Hitung skor SUS
    const susScores = Object.values(susAnswers);
    const averageSUS = susScores.length > 0 ? 
      susScores.reduce((sum, score) => sum + score, 0) / susScores.length : 0;

    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header Success */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center text-white">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full mb-6">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Testing Session Selesai!
              </h1>
              
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                Terima kasih telah berpartisipasi dalam pengujian sistem e-commerce.
                Data Anda telah berhasil direkam dan akan digunakan untuk penelitian.
              </p>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Session Summary */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Ringkasan Session</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                    <div className="text-sm text-blue-600 font-medium mb-2">Total Tasks</div>
                    <div className="text-3xl font-bold text-gray-800">{totalTasksCompleted}</div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-100 rounded-xl p-6">
                    <div className="text-sm text-green-600 font-medium mb-2">Success Rate</div>
                    <div className="text-3xl font-bold text-gray-800">{successRate.toFixed(1)}%</div>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">
                    <div className="text-sm text-purple-600 font-medium mb-2">Total Waktu</div>
                    <div className="text-3xl font-bold text-gray-800">
                      {Math.floor(totalTime / 60)}:{String(Math.round(totalTime % 60)).padStart(2, '0')}
                    </div>
                  </div>
                  
                  <div className="bg-red-50 border border-red-100 rounded-xl p-6">
                    <div className="text-sm text-red-600 font-medium mb-2">Total Errors</div>
                    <div className="text-3xl font-bold text-gray-800">{totalErrors}</div>
                  </div>
                </div>

                {/* Session Details */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-medium text-gray-700 mb-4">Detail Session</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Responden ID</div>
                      <div className="font-mono text-lg font-bold">#{respondenId?.toString().padStart(4, '0')}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Platform</div>
                      <div className="font-medium">{platforms.find(p => p.id.toString() === respondenData.platformId)?.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Rata-rata Skor SUS</div>
                      <div className="font-bold text-xl">
                        {averageSUS.toFixed(1)} <span className="text-gray-400">/ 5.0</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Selesai Pada</div>
                      <div className="font-medium">{new Date().toLocaleString('id-ID')}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Task Results Details */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Detail Hasil Task</h3>
                <div className="space-y-3">
                  {taskResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                          result.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {result.success ? '✓' : '✗'}
                        </div>
                        <div>
                          <div className="font-medium">Task {index + 1}</div>
                          <div className="text-sm text-gray-500">
                            {tasks.find(t => t.id === result.taskId)?.namaTask}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium">{result.timeOnTask}s</div>
                        <div className="text-sm text-gray-500">
                          {result.errorCount} error{result.errorCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                    </svg>
                    Ke Dashboard
                  </button>
                  
                  <button
                    onClick={handleResetSession}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Mulai Session Baru
                  </button>
                  
                  <button
                    onClick={() => router.push('/testing/session/history')}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Lihat History
                  </button>
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500">
                    Data penelitian ini akan digunakan untuk evaluasi User Experience (UX) sistem e-commerce.
                    Terima kasih atas kontribusi Anda!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}