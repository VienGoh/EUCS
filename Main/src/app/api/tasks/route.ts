// app/api/tasks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Ambil semua tasks
export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        _count: {
          select: {
            taskResults: true
          }
        },
        taskResults: {
          take: 5,
          include: {
            responden: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}