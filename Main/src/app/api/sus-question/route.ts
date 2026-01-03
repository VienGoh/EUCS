import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const questions = await prisma.susQuestion.findMany({
    orderBy: { id: "asc" },
  });

  return NextResponse.json(questions);
}
