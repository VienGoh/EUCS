'use client';

import { useState } from 'react';

interface SurveyFormProps {
  onSubmit: (data: any) => void;
}

export default function SurveyForm({ onSubmit }: SurveyFormProps) {
  const [step, setStep] = useState(1);
  const [identity, setIdentity] = useState({
    gender: '',
    age: '',
    education: '',
    usageFrequency: '',
    platform: ''
  });
  
  const [susAnswers, setSusAnswers] = useState<string[]>(Array(10).fill(''));
  const [ueqAnswers, setUeqAnswers] = useState<string[]>(Array(13).fill(''));

  // Education options
  const educationOptions = [
    'SMA/Sederajat',
    'Diploma (D1-D3)',
    'Sarjana (S1)',
    'Magister (S2)',
    'Doktor (S3)',
    'Lainnya'
  ];

  // Usage frequency
  const frequencyOptions = [
    '1-3 kali per minggu',
    '4-6 kali per minggu',
    '7-10 kali per minggu',
    'Lebih dari 10 kali per minggu'
  ];

  // Platform options
  const platformOptions = [
    'Shopee',
    'Tokopedia',
    'Lazada',
    'TikTok Shop',
    'Blibli',
    'Bukalapak',
    'Lainnya'
  ];

  // SUS Questions
  const susQuestions = [
    'Saya merasa Shopee/TikTok Shop mudah digunakan.',
    'Saya merasa fitur-fitur pada Shopee/TikTok Shop bekerja secara konsisten.',
    'Saya merasa Shopee/TikTok Shop terlalu rumit untuk digunakan.',
    'Saya merasa tidak membutuhkan bantuan orang lain untuk menggunakan Shopee/TikTok Shop.',
    'Saya merasa fitur pada Shopee/TikTok Shop saling mendukung satu sama lain.',
    'Saya merasa terdapat ketidakkonsistenan dalam Shopee/TikTok Shop.',
    'Saya merasa pengguna lain dapat mempelajari Shopee/TikTok Shop dengan cepat.',
    'Saya merasa Shopee/TikTok Shop membingungkan.',
    'Saya merasa percaya diri ketika menggunakan Shopee/TikTok Shop.',
    'Saya membutuhkan banyak waktu untuk memahami cara kerja Shopee/TikTok Shop.'
  ];

  // UEQ Dimensions
  const ueqDimensions = [
    { left: 'Tidak menyenangkan', right: 'Menyenangkan' },
    { left: 'Tidak disukai', right: 'Disukai' },
    { left: 'Membosankan', right: 'Menarik' },
    { left: 'Rumit', right: 'Mudah dipahami' },
    { left: 'Tidak logis', right: 'Logis' },
    { left: 'Tidak efisien', right: 'Efisien' },
    { left: 'Lambat', right: 'Cepat' },
    { left: 'Tidak dapat diandalkan', right: 'Andal' },
    { left: 'Tidak aman', right: 'Aman' },
    { left: 'Tidak memotivasi', right: 'Memotivasi' },
    { left: 'Membosankan', right: 'Menginspirasi' },
    { left: 'Biasa saja', right: 'Inovatif' },
    { left: 'Konvensional', right: 'Kreatif' }
  ];

  const handleIdentityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setIdentity(prev => ({ ...prev, [name]: value }));
  };

  const handleSusChange = (index: number, value: string) => {
    const newAnswers = [...susAnswers];
    newAnswers[index] = value;
    setSusAnswers(newAnswers);
  };

  const handleUeqChange = (index: number, value: string) => {
    const newAnswers = [...ueqAnswers];
    newAnswers[index] = value;
    setUeqAnswers(newAnswers);
  };

  const nextStep = () => {
    // Validasi sebelum lanjut
    if (step === 1) {
      if (!identity.gender || !identity.age || !identity.education || !identity.usageFrequency || !identity.platform) {
        alert('Harap isi semua data identitas');
        return;
      }
    } else if (step === 2) {
      if (susAnswers.some(answer => answer === '')) {
        alert('Harap jawab semua pertanyaan SUS');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    if (ueqAnswers.some(answer => answer === '')) {
      alert('Harap jawab semua pertanyaan UEQ');
      return;
    }

    const formData = {
      identity,
      sus: susAnswers.map(Number),
      ueq: ueqAnswers.map(Number)
    };

    onSubmit(formData);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Bagian 1: Identitas Responden</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Kelamin *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="Laki-laki"
                      checked={identity.gender === 'Laki-laki'}
                      onChange={handleIdentityChange}
                      className="mr-2"
                      required
                    />
                    Laki-laki
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="Perempuan"
                      checked={identity.gender === 'Perempuan'}
                      onChange={handleIdentityChange}
                      className="mr-2"
                    />
                    Perempuan
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usia *
                </label>
                <input
                  type="number"
                  name="age"
                  min="10"
                  max="100"
                  value={identity.age}
                  onChange={handleIdentityChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pendidikan Terakhir *
                </label>
                <select
                  name="education"
                  value={identity.education}
                  onChange={handleIdentityChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Pilih pendidikan</option>
                  {educationOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frekuensi penggunaan e-commerce per minggu *
                </label>
                <select
                  name="usageFrequency"
                  value={identity.usageFrequency}
                  onChange={handleIdentityChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Pilih frekuensi</option>
                  {frequencyOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform e-commerce yang sering digunakan *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {platformOptions.map(platform => (
                    <label key={platform} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="platform"
                        value={platform}
                        checked={identity.platform === platform}
                        onChange={handleIdentityChange}
                        className="mr-2"
                        required
                      />
                      {platform}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Bagian 2: System Usability Scale (SUS)</h2>
            <p className="text-gray-600">
              Untuk setiap pernyataan, pilih tingkat kesepakatan Anda (1 = Sangat Tidak Setuju, 5 = Sangat Setuju)
            </p>

            <div className="space-y-8">
              {susQuestions.map((question, index) => (
                <div key={index} className="p-6 bg-white rounded-lg border shadow-sm">
                  <p className="font-medium text-gray-800 mb-4">
                    {index + 1}. {question}
                    {[2, 5, 7, 9].includes(index) && (
                      <span className="ml-2 text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
                        (Pernyataan Negatif - Skor akan dibalik)
                      </span>
                    )}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 justify-between">
                    {[1, 2, 3, 4, 5].map(value => (
                      <label key={value} className="flex flex-col items-center">
                        <input
                          type="radio"
                          name={`sus-${index}`}
                          value={value}
                          checked={susAnswers[index] === value.toString()}
                          onChange={(e) => handleSusChange(index, e.target.value)}
                          className="h-5 w-5"
                          required
                        />
                        <span className="mt-1 text-sm">{value}</span>
                        {value === 1 && <span className="text-xs text-gray-500">STS</span>}
                        {value === 5 && <span className="text-xs text-gray-500">SS</span>}
                      </label>
                    ))}
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Sangat Tidak Setuju</span>
                    <span>Sangat Setuju</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Bagian 3: User Experience Questionnaire (UEQ)</h2>
            <p className="text-gray-600">
              Berdasarkan pengalaman Anda menggunakan Shopee/TikTok Shop, pilih posisi antara dua kata sifat yang berlawanan
            </p>

            <div className="space-y-8">
              {ueqDimensions.map((dimension, index) => (
                <div key={index} className="p-6 bg-white rounded-lg border shadow-sm">
                  <p className="text-center font-medium text-gray-600 mb-6">
                    Dimensi {index + 1}
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">{dimension.left}</span>
                      <span className="text-gray-700">{dimension.right}</span>
                    </div>
                    
                    <div className="flex items-center justify-between space-x-4">
                      <span className="text-sm text-gray-500 w-24">Sangat ke kiri</span>
                      <div className="flex-1 flex justify-between">
                        {[1, 2, 3, 4, 5, 6, 7].map(value => (
                          <label key={value} className="flex flex-col items-center">
                            <input
                              type="radio"
                              name={`ueq-${index}`}
                              value={value}
                              checked={ueqAnswers[index] === value.toString()}
                              onChange={(e) => handleUeqChange(index, e.target.value)}
                              className="h-5 w-5"
                              required
                            />
                            <span className="mt-1 text-sm">{value}</span>
                          </label>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 w-24">Sangat ke kanan</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Langkah {step} dari 3
          </span>
          <span className="text-sm font-medium text-blue-600">
            {Math.round((step / 3) * 100)}% selesai
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Form Content */}
      {renderStep()}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t">
        <button
          type="button"
          onClick={prevStep}
          disabled={step === 1}
          className={`px-6 py-2 rounded-lg ${step === 1 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Kembali
        </button>

        {step < 3 ? (
          <button
            type="button"
            onClick={nextStep}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Lanjut
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Kirim Survey
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Catatan:</strong> Pastikan Anda telah menjawab semua pertanyaan sebelum melanjutkan. 
          Anda tidak dapat mengubah jawaban setelah mengirim survey.
        </p>
      </div>
    </div>
  );
}