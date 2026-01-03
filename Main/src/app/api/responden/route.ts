// app/api/responden/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Ambil semua responden
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const platformId = searchParams.get("platformId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (platformId) {
      whereClause.platformId = parseInt(platformId);
    }

    const [responden, total] = await Promise.all([
      prisma.responden.findMany({
        where: whereClause,
        include: {
          platform: true,
          taskResults: {
            include: {
              task: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        skip,
        take: limit
      }),
      prisma.responden.count({ where: whereClause })
    ]);

    return NextResponse.json({
      success: true,
      data: responden,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching respondents:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch respondents" },
      { status: 500 }
    );
  }
}

// POST: Tambah responden baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newResponden = await prisma.responden.create({
      data: {
        nama: body.nama,
        umur: parseInt(body.umur),
        jenisKelamin: body.jenisKelamin,
        platformId: parseInt(body.platformId)
      },
      include: {
        platform: true
      }
    });

    return NextResponse.json({
      success: true,
      data: newResponden,
      message: "Responden berhasil ditambahkan"
    });
  } catch (error) {
    console.error("Error creating respondent:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create respondent" },
      { status: 500 }
    );
  }
}