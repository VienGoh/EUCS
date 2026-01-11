import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Get all respondents with pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const gender = searchParams.get('gender') || ''

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { occupation: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (gender) {
      where.gender = gender
    }

    // Get total count
    const total = await prisma.respondent.count({ where })
    
    // Get respondents
    const respondents = await prisma.respondent.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        surveys: {
          where: { completed: true },
          include: { analysis: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: respondents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching respondents:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data responden' },
      { status: 500 }
    )
  }
}

// POST: Create new respondent
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.age) {
      return NextResponse.json(
        { success: false, error: 'Nama dan usia diperlukan' },
        { status: 400 }
      )
    }

    // Create respondent
    const respondent = await prisma.respondent.create({
      data: {
        name: body.name,
        age: parseInt(body.age),
        gender: body.gender || 'Laki-laki',
        email: body.email || null,
        phone: body.phone || null,
        occupation: body.occupation || 'Mahasiswa',
        education: body.education || null,
        incomeRange: body.incomeRange || null,
        tiktokUsage: parseInt(body.tiktokUsage) || 3,
        tiktokShopUsage: parseInt(body.tiktokShopUsage) || 3,
        lastPurchase: body.lastPurchase ? new Date(body.lastPurchase) : new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: respondent,
      message: 'Responden berhasil ditambahkan'
    })
  } catch (error: any) {
    console.error('Error creating respondent:', error)
    
    // Handle duplicate email error
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Email sudah digunakan' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Gagal menambahkan responden' },
      { status: 500 }
    )
  }
}