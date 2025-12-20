export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const Item = z.object({ 
  name: z.string().trim().min(1), 
  price: z.coerce.number().min(0) 
});

const Part = z.object({ 
  partId: z.coerce.number().int().positive(), 
  qty: z.coerce.number().int().positive(), 
  unitPrice: z.coerce.number().min(0) 
});

const PatchBody = z.object({
  vehicleId: z.coerce.number().int().positive().optional(),
  mechanicId: z.coerce.number().int().positive().optional(),
  mechanicName: z.string().transform(s => s?.trim() || "").optional(),
  date: z.string().trim().optional().transform(s => (s ? new Date(s) : undefined)),
  odometer: z.coerce.number().int().optional(),
  notes: z.string().optional(),
  items: z.array(Item).optional(),
  parts: z.array(Part).optional(),
});

type RouteCtx = { params: Promise<{ id: string }> };

function normalizeParts(parts: { partId:number; qty:number; unitPrice:number }[]) {
  const map = new Map<number, { qty:number; unitPrice:number }>();
  for (const p of parts) {
    const ex = map.get(p.partId);
    if (!ex) map.set(p.partId, { qty: p.qty, unitPrice: p.unitPrice });
    else map.set(p.partId, { qty: ex.qty + p.qty, unitPrice: p.unitPrice });
  }
  return Array.from(map, ([partId, v]) => ({ partId, qty: v.qty, unitPrice: v.unitPrice }));
}

export async function GET(_req: Request, { params }: RouteCtx) {
  try {
    const { id } = await params;
    const serviceId = Number(id);
    
    if (!Number.isFinite(serviceId) || serviceId <= 0) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const order = await prisma.serviceOrder.findUnique({
      where: { id: serviceId },
      include: {
        vehicle: { include: { customer: true } },
        mechanic: true,
        items: true,
        parts: { include: { part: true } },
      },
    });
    
    if (!order) {
      return NextResponse.json({ error: "Data servis tidak ditemukan" }, { status: 404 });
    }

    // Hitung total
    const serviceTotal = order.items.reduce((sum, item) => sum + item.price, 0);
    const partsTotal = order.parts.reduce((sum, part) => sum + (part.qty * part.unitPrice), 0);
    const total = serviceTotal + partsTotal;

    return NextResponse.json({ 
      ...order, 
      totals: {
        service: serviceTotal,
        parts: partsTotal,
        total: total
      }
    }, { status: 200 });

  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ 
      error: "Gagal mengambil data servis" 
    }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: RouteCtx) {
  try {
    const { id } = await params;
    const serviceId = Number(id);
    
    if (!Number.isFinite(serviceId) || serviceId <= 0) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    // Parse request body
    let body;
    try {
      const parsed = PatchBody.safeParse(await req.json());
      if (!parsed.success) {
        return NextResponse.json({ 
          error: "Data tidak valid", 
          details: parsed.error.flatten() 
        }, { status: 400 });
      }
      body = parsed.data;
    } catch (error) {
      return NextResponse.json({ 
        error: "Format JSON tidak valid" 
      }, { status: 400 });
    }

    // Cek apakah service ada
    const existingService = await prisma.serviceOrder.findUnique({ 
      where: { id: serviceId } 
    });
    
    if (!existingService) {
      return NextResponse.json({ 
        error: `Servis #${serviceId} tidak ditemukan` 
      }, { status: 404 });
    }

    // Handle mechanic
    let mechanicId = body.mechanicId;
    const mechanicName = (body.mechanicName ?? "").trim();
    
    if (!mechanicId && mechanicName) {
      const mechanic = await prisma.mechanic.upsert({
        where: { name: mechanicName },
        update: {},
        create: { name: mechanicName, active: true },
      });
      mechanicId = mechanic.id;
    }

    // **Berdasarkan schema Anda: ServiceOrder tidak punya updatedAt!**
    const updateData: any = {};
    
    // **1. Vehicle: HARUS pakai connect (sesuai schema)**
    if (body.vehicleId !== undefined) {
      // Cek dulu apakah vehicle ada
      const vehicleExists = await prisma.vehicle.findUnique({
        where: { id: body.vehicleId }
      });
      
      if (!vehicleExists) {
        return NextResponse.json({ 
          error: `Kendaraan dengan ID ${body.vehicleId} tidak ditemukan` 
        }, { status: 404 });
      }
      
      updateData.vehicle = { connect: { id: body.vehicleId } };
    }
    
    // **2. Mechanic: pakai connect atau disconnect**
    if (mechanicId !== undefined) {
      if (mechanicId) {
        updateData.mechanic = { connect: { id: mechanicId } };
      } else {
        updateData.mechanic = { disconnect: true };
      }
    }
    
    // **3. Field langsung yang ada di schema ServiceOrder**
    if (body.date !== undefined) updateData.date = body.date;
    if (body.odometer !== undefined) updateData.odometer = body.odometer;
    if (body.notes !== undefined) updateData.notes = body.notes;
    
    // **4. Nested relations untuk items dan parts**
    if (body.items !== undefined) {
      updateData.items = { 
        deleteMany: {}, 
        create: body.items.map(i => ({ 
          name: i.name.trim(), 
          price: i.price 
        })) 
      };
    }
    
    if (body.parts !== undefined) {
      updateData.parts = {
        deleteMany: {},
        create: normalizeParts(body.parts).map(p => ({ 
          partId: p.partId, 
          qty: p.qty, 
          unitPrice: p.unitPrice 
        })),
      };
    }

    console.log("🔄 Update data untuk Prisma:", JSON.stringify(updateData, null, 2));

    // Update service order
    const updated = await prisma.serviceOrder.update({
      where: { id: serviceId },
      data: updateData,
      include: {
        vehicle: { include: { customer: true } },
        mechanic: true,
        items: true,
        parts: { include: { part: true } },
      },
    });

    console.log(`✅ Service #${serviceId} berhasil diupdate`);
    
    // Hitung total setelah update
    const serviceTotal = updated.items.reduce((sum, item) => sum + item.price, 0);
    const partsTotal = updated.parts.reduce((sum, part) => sum + (part.qty * part.unitPrice), 0);
    const total = serviceTotal + partsTotal;

    return NextResponse.json({
      success: true,
      message: "Servis berhasil diperbarui",
      data: {
        ...updated,
        totals: {
          service: serviceTotal,
          parts: partsTotal,
          total: total
        }
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("❌ PATCH error:", error);
    
    // Error handling spesifik
    if (error.message?.includes("Unknown argument")) {
      return NextResponse.json({ 
        error: "Struktur data tidak sesuai dengan schema database",
        detail: error.message
      }, { status: 400 });
    }
    
    if (error.message?.includes("foreign key constraint")) {
      return NextResponse.json({ 
        error: "Data terkait (vehicle atau mechanic) tidak ditemukan" 
      }, { status: 404 });
    }
    
    if (error.message?.includes("Unique constraint")) {
      return NextResponse.json({ 
        error: "Data duplikat ditemukan" 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: "Gagal memperbarui servis",
      detail: error.message || "Unknown error"
    }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: RouteCtx) {
  try {
    const { id } = await params;
    const serviceId = Number(id);
    
    if (!Number.isFinite(serviceId) || serviceId <= 0) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    // Cek apakah service ada
    const existingService = await prisma.serviceOrder.findUnique({ 
      where: { id: serviceId } 
    });
    
    if (!existingService) {
      return NextResponse.json({ 
        error: `Servis #${serviceId} tidak ditemukan` 
      }, { status: 404 });
    }

    // Hapus dalam transaction
    await prisma.$transaction([
      prisma.serviceItem.deleteMany({ where: { serviceOrderId: serviceId } }),
      prisma.servicePart.deleteMany({ where: { serviceOrderId: serviceId } }),
      prisma.serviceOrder.delete({ where: { id: serviceId } })
    ]);

    console.log(`🗑️ Service #${serviceId} berhasil dihapus`);
    
    return NextResponse.json({ 
      success: true,
      message: "Servis berhasil dihapus" 
    }, { status: 200 });

  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ 
      error: "Gagal menghapus servis" 
    }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ 
    error: "Method tidak diizinkan" 
  }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ 
    error: "Method tidak diizinkan" 
  }, { status: 405 });
}