// app/api/testing/results/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST: Simpan hasil testing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Cari task ID untuk "Proses Belanja"
    const shoppingTask = await prisma.task.findFirst({
      where: {
        namaTask: {
          contains: "belanja",
          mode: "insensitive"
        }
      }
    });

    // Jika tidak ada, buat task baru
    let taskId = shoppingTask?.id;
    if (!taskId) {
      const newTask = await prisma.task.create({
        data: {
          namaTask: "Proses Belanja Online",
          deskripsi: "Simulasi proses belanja dari pencarian hingga checkout"
        }
      });
      taskId = newTask.id;
    }

    // Simpan hasil testing
    const result = await prisma.taskResult.create({
      data: {
        respondenId: body.respondenId,
        taskId: taskId,
        success: body.success,
        timeOnTask: body.timeOnTask,
        errorCount: body.errorCount,
        // Tambahkan metadata opsional
        // metadata: JSON.stringify({
        //   stepsCompleted: body.stepsCompleted,
        //   productsAdded: body.productsAdded,
        //   totalPrice: body.totalPrice
        // })
      }
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: "Hasil testing berhasil disimpan"
    });
  } catch (error) {
    console.error("Error saving test result:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save test result" },
      { status: 500 }
    );
  }
}