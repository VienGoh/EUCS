import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Params {
  params: { id: string }
}

// GET: Get respondent by ID
export async function GET(request: Request, { params }: Params) {
  try {
    const respondent = await prisma.respondent.findUnique({
      where: { id: params.id },
      include: {
        surveys: {
          include: {
            answers: {
              include: {
                question: {
                  include: {
                    dimension: true
                  }
                }
              }
            },
            analysis: true
          }
        }
      }
    })

    if (!respondent) {
      return NextResponse.json(
        { success: false, error: 'Responden tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: respondent
    })
  } catch (error) {
    console.error('Error fetching respondent:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data responden' },
      { status: 500 }
    )
  }
}

// PUT: Update respondent
export async function PUT(request: Request, { params }: Params) {
  try {
    const body = await request.json()
    
    const respondent = await prisma.respondent.update({
      where: { id: params.id },
      data: {
        name: body.name,
        age: parseInt(body.age),
        gender: body.gender,
        email: body.email,
        phone: body.phone,
        occupation: body.occupation,
        education: body.education,
        incomeRange: body.incomeRange,
        tiktokUsage: parseInt(body.tiktokUsage),
        tiktokShopUsage: parseInt(body.tiktokShopUsage),
        lastPurchase: body.lastPurchase ? new Date(body.lastPurchase) : undefined
      }
    })

    return NextResponse.json({
      success: true,
      data: respondent,
      message: 'Responden berhasil diperbarui'
    })
  } catch (error: any) {
    console.error('Error updating respondent:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Responden tidak ditemukan' },
        { status: 404 }
      )
    }
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Email sudah digunakan' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui responden' },
      { status: 500 }
    )
  }
}

// DELETE: Delete respondent
export async function DELETE(request: Request, { params }: Params) {
  try {
    // Check if respondent exists
    const respondent = await prisma.respondent.findUnique({
      where: { id: params.id }
    })

    if (!respondent) {
      return NextResponse.json(
        { success: false, error: 'Responden tidak ditemukan' },
        { status: 404 }
      )
    }

    // Delete respondent (cascade will delete related surveys and answers)
    await prisma.respondent.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Responden berhasil dihapus'
    })
  } catch (error) {
    console.error('Error deleting respondent:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus responden' },
      { status: 500 }
    )
  }
}