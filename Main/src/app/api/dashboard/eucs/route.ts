import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all analyses
    const analyses = await prisma.analysis.findMany({
      include: {
        survey: {
          include: {
            respondent: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate statistics per dimension
    const dimensions = ['Content', 'Accuracy', 'Format', 'EaseOfUse', 'Timeliness', 'Loyalty']
    const dimensionStats: Record<string, any> = {}

    dimensions.forEach(dimension => {
      const scores = analyses.map(a => a[dimension.toLowerCase() as keyof typeof analyses[0]] as number)
      const validScores = scores.filter(score => !isNaN(score))
      
      if (validScores.length > 0) {
        const sum = validScores.reduce((a, b) => a + b, 0)
        const avg = sum / validScores.length
        const min = Math.min(...validScores)
        const max = Math.max(...validScores)
        const stdDev = Math.sqrt(
          validScores.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / validScores.length
        )

        dimensionStats[dimension] = {
          average: parseFloat(avg.toFixed(2)),
          min: parseFloat(min.toFixed(2)),
          max: parseFloat(max.toFixed(2)),
          stdDev: parseFloat(stdDev.toFixed(2)),
          count: validScores.length,
          scores: validScores
        }
      }
    })

    // Correlation between dimensions and loyalty
    const correlations: Record<string, number> = {}
    
    dimensions.forEach(dimension => {
      if (dimension === 'Loyalty') return
      
      const dimScores = analyses.map(a => a[dimension.toLowerCase() as keyof typeof analyses[0]] as number)
      const loyaltyScores = analyses.map(a => a.loyalty)
      
      const correlation = calculateCorrelation(dimScores, loyaltyScores)
      correlations[dimension] = parseFloat(correlation.toFixed(3))
    })

    return NextResponse.json({
      success: true,
      data: {
        totalAnalyses: analyses.length,
        dimensions: dimensionStats,
        correlations,
        recentAnalyses: analyses.slice(0, 10).map(a => ({
          id: a.id,
          respondentName: a.survey.respondent.name,
          scores: {
            content: a.content,
            accuracy: a.accuracy,
            format: a.format,
            easeOfUse: a.easeOfUse,
            timeliness: a.timeliness,
            loyalty: a.loyalty,
            total: a.totalScore
          },
          date: a.createdAt
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching EUCS analysis:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil analisis EUCS' },
      { status: 500 }
    )
  }
}

function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0
  
  const n = x.length
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0)
  
  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
  )
  
  return denominator === 0 ? 0 : numerator / denominator
}