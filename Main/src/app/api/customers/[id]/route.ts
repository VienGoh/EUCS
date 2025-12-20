import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function mustAuth(roles: Array<"ADMIN"|"PENELITI">) {
  try {
    const session = await getServerSession(authOptions);
    console.log("🔐 Auth session user:", session?.user?.email, "role:", session?.user?.role);
    
    if (!session?.user) {
      console.log("❌ No session found");
      return NextResponse.json({ error: "Unauthorized: No session" }, { status: 401 });
    }
    
    if (!roles.includes(session.user.role as any)) {
      console.log(`❌ Role not allowed: ${session.user.role}, required: ${roles}`);
      return NextResponse.json({ error: "Unauthorized: Invalid role" }, { status: 401 });
    }
    
    console.log("✅ Auth successful");
    return null;
  } catch (error) {
    console.error("🔐 Auth error:", error);
    return NextResponse.json({ error: "Authentication error" }, { status: 500 });
  }
}

// GET single customer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log(`📥 GET customer request for ID: ${await params.then(p => p.id)}`);
  
  try {
    const { id } = await params;
    console.log(`🔍 GET customer ID: ${id}`);
    
    const denied = await mustAuth(["ADMIN", "PENELITI"]);
    if (denied) return denied;

    // Validasi ID
    const customerId = parseInt(id);
    
    if (isNaN(customerId)) {
      console.log(`❌ Invalid customer ID format: ${id}`);
      return NextResponse.json(
        { error: "ID customer tidak valid" },
        { status: 400 }
      );
    }

    console.log(`🔍 Fetching customer ID: ${customerId}`);

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        createdAt: true,
        vehicles: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true,
            year: true,
          }
        },
        _count: {
          select: {
            vehicles: true,
          }
        }
      }
    });

    if (!customer) {
      console.log(`❌ Customer not found: ${customerId}`);
      return NextResponse.json(
        { error: "Customer tidak ditemukan" },
        { status: 404 }
      );
    }

    console.log(`✅ Customer found: ${customer.name}`);
    return NextResponse.json(customer);
    
  } catch (error) {
    console.error("❌ Error fetching customer:", error);
    
    if (error instanceof Error && error.message.includes("connection")) {
      return NextResponse.json(
        { error: "Koneksi database gagal" },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: "Gagal mengambil data customer" },
      { status: 500 }
    );
  }
}

// PATCH update customer
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log(`📥 PATCH customer request for ID: ${await params.then(p => p.id)}`);
  
  try {
    const { id } = await params;
    console.log(`✏️ PATCH customer ID: ${id}`);

    // Check authorization - khusus ADMIN untuk edit
    const denied = await mustAuth(["ADMIN"]);
    if (denied) {
      console.log("❌ Authorization denied for PATCH");
      return denied;
    }

    const customerId = parseInt(id);
    
    if (isNaN(customerId)) {
      console.log(`❌ Invalid customer ID: ${id}`);
      return NextResponse.json(
        { error: "ID customer tidak valid" },
        { status: 400 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log("📝 Update data:", JSON.stringify(body, null, 2));
    } catch (error) {
      console.error("❌ Error parsing request body:", error);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!existingCustomer) {
      console.log(`❌ Customer not found: ${customerId}`);
      return NextResponse.json(
        { error: "Customer tidak ditemukan" },
        { status: 404 }
      );
    }

    // Validate required field
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === "") {
      console.log("❌ Invalid name:", body.name);
      return NextResponse.json(
        { error: "Nama wajib diisi dan harus berupa string" },
        { status: 400 }
      );
    }

    // Validasi optional fields
    if (body.phone !== undefined && typeof body.phone !== 'string') {
      console.log("❌ Invalid phone type:", typeof body.phone);
      return NextResponse.json(
        { error: "Nomor telepon harus berupa string" },
        { status: 400 }
      );
    }

    if (body.email !== undefined && typeof body.email !== 'string') {
      console.log("❌ Invalid email type:", typeof body.email);
      return NextResponse.json(
        { error: "Email harus berupa string" },
        { status: 400 }
      );
    }

    // HANYA UPDATE FIELD YANG ADA DI SCHEMA
    const updateData: {
      name: string;
      phone?: string | null;
      email?: string | null;
    } = {
      name: body.name.trim(),
    };

    // Handle optional fields
    if (body.phone !== undefined) {
      updateData.phone = body.phone?.trim() || null;
    }

    if (body.email !== undefined) {
      updateData.email = body.email?.trim() || null;
    }

    console.log("💾 Update data to save:", updateData);

    // Update customer
    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: updateData,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        createdAt: true,
      }
    });

    console.log(`✅ Customer updated successfully: ${updatedCustomer.name}`);
    
    return NextResponse.json({
      message: "Customer berhasil diupdate",
      customer: updatedCustomer,
    });
  } catch (error) {
    console.error("❌ Error updating customer:", error);
    
    // Handle Prisma errors
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          { error: "Email atau nomor telepon sudah digunakan" },
          { status: 400 }
        );
      }
      
      if (error.message.includes("Invalid `prisma.customer.update()`")) {
        return NextResponse.json(
          { error: "Data tidak valid untuk update" },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Gagal mengupdate customer" },
      { status: 500 }
    );
  }
}

// DELETE customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log(`📥 DELETE customer request for ID: ${await params.then(p => p.id)}`);
  
  try {
    const { id } = await params;
    console.log(`🗑️ DELETE customer ID: ${id}`);

    const denied = await mustAuth(["ADMIN"]);
    if (denied) return denied;

    const customerId = parseInt(id);
    
    if (isNaN(customerId)) {
      return NextResponse.json(
        { error: "ID customer tidak valid" },
        { status: 400 }
      );
    }

    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: "Customer tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if customer has vehicles
    const vehicleCount = await prisma.vehicle.count({
      where: { customerId: customerId }
    });

    if (vehicleCount > 0) {
      return NextResponse.json(
        { 
          error: "Tidak dapat menghapus customer yang memiliki kendaraan",
          vehicleCount: vehicleCount
        },
        { status: 400 }
      );
    }

    // Delete customer
    await prisma.customer.delete({
      where: { id: customerId },
    });

    console.log(`✅ Customer deleted: ID ${customerId}`);
    
    return NextResponse.json({
      message: "Customer berhasil dihapus",
      deletedId: customerId,
    });
  } catch (error) {
    console.error("❌ Error deleting customer:", error);
    
    if (error instanceof Error && error.message.includes("foreign key constraint")) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus customer yang memiliki data terkait" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Gagal menghapus customer" },
      { status: 500 }
    );
  }
}

// Tambahkan OPTIONS handler untuk CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}