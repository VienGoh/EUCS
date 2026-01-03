import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    // Cek apakah session ada dan belum mengisi survey
    const taskResult = await prisma.taskResult.findUnique({
      where: { sessionId },
      include: { survey: true }
    });

    if (!taskResult) {
      return NextResponse.json(
        { error: 'Session tidak ditemukan' },
        { status: 404 }
      );
    }

    if (taskResult.survey) {
      return NextResponse.json(
        { error: 'Survey untuk session ini sudah diisi' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      sessionId: taskResult.sessionId,
      isValid: true,
      startTime: taskResult.startTime,
      status: taskResult.status
    });

  } catch (error) {
    console.error('Error checking session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}