import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const reliabilityData = await prisma.validityReliability.findMany({
      where: {
        cronbachAlpha: { not: null }
      },
      include: {
        question: {
          include: {
            dimension: true
          }
        }
      }
    })

    // Group by dimension for reliability
    const reliabilityByDimension: Record<string, any> = {}
    
    reliabilityData.forEach(item => {
      if (item.cronbachAlpha === null) return
      
      const dimensionName = item.question.dimension.name
      if (!reliabilityByDimension[dimensionName]) {
        reliabilityByDimension[dimensionName] = {
          dimension: item.question.dimension,
          items: [],
          cronbachValues: []
        }
      }
      
      reliabilityByDimension[dimensionName].items.push(item)
      reliabilityByDimension[dimensionName].cronbachValues.push(item.cronbachAlpha!)
    })

    // Calculate statistics for each dimension
    Object.keys(reliabilityByDimension).forEach(dimension => {
      const values = reliabilityByDimension[dimension].cronbachValues
      if (values.length > 0) {
        const sum = values.reduce((a: number, b: number) => a + b, 0)
        const avg = sum / values.length
        const min = Math.min(...values)
        const max = Math.max(...values)
        
        reliabilityByDimension[dimension].stats = {
          average: parseFloat(avg.toFixed(3)),
          min: parseFloat(min.toFixed(3)),
          max: parseFloat(max.toFixed(3)),
          count: values.length,
          reliabilityLevel: getReliabilityLevel(avg)
        }
      }
    })

    // Overall reliability statistics
    const allCronbachValues = reliabilityData
      .map(item => item.cronbachAlpha)
      .filter((alpha): alpha is number => alpha !== null)

    const overallStats = {
      average: 0,
      min: 0,
      max: 0,
      count: 0
    }

    if (allCronbachValues.length > 0) {
      overallStats.average = parseFloat((allCronbachValues.reduce((a, b) => a + b, 0) / allCronbachValues.length).toFixed(3))
      overallStats.min = parseFloat(Math.min(...allCronbachValues).toFixed(3))
      overallStats.max = parseFloat(Math.max(...allCronbachValues).toFixed(3))
      overallStats.count = allCronbachValues.length
    }

    // Reliability categories
    const categories = {
      excellent: 0,  // α ≥ 0.9
      good: 0,       // 0.8 ≤ α < 0.9
      acceptable: 0, // 0.7 ≤ α < 0.8
      questionable: 0, // 0.6 ≤ α < 0.7
      poor: 0        // α < 0.6
    }

    allCronbachValues.forEach(alpha => {
      if (alpha >= 0.9) categories.excellent++
      else if (alpha >= 0.8) categories.good++
      else if (alpha >= 0.7) categories.acceptable++
      else if (alpha >= 0.6) categories.questionable++
      else categories.poor++
    })

    return NextResponse.json({
      success: true,
      data: {
        overall: {
          ...overallStats,
          reliabilityLevel: getReliabilityLevel(overallStats.average)
        },
        categories,
        byDimension: reliabilityByDimension,
        rawData: reliabilityData.map(item => ({
          id: item.id,
          questionCode: item.question.code,
          dimension: item.question.dimension.name,
          cronbachAlpha: item.cronbachAlpha,
          cronbachStatus: item.cronbachStatus,
          indicator: item.question.indicator
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching reliability analysis:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil analisis reliabilitas' },
      { status: 500 }
    )
  }
}

function getReliabilityLevel(alpha: number): string {
  if (alpha >= 0.9) return 'Excellent'
  if (alpha >= 0.8) return 'Good'
  if (alpha >= 0.7) return 'Acceptable'
  if (alpha >= 0.6) return 'Questionable'
  return 'Poor'
}