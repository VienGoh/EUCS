"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Question {
  id: string
  code: string
  text: string
  indicator: string
  dimension: {
    name: string
  }
}

interface SurveyData {
  id: string
  completed: boolean
  respondent: {
    name: string
    email: string
  }
  answers: Array<{
    id: string
    questionId: string
    value: number
  }>
}

export default function SurveyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const surveyId = params.id as string
  
  const [questions, setQuestions] = useState<Question[]>([])
  const [survey, setSurvey] = useState<SurveyData | null>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch questions
      const questionsRes = await fetch('/api/questions')
      const questionsData = await questionsRes.json()
      
      if (questionsData.success) {
        // Flatten questions from dimensions
        const allQuestions: Question[] = []
        questionsData.data.dimensions.forEach((dim: any) => {
          dim.questions.forEach((q: any) => {
            allQuestions.push({
              ...q,
              dimension: { name: dim.dimension.name }
            })
          })
        })
        setQuestions(allQuestions)
        
        // Initialize answers
        const initialAnswers: Record<string, number> = {}
        allQuestions.forEach(q => {
          initialAnswers[q.id] = 3 // Default to neutral (3)
        })
        setAnswers(initialAnswers)
      }

      // Fetch survey data if exists
      const surveyRes = await fetch(`/api/surveys/${surveyId}`)
      if (surveyRes.ok) {
        const surveyData = await surveyRes.json()
        if (surveyData.success) {
          setSurvey(surveyData.data)
          
          // Load existing answers
          if (surveyData.data.answers.length > 0) {
            const existingAnswers: Record<string, number> = {}
            surveyData.data.answers.forEach((answer: any) => {
              existingAnswers[answer.questionId] = answer.value
            })
            setAnswers(existingAnswers)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionId: string, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleSubmit = async () => {
    if (!confirm('Apakah Anda yakin ingin menyimpan survey ini?')) return
    
    setSubmitting(true)
    
    try {
      const answersArray = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value
      }))

      const res = await fetch(`/api/surveys/${surveyId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answersArray })
      })

      const data = await res.json()
      
      if (data.success) {
        alert('Survey berhasil disimpan!')
        router.push('/surveys')
      } else {
        alert('Gagal menyimpan survey: ' + data.error)
      }
    } catch (error) {
      console.error('Error submitting survey:', error)
      alert('Terjadi kesalahan saat menyimpan survey')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Memuat data survey...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kuesioner EUCS TikTok Shop</h1>
        {survey && (
          <div className="mt-2 p-4 bg-blue-50 rounded-lg">
            <p className="text-gray-900">
              <strong>Responden:</strong> {survey.respondent.name} ({survey.respondent.email})
            </p>
            <p className="text-gray-600 text-sm mt-1">
              Status: {survey.completed ? 'Selesai' : 'Belum Selesai'}
            </p>
          </div>
        )}
      </div>

      {/* Questions by Dimension */}
      {['Content', 'Accuracy', 'Format', 'EaseOfUse', 'Timeliness', 'Loyalty'].map(dimension => {
        const dimensionQuestions = questions.filter(q => q.dimension.name === dimension)
        
        if (dimensionQuestions.length === 0) return null
        
        return (
          <div key={dimension} className="mb-8">
            <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{dimension}</h2>
                <p className="text-sm text-gray-600">
                  {dimension === 'Content' && 'Kualitas, kelengkapan, dan relevansi informasi'}
                  {dimension === 'Accuracy' && 'Ketepatan dan kebenaran data yang dihasilkan sistem'}
                  {dimension === 'Format' && 'Cara informasi ditampilkan dan struktur antarmuka'}
                  {dimension === 'EaseOfUse' && 'Kemudahan penggunaan sistem'}
                  {dimension === 'Timeliness' && 'Kecepatan sistem dalam memberikan respons'}
                  {dimension === 'Loyalty' && 'Loyalitas pengguna terhadap TikTok Shop'}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {dimensionQuestions.length} pertanyaan
              </div>
            </div>

            <div className="space-y-4">
              {dimensionQuestions.map((question) => (
                <div key={question.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {question.code}. {question.text}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Indikator: {question.indicator}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      Jawaban: <span className="font-bold">{answers[question.id] || 0}/5</span>
                    </div>
                  </div>

                  {/* Likert Scale */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-600">Sangat Tidak Setuju</div>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleAnswerChange(question.id, value)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                            answers[question.id] === value
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">Sangat Setuju</div>
                  </div>

                  {/* Labels */}
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>1 (STS)</span>
                    <span>2 (TS)</span>
                    <span>3 (N)</span>
                    <span>4 (S)</span>
                    <span>5 (SS)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Progress Bar */}
      <div className="sticky bottom-0 bg-white border-t p-4 mt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600">Progress</p>
            <div className="w-64 bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-green-500"
                style={{ width: `${(Object.keys(answers).length / 27) * 100}%` }}
              ></div>
            </div>
          </div>
          <p className="text-gray-900">
            {Object.keys(answers).length} dari 27 pertanyaan
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Kembali
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || Object.keys(answers).length !== 27}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Menyimpan...' : 'Simpan Survey'}
          </button>
        </div>
      </div>
    </div>
  )
}