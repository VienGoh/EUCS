import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Get all surveys
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const completed = searchParams.get('completed')

    const where: any = {}
    
    if (completed !== null) {
      where.completed = completed === 'true'
    }

    const total = await prisma.survey.count({ where })
    
    const surveys = await prisma.survey.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        respondent: true,
        answers: {
          include: {
            question: true
          }
        },
        analysis: true
      }
    })

    return NextResponse.json({
      success: true,
      data: surveys,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching surveys:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data survey' },
      { status: 500 }
    )
  }
}

// POST: Create new survey
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    if (!body.respondentId) {
      return NextResponse.json(
        { success: false, error: 'Responden ID diperlukan' },
        { status: 400 }
      )
    }

    // Check if respondent exists
    const respondent = await prisma.respondent.findUnique({
      where: { id: body.respondentId }
    })

    if (!respondent) {
      return NextResponse.json(
        { success: false, error: 'Responden tidak ditemukan' },
        { status: 404 }
      )
    }

    // Create survey
    const survey = await prisma.survey.create({
      data: {
        respondentId: body.respondentId,
        researcherId: body.researcherId || 'clp12qldi0000uqw0p24x9p6z', // Default researcher ID
        completed: false
      }
    })

    return NextResponse.json({
      success: true,
      data: survey,
      message: 'Survey berhasil dibuat'
    })
  } catch (error) {
    console.error('Error creating survey:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal membuat survey' },
      { status: 500 }
    )
  }
}