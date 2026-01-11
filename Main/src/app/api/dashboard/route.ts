import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get counts
    const totalRespondents = await prisma.respondent.count()
    const totalSurveys = await prisma.survey.count()
    const completedSurveys = await prisma.survey.count({ where: { completed: true } })
    
    // Gender distribution
    const genderDistribution = await prisma.respondent.groupBy({
      by: ['gender'],
      _count: true
    })

    // Age distribution
    const ageGroups = {
      '≤20': 0,
      '21-25': 0,
      '26-30': 0,
      '31-35': 0,
      '>35': 0
    }

    const respondents = await prisma.respondent.findMany({
      select: { age: true }
    })

    respondents.forEach(respondent => {
      const age = respondent.age
      if (age <= 20) ageGroups['≤20']++
      else if (age <= 25) ageGroups['21-25']++
      else if (age <= 30) ageGroups['26-30']++
      else if (age <= 35) ageGroups['31-35']++
      else ageGroups['>35']++
    })

    // Average EUCS scores
    const analyses = await prisma.analysis.findMany({
      select: {
        content: true,
        accuracy: true,
        format: true,
        easeOfUse: true,
        timeliness: true,
        loyalty: true,
        totalScore: true
      }
    })

    const avgScores = {
      content: 0,
      accuracy: 0,
      format: 0,
      easeOfUse: 0,
      timeliness: 0,
      loyalty: 0,
      total: 0
    }

    if (analyses.length > 0) {
      avgScores.content = analyses.reduce((sum, a) => sum + a.content, 0) / analyses.length
      avgScores.accuracy = analyses.reduce((sum, a) => sum + a.accuracy, 0) / analyses.length
      avgScores.format = analyses.reduce((sum, a) => sum + a.format, 0) / analyses.length
      avgScores.easeOfUse = analyses.reduce((sum, a) => sum + a.easeOfUse, 0) / analyses.length
      avgScores.timeliness = analyses.reduce((sum, a) => sum + a.timeliness, 0) / analyses.length
      avgScores.loyalty = analyses.reduce((sum, a) => sum + a.loyalty, 0) / analyses.length
      avgScores.total = analyses.reduce((sum, a) => sum + a.totalScore, 0) / analyses.length
    }

    // Recent surveys
    const recentSurveys = await prisma.survey.findMany({
      where: { completed: true },
      take: 5,
      orderBy: { completedAt: 'desc' },
      include: {
        respondent: true,
        analysis: true
      }
    })

    // TikTok usage statistics
    const tiktokUsage = await prisma.respondent.groupBy({
      by: ['tiktokUsage'],
      _count: true,
      orderBy: { tiktokUsage: 'asc' }
    })

    const tiktokShopUsage = await prisma.respondent.groupBy({
      by: ['tiktokShopUsage'],
      _count: true,
      orderBy: { tiktokShopUsage: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalRespondents,
          totalSurveys,
          completedSurveys,
          completionRate: totalSurveys > 0 ? (completedSurveys / totalSurveys) * 100 : 0
        },
        genderDistribution,
        ageGroups,
        avgScores,
        recentSurveys: recentSurveys.map(s => ({
          id: s.id,
          respondentName: s.respondent.name,
          completedAt: s.completedAt,
          totalScore: s.analysis?.totalScore
        })),
        usageStats: {
          tiktokUsage,
          tiktokShopUsage
        }
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data dashboard' },
      { status: 500 }
    )
  }
}