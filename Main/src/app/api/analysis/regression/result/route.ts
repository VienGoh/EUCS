import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data = await prisma.regression.findMany({
    orderBy: { dimension: "asc" },
  });

  return NextResponse.json(data);
}
