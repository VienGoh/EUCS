import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const regressionData = await prisma.regression.findMany({
      orderBy: { coefficient: 'desc' }
    })

    // Calculate statistics
    const coefficients = regressionData.map(r => r.coefficient)
    const pValues = regressionData.map(r => r.pValue)
    const rSquaredValues = regressionData.map(r => r.rSquared)

    const stats = {
      coefficients: {
        average: coefficients.length > 0 ? coefficients.reduce((a, b) => a + b, 0) / coefficients.length : 0,
        min: coefficients.length > 0 ? Math.min(...coefficients) : 0,
        max: coefficients.length > 0 ? Math.max(...coefficients) : 0
      },
      pValues: {
        average: pValues.length > 0 ? pValues.reduce((a, b) => a + b, 0) / pValues.length : 0,
        min: pValues.length > 0 ? Math.min(...pValues) : 0,
        max: pValues.length > 0 ? Math.max(...pValues) : 0
      },
      rSquared: {
        average: rSquaredValues.length > 0 ? rSquaredValues.reduce((a, b) => a + b, 0) / rSquaredValues.length : 0,
        min: rSquaredValues.length > 0 ? Math.min(...rSquaredValues) : 0,
        max: rSquaredValues.length > 0 ? Math.max(...rSquaredValues) : 0
      }
    }

    // Significance analysis
    const significantCount = regressionData.filter(r => r.significance === 'Signifikan').length
    const nonSignificantCount = regressionData.length - significantCount
    const significanceRate = regressionData.length > 0 ? (significantCount / regressionData.length) * 100 : 0

    // Impact analysis (based on coefficient magnitude)
    const impactLevels = {
      high: 0,    // coefficient > 0.4
      medium: 0,  // 0.2 < coefficient ≤ 0.4
      low: 0      // coefficient ≤ 0.2
    }

    regressionData.forEach(r => {
      if (r.coefficient > 0.4) impactLevels.high++
      else if (r.coefficient > 0.2) impactLevels.medium++
      else impactLevels.low++
    })

    // Most influential dimensions
    const sortedByCoefficient = [...regressionData].sort((a, b) => b.coefficient - a.coefficient)
    const topInfluential = sortedByCoefficient.slice(0, 3)

    // Regression equation components
    const equationComponents = regressionData.map(r => ({
      dimension: r.dimension,
      coefficient: r.coefficient,
      significance: r.significance,
      term: `${r.coefficient.toFixed(3)}${r.dimension}`
    }))

    const intercept = 1.234 // This would be calculated from actual data
    const equation = `Loyalty = ${intercept.toFixed(3)} + ${equationComponents.map(c => c.term).join(' + ')}`

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalVariables: regressionData.length,
          significantCount,
          nonSignificantCount,
          significanceRate: parseFloat(significanceRate.toFixed(2)),
          impactLevels
        },
        statistics: {
          coefficients: {
            ...stats.coefficients,
            average: parseFloat(stats.coefficients.average.toFixed(3))
          },
          pValues: {
            ...stats.pValues,
            average: parseFloat(stats.pValues.average.toFixed(4))
          },
          rSquared: {
            ...stats.rSquared,
            average: parseFloat(stats.rSquared.average.toFixed(3))
          }
        },
        regressionResults: regressionData.map(r => ({
          dimension: r.dimension,
          coefficient: parseFloat(r.coefficient.toFixed(3)),
          tValue: parseFloat(r.tValue.toFixed(2)),
          pValue: parseFloat(r.pValue.toFixed(4)),
          significance: r.significance,
          rSquared: parseFloat(r.rSquared.toFixed(3)),
          adjustedRSquared: parseFloat(r.adjustedRSquared.toFixed(3)),
          interpretation: getInterpretation(r)
        })),
        topInfluential: topInfluential.map(r => ({
          dimension: r.dimension,
          coefficient: parseFloat(r.coefficient.toFixed(3)),
          impact: getImpactLevel(r.coefficient)
        })),
        regressionEquation: equation,
        modelFit: {
          rSquared: parseFloat(stats.rSquared.average.toFixed(3)),
          interpretation: getModelFitInterpretation(stats.rSquared.average)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching regression analysis:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil analisis regresi' },
      { status: 500 }
    )
  }
}

function getInterpretation(regression: any): string {
  if (regression.significance === 'Tidak Signifikan') {
    return 'Tidak memiliki pengaruh signifikan terhadap loyalitas'
  }
  
  const direction = regression.coefficient > 0 ? 'positif' : 'negatif'
  const strength = Math.abs(regression.coefficient) > 0.4 ? 'kuat' : 
                   Math.abs(regression.coefficient) > 0.2 ? 'sedang' : 'lemah'
  
  return `Memiliki pengaruh ${direction} yang ${strength} terhadap loyalitas`
}

function getImpactLevel(coefficient: number): string {
  if (coefficient > 0.4) return 'Tinggi'
  if (coefficient > 0.2) return 'Sedang'
  return 'Rendah'
}

function getModelFitInterpretation(rSquared: number): string {
  if (rSquared >= 0.7) return 'Sangat Baik'
  if (rSquared >= 0.5) return 'Baik'
  if (rSquared >= 0.3) return 'Cukup'
  return 'Lemah'
}