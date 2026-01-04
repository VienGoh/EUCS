import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Ambil semua jawaban SUS
    const susAnswers = await prisma.sUSAnswer.findMany({
      include: { question: true },
    });

    // Hitung SUS per responden
    const susPerResponden: Record<number, number> = {};
    
    for (const ans of susAnswers) {
      if (ans.question.isPositive) {
        susPerResponden[ans.respondenId] = (susPerResponden[ans.respondenId] || 0) + (ans.score - 1);
      } else {
        susPerResponden[ans.respondenId] = (susPerResponden[ans.respondenId] || 0) + (5 - ans.score);
      }
    }

    // Konversi ke skor 0-100
    const susScores = Object.values(susPerResponden).map((total) => total * 2.5);

    // Kategorisasi
    const categories = [
      { range: '0-49 (Poor)', min: 0, max: 49, count: 0, color: '#EF4444' },
      { range: '50-69 (OK)', min: 50, max: 69, count: 0, color: '#F59E0B' },
      { range: '70-84 (Good)', min: 70, max: 84, count: 0, color: '#3B82F6' },
      { range: '85-100 (Excellent)', min: 85, max: 100, count: 0, color: '#10B981' },
    ];

    susScores.forEach(score => {
      const category = categories.find(cat => score >= cat.min && score <= cat.max);
      if (category) category.count++;
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching SUS distribution:", error);
    return NextResponse.json(
      { error: "Failed to fetch SUS distribution data" },
      { status: 500 }
    );
  }
}