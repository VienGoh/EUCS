'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SubmitPage() {
  const searchParams = useSearchParams();
  const score = searchParams.get('score');
  const session = searchParams.get('session');
  
  const [scoreInterpretation, setScoreInterpretation] = useState('');

  useEffect(() => {
    if (score) {
      const numericScore = parseFloat(score);
      let interpretation = '';
      
      if (numericScore >= 85) interpretation = 'Sangat Baik (Excellent)';
      else if (numericScore >= 70) interpretation = 'Baik (Good)';
      else if (numericScore >= 50) interpretation = 'Cukup (OK)';
      else interpretation = 'Buruk (Poor)';
      
      setScoreInterpretation(interpretation);
    }
  }, [score]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Survey Berhasil Dikirim!</h1>
        <p className="text-gray-600 mb-6">
          Terima kasih atas partisipasi Anda dalam penelitian ini.
        </p>

        {score && (
          <div className="mb-8">
            <div className="inline-block bg-blue-50 rounded-full px-6 py-3">
              <div className="text-3xl font-bold text-blue-700">{score}</div>
              <div className="text-sm text-blue-600">Skor SUS Anda</div>
            </div>
            {scoreInterpretation && (
              <p className="mt-3 text-gray-700">
                Interpretasi: <span className="font-semibold">{scoreInterpretation}</span>
              </p>
            )}
          </div>
        )}

        <div className="p-4 bg-gray-50 rounded-lg mb-6">
          <p className="text-sm text-gray-600">
            <strong>Session ID:</strong> {session}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Data Anda telah tersimpan dengan aman dan akan digunakan untuk analisis penelitian.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => window.close()}
            className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Tutup Halaman
          </button>
          <p className="text-xs text-gray-500">
            Anda dapat menutup halaman ini sekarang. Terima kasih!
          </p>
        </div>
      </div>
    </div>
  );
}