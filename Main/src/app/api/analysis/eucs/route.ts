import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all completed surveys with analyses
    const analyses = await prisma.analysis.findMany({
      include: {
        survey: {
          include: {
            respondent: true,
            answers: {
              include: {
                question: {
                  include: {
                    dimension: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const totalSurveys = await prisma.survey.count({
      where: { completed: true }
    })

    // Calculate dimension averages from actual answers
    const dimensions = await prisma.dimension.findMany({
      include: {
        questions: {
          include: {
            answers: true
          }
        }
      }
    })

    const dimensionData: Record<string, any> = {}
    
    for (const dimension of dimensions) {
      const allScores: number[] = []
      
      for (const question of dimension.questions) {
        for (const answer of question.answers) {
          allScores.push(answer.value)
        }
      }
      
      if (allScores.length > 0) {
        const average = allScores.reduce((a, b) => a + b, 0) / allScores.length
        dimensionData[dimension.name] = {
          average: Number(average.toFixed(2)),
          min: Math.min(...allScores),
          max: Math.max(...allScores),
          count: allScores.length
        }
      } else {
        dimensionData[dimension.name] = {
          average: 0,
          min: 0,
          max: 0,
          count: 0
        }
      }
    }

    // Calculate distribution from total scores
    const totalScores = analyses.map(a => a.totalScore).filter(s => s > 0)
    const distribution = {
      veryHigh: totalScores.filter(s => s >= 4).length,
      high: totalScores.filter(s => s >= 3 && s < 4).length,
      medium: totalScores.filter(s => s >= 2 && s < 3).length,
      low: totalScores.filter(s => s > 0 && s < 2).length
    }

    // Prepare recent analyses data
    const recentAnalyses = analyses.slice(0, 10).map(a => ({
      id: a.id,
      createdAt: a.createdAt,
      scores: {
        content: a.content,
        accuracy: a.accuracy,
        format: a.format,
        easeOfUse: a.easeOfUse,
        timeliness: a.timeliness,
        loyalty: a.loyalty
      },
      totalScore: a.totalScore,
      respondent: a.survey?.respondent ? {
        name: a.survey.respondent.name,
        email: a.survey.respondent.email
      } : null
    }))

    // Calculate correlations between dimensions
    const correlations: Record<string, number> = {}
    const dimensionNames = Object.keys(dimensionData)
    
    for (let i = 0; i < dimensionNames.length; i++) {
      for (let j = 0; j < dimensionNames.length; j++) {
        const key = `${dimensionNames[i]}-${dimensionNames[j]}`
        if (i === j) {
          correlations[key] = 1
        } else {
          // Get scores for each dimension from analyses
          const scoresI = analyses.map(a => (a as any)[dimensionNames[i].toLowerCase()] || 0)
          const scoresJ = analyses.map(a => (a as any)[dimensionNames[j].toLowerCase()] || 0)
          correlations[key] = calculateCorrelation(scoresI, scoresJ)
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        dimensions: dimensionData,
        distribution,
        correlations,
        totalSurveys,
        recentAnalyses,
        lastUpdated: new Date().toISOString(),
        summary: {
          totalAnalyses: analyses.length,
          averageTotalScore: totalScores.length > 0 
            ? Number((totalScores.reduce((a, b) => a + b, 0) / totalScores.length).toFixed(2))
            : 0
        }
      }
    })

  } catch (error) {
    console.error('Error fetching EUCS data:', error)
    
    // Return minimal structure if error
    return NextResponse.json({
      success: true,
      data: {
        dimensions: {},
        distribution: {},
        correlations: {},
        totalSurveys: 0,
        recentAnalyses: [],
        lastUpdated: new Date().toISOString()
      }
    })
  }
}

// Helper function to calculate correlation
function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0
  
  const n = x.length
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((acc, val, i) => acc + val * y[i], 0)
  const sumX2 = x.reduce((acc, val) => acc + val * val, 0)
  const sumY2 = y.reduce((acc, val) => acc + val * val, 0)
  
  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
  
  if (denominator === 0) return 0
  return Number((numerator / denominator).toFixed(3))
}