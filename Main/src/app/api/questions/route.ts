import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Get all questions grouped by dimension
export async function GET(request: Request) {
  try {
    const questions = await prisma.question.findMany({
      include: {
        dimension: true,
        validityReliabilities: true
      },
      orderBy: { order: 'asc' }
    })

    // Group questions by dimension
    const questionsByDimension: Record<string, any> = {}
    
    questions.forEach(question => {
      const dimensionName = question.dimension.name
      if (!questionsByDimension[dimensionName]) {
        questionsByDimension[dimensionName] = {
          dimension: question.dimension,
          questions: []
        }
      }
      questionsByDimension[dimensionName].questions.push(question)
    })

    // Convert to array
    const dimensions = Object.values(questionsByDimension)

    return NextResponse.json({
      success: true,
      data: {
        dimensions,
        totalQuestions: questions.length
      }
    })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data pertanyaan' },
      { status: 500 }
    )
  }
}