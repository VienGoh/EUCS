import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function mustAuth(roles: Array<"ADMIN"|"PENELITI">) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !roles.includes(session.user.role as any)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(request: Request) {
  console.log("API GET all customers");
  
  const denied = await mustAuth(["ADMIN", "PENELITI"]);
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    
    // Get filter parameters
    const name = searchParams.get("name") || undefined;
    const phone = searchParams.get("phone") || undefined;
    const email = searchParams.get("email") || undefined;
    const company = searchParams.get("company") || undefined;

    // Build where clause
    const where: any = {};
    
    if (name) {
      where.name = {
        contains: name,
        mode: "insensitive" as const,
      };
    }
    
    if (phone) {
      where.phone = {
        contains: phone,
        mode: "insensitive" as const,
      };
    }
    
    if (email) {
      where.email = {
        contains: email,
        mode: "insensitive" as const,
      };
    }
    
    if (company) {
      where.company = {
        contains: company,
        mode: "insensitive" as const,
      };
    }

    // Fetch customers
    const customers = await prisma.customer.findMany({
      where,
      include: {
        vehicles: {
          select: {
            id: true,
            plate: true,
            model: true,
          }
        },
        _count: {
          select: {
            vehicles: true,
          }
        }
      },
      orderBy: {
        name: "asc",
      },
    });

    console.log(`Found ${customers.length} customers`);
    return NextResponse.json(customers);
    
  } catch (error) {
    console.error("Error fetching customers:", error);
    
    if (error instanceof Error && error.message.includes("connection")) {
      return NextResponse.json(
        { error: "Koneksi database gagal. Silakan coba lagi." },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: "Gagal mengambil data customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  console.log("API POST create customer");
  
  const denied = await mustAuth(["ADMIN"]);
  if (denied) return denied;

  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || body.name.trim() === "") {
      return NextResponse.json(
        { error: "Nama wajib diisi" },
        { status: 400 }
      );
    }

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        name: body.name.trim(),
        phone: body.phone?.trim() || null,
        email: body.email?.trim() || null
      },
    });

    return NextResponse.json(customer, { status: 201 });
    
  } catch (error) {
    console.error("Error creating customer:", error);
    
    if (error instanceof Error && error.message.includes("connection")) {
      return NextResponse.json(
        { error: "Koneksi database gagal. Silakan coba lagi." },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: "Gagal membuat customer" },
      { status: 500 }
    );
  }
}