// app/api/sus-answers/batch/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST: Simpan multiple SUS answers sekaligus
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validasi input
    if (!Array.isArray(body.answers)) {
      return NextResponse.json(
        { success: false, error: "Data harus berupa array" },
        { status: 400 }
      );
    }

    if (body.answers.length === 0) {
      return NextResponse.json(
        { success: false, error: "Array answers tidak boleh kosong" },
        { status: 400 }
      );
    }

    // Validasi setiap item
    const validatedAnswers = [];
    for (const answer of body.answers) {
      if (!answer.respondenId || !answer.questionId || answer.score === undefined) {
        return NextResponse.json(
          { success: false, error: "Setiap answer harus memiliki respondenId, questionId, dan score" },
          { status: 400 }
        );
      }
      
      validatedAnswers.push({
        respondenId: parseInt(answer.respondenId),
        questionId: parseInt(answer.questionId),
        score: parseInt(answer.score)
      });
    }

    // Simpan satu per satu untuk handle duplicates
    const createdAnswers = [];
    const errors = [];
    
    for (const answer of validatedAnswers) {
      try {
        // Cek apakah sudah ada
        const existing = await prisma.sUSAnswer.findFirst({
          where: {
            respondenId: answer.respondenId,
            questionId: answer.questionId
          }
        });
        
        if (existing) {
          // Update jika sudah ada
          const updated = await prisma.sUSAnswer.update({
            where: { id: existing.id },
            data: { score: answer.score }
          });
          createdAnswers.push(updated);
        } else {
          // Create baru
          const created = await prisma.sUSAnswer.create({
            data: answer
          });
          createdAnswers.push(created);
        }
      } catch (error) {
        errors.push({
          answer,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        created: createdAnswers.length,
        errors: errors.length,
        answers: createdAnswers
      },
      message: `Berhasil menyimpan ${createdAnswers.length} jawaban SUS`,
      ...(errors.length > 0 && { 
        errorDetails: errors,
        warning: `${errors.length} jawaban gagal disimpan`
      })
    });
  } catch (error) {
    console.error("Error saving SUS answers:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Gagal menyimpan jawaban SUS",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}