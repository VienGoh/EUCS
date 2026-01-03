import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      identity,
      sus,
      ueq
    } = body;

    // Validasi required fields
    if (!sessionId || !identity || !sus || !ueq) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Cek session
    const taskResult = await prisma.taskResult.findUnique({
      where: { sessionId },
      include: { survey: true }
    });

    if (!taskResult) {
      return NextResponse.json(
        { error: 'Session tidak valid' },
        { status: 404 }
      );
    }

    if (taskResult.survey) {
      return NextResponse.json(
        { error: 'Survey sudah diisi' },
        { status: 400 }
      );
    }

    // Hitung SUS score (dengan reverse scoring)
    const susScores = sus.map((score: number, index: number) => {
      const questionNum = index + 1;
      let adjustedScore = score;
      
      // Reverse score untuk item 3, 6, 8, 10 (indeks 2, 5, 7, 9)
      if ([3, 6, 8, 10].includes(questionNum)) {
        adjustedScore = 6 - score; // Convert 1-5 to 5-1
      }
      
      return adjustedScore;
    });

    const susSum = susScores.reduce((a: number, b: number) => a + b, 0);
    const totalSUS = susSum * 2.5; // Convert to 0-100 scale

    // Hitung rata-rata UEQ
    const ueqSum = ueq.reduce((a: number, b: number) => a + b, 0);
    const averageUEQ = ueqSum / ueq.length;

    // Simpan survey ke database
    const survey = await prisma.survey.create({
      data: {
        sessionId,
        gender: identity.gender,
        age: parseInt(identity.age),
        education: identity.education,
        usageFrequency: identity.usageFrequency,
        platform: identity.platform,
        susScores: sus,
        ueqScores: ueq,
        totalSUS,
        averageUEQ
      }
    });

    // Update taskResult status
    await prisma.taskResult.update({
      where: { sessionId },
      data: {
        status: 'completed',
        endTime: new Date(),
        survey: { connect: { id: survey.id } }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Survey berhasil disimpan',
      surveyId: survey.id,
      totalSUS: survey.totalSUS,
      averageUEQ: survey.averageUEQ
    });

  } catch (error) {
    console.error('Error submitting survey:', error);
    return NextResponse.json(
      { error: 'Failed to submit survey' },
      { status: 500 }
    );
  }
}