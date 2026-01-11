import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Params {
  params: { id: string }
}

// POST: Submit survey answers
export async function POST(request: Request, { params }: Params) {
  try {
    const { answers } = await request.json()
    
    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Data jawaban tidak valid' },
        { status: 400 }
      )
    }

    // Check if survey exists
    const survey = await prisma.survey.findUnique({
      where: { id: params.id }
    })

    if (!survey) {
      return NextResponse.json(
        { success: false, error: 'Survey tidak ditemukan' },
        { status: 404 }
      )
    }

    // Get all questions to map dimensions
    const questions = await prisma.question.findMany({
      include: { dimension: true }
    })

    // Create answers
    const answerPromises = answers.map(async (answer: any) => {
      return prisma.answer.create({
        data: {
          surveyId: params.id,
          questionId: answer.questionId,
          value: parseInt(answer.value)
        }
      })
    })

    await Promise.all(answerPromises)

    // Calculate dimension scores
    const dimensionScores: Record<string, { total: number; count: number }> = {}
    
    for (const answer of answers) {
      const question = questions.find(q => q.id === answer.questionId)
      if (question && question.dimension) {
        const dimensionName = question.dimension.name
        if (!dimensionScores[dimensionName]) {
          dimensionScores[dimensionName] = { total: 0, count: 0 }
        }
        dimensionScores[dimensionName].total += parseInt(answer.value)
        dimensionScores[dimensionName].count += 1
      }
    }

    // Calculate averages
    const content = dimensionScores['Content'] ? dimensionScores['Content'].total / dimensionScores['Content'].count : 0
    const accuracy = dimensionScores['Accuracy'] ? dimensionScores['Accuracy'].total / dimensionScores['Accuracy'].count : 0
    const format = dimensionScores['Format'] ? dimensionScores['Format'].total / dimensionScores['Format'].count : 0
    const easeOfUse = dimensionScores['EaseOfUse'] ? dimensionScores['EaseOfUse'].total / dimensionScores['EaseOfUse'].count : 0
    const timeliness = dimensionScores['Timeliness'] ? dimensionScores['Timeliness'].total / dimensionScores['Timeliness'].count : 0
    const loyalty = dimensionScores['Loyalty'] ? dimensionScores['Loyalty'].total / dimensionScores['Loyalty'].count : 0

    // Calculate total score (average of all dimensions)
    const validScores = [content, accuracy, format, easeOfUse, timeliness, loyalty].filter(score => score > 0)
    const totalScore = validScores.length > 0 
      ? validScores.reduce((a, b) => a + b, 0) / validScores.length 
      : 0

    // Create analysis
    const analysis = await prisma.analysis.create({
      data: {
        surveyId: params.id,
        content,
        accuracy,
        format,
        easeOfUse,
        timeliness,
        loyalty,
        totalScore
      }
    })

    // Update survey as completed
    await prisma.survey.update({
      where: { id: params.id },
      data: {
        completed: true,
        completedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: { analysis, answersCount: answers.length },
      message: 'Survey berhasil disubmit'
    })
  } catch (error) {
    console.error('Error submitting survey:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal submit survey' },
      { status: 500 }
    )
  }
}   