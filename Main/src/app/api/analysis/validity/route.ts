import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const validityData = await prisma.validityReliability.findMany({
      include: {
        question: {
          include: {
            dimension: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Group by dimension
    const validityByDimension: Record<string, any> = {}
    
    validityData.forEach(item => {
      const dimensionName = item.question.dimension.name
      if (!validityByDimension[dimensionName]) {
        validityByDimension[dimensionName] = {
          dimension: item.question.dimension,
          items: [],
          validCount: 0,
          invalidCount: 0
        }
      }
      
      validityByDimension[dimensionName].items.push(item)
      
      if (item.status === 'Valid') {
        validityByDimension[dimensionName].validCount++
      } else {
        validityByDimension[dimensionName].invalidCount++
      }
    })

    // Calculate overall validity rate
    const totalValid = validityData.filter(item => item.status === 'Valid').length
    const totalItems = validityData.length
    const validityRate = totalItems > 0 ? (totalValid / totalItems) * 100 : 0

    // Summary statistics
    const rHitungValues = validityData.map(item => item.rHitung)
    const avgRHitung = rHitungValues.length > 0 
      ? rHitungValues.reduce((a, b) => a + b, 0) / rHitungValues.length 
      : 0

    const cronbachValues = validityData
      .map(item => item.cronbachAlpha)
      .filter((alpha): alpha is number => alpha !== null)
    
    const avgCronbach = cronbachValues.length > 0
      ? cronbachValues.reduce((a, b) => a + b, 0) / cronbachValues.length
      : 0

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalItems,
          totalValid,
          validityRate: parseFloat(validityRate.toFixed(2)),
          avgRHitung: parseFloat(avgRHitung.toFixed(3)),
          avgCronbach: parseFloat(avgCronbach.toFixed(3))
        },
        byDimension: validityByDimension,
        allItems: validityData.map(item => ({
          id: item.id,
          questionCode: item.question.code,
          questionText: item.question.text,
          dimension: item.question.dimension.name,
          rHitung: item.rHitung,
          rTabel: item.rTabel,
          status: item.status,
          cronbachAlpha: item.cronbachAlpha,
          cronbachStatus: item.cronbachStatus
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching validity analysis:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil analisis validitas' },
      { status: 500 }
    )
  }
}