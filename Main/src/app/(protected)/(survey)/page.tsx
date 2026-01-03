'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SurveyForm from '@/components/SurveyForm';

export default function SurveyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    if (sessionId) {
      checkSession();
    } else {
      setError('Session ID tidak ditemukan. Pastikan Anda mengakses dengan link yang benar.');
      setLoading(false);
    }
  }, [sessionId]);

  const checkSession = async () => {
    try {
      const response = await fetch(`/api/survey/${sessionId}`);
      const data = await response.json();
      
      if (response.ok) {
        setSessionData(data);
      } else {
        setError(data.error || 'Session tidak valid');
      }
    } catch (error) {
      setError('Terjadi kesalahan saat memverifikasi session');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      const response = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          ...formData
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        router.push(`/survey/submit?score=${data.totalSUS}&session=${sessionId}`);
      } else {
        alert(data.error || 'Gagal mengirim survey');
      }
    } catch (error) {
      alert('Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memverifikasi session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
          <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Kembali ke Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Survey Pengalaman Pengguna E-Commerce</h1>
          <p className="text-gray-600 mt-2">
            Session: <code className="bg-gray-100 px-2 py-1 rounded">{sessionId}</code>
          </p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-700">
              Terima kasih telah berpartisipasi! Survey ini terdiri dari 3 bagian dan membutuhkan waktu sekitar 10-15 menit.
            </p>
          </div>
        </header>

        <SurveyForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}