import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const result = await prisma.taskResult.create({
    data: {
      respondenId: body.respondenId,
      taskId: body.taskId,
      success: body.success,
      timeOnTask: body.timeOnTask,
      errorCount: body.errorCount,
    },
  });

  return NextResponse.json(result);
}
