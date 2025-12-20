// app/api/reminders/send-email/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

// Helper function untuk menghitung hari
function daysBetween(a: Date, b: Date) {
  return Math.floor(Math.abs(+a - +b) / 86_400_000);
}

// Simpan konfigurasi transporter global
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER || 'syswebappnoreply@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
  }
  return transporter;
}

export async function POST() {
  try {
    console.log('📧 Memulai pengiriman email reminder ke pelanggan yang perlu servis...');

    // Gunakan logika yang sama dengan GET /api/reminders/due
    const today = new Date();
    const within = 30; // Sama dengan default di API reminders/due

    // Ambil data kendaraan yang perlu servis
    const vehicles = await prisma.vehicle.findMany({
      include: {
        customer: true,
        services: { 
          orderBy: { date: "desc" }, 
          take: 1 
        },
      },
      where: {
        customer: {
          email: { not: null } // Hanya kendaraan milik pelanggan yang punya email
        }
      }
    });

    console.log(`📊 Ditemukan ${vehicles.length} kendaraan untuk diproses`);

    // Filter kendaraan yang statusnya "due" atau "soon"
    const vehiclesNeedingAttention = vehicles.map(v => {
      const last = v.services[0]?.date ?? null;
      const interval = v.serviceIntervalDays ?? 180;
      const since = last ? daysBetween(today, last) : Infinity;

      let status: "ok" | "soon" | "due" = "ok";
      if (!last || since >= interval) status = "due";
      else if (since >= Math.max(0, interval - within)) status = "soon";

      return {
        ...v,
        status,
        daysSince: isFinite(since) ? since : null,
        intervalDays: interval
      };
    }).filter(v => v.status === "due" || v.status === "soon");

    console.log(`🎯 ${vehiclesNeedingAttention.length} kendaraan perlu perhatian`);

    if (vehiclesNeedingAttention.length === 0) {
      return NextResponse.json({ 
        success: true,
        message: 'Tidak ada kendaraan yang perlu dikirim reminder servis saat ini',
        totalVehicles: 0,
        totalCustomers: 0,
        sent: 0,
        failed: 0
      });
    }

    // Kelompokkan kendaraan berdasarkan pelanggan
    const customersMap = new Map();
    
    for (const vehicle of vehiclesNeedingAttention) {
      const customerId = vehicle.customer.id;
      
      if (!customersMap.has(customerId)) {
        customersMap.set(customerId, {
          customer: vehicle.customer,
          vehicles: []
        });
      }
      
      customersMap.get(customerId).vehicles.push({
        plate: vehicle.plate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        lastServiceDate: vehicle.services[0]?.date || null,
        daysSince: vehicle.daysSince,
        intervalDays: vehicle.intervalDays,
        status: vehicle.status
      });
    }

    const customersToNotify = Array.from(customersMap.values());
    
    console.log(`👥 ${customersToNotify.length} pelanggan akan dikirim email`);

    const transporter = getTransporter();
    const results = [];

    // Kirim email ke setiap pelanggan
    for (const { customer, vehicles } of customersToNotify) {
      if (!customer.email) continue;

      // Hitung jumlah kendaraan per status
      const dueCount = vehicles.filter(v => v.status === "due").length;
      const soonCount = vehicles.filter(v => v.status === "soon").length;

      const mailOptions = {
        from: `"Bengkel Fantasi Jaya" <${process.env.GMAIL_USER || 'syswebappnoreply@gmail.com'}>`,
        to: customer.email,
        subject: `⏰ ${dueCount > 0 ? 'URGENT: ' : ''}Pengingat Servis Kendaraan - ${customer.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #2563eb; margin-bottom: 5px;">BengkelFantasi Jaya</h1>
              <p style="color: #64748b; font-size: 14px;">Bengkel Terpercaya Anda</p>
            </div>
            
            <div style="background-color: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h2 style="color: #1e293b; margin-bottom: 15px;">Pengingat Servis Berkala Kendaraan</h2>
              
              <p>Halo <strong>${customer.name}</strong>,</p>
              
              <p>Berdasarkan catatan kami, berikut status kendaraan Anda:</p>
              
              ${dueCount > 0 ? `
                <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 12px 15px; margin: 15px 0; border-radius: 4px;">
                  <p style="color: #dc2626; margin: 0; font-weight: bold;">
                    ⚠️ <strong>${dueCount} KENDARAAN SUDAH JATUH TEMPO SERVIS!</strong>
                  </p>
                  <p style="color: #7f1d1d; margin: 5px 0 0 0; font-size: 14px;">
                    Segera hubungi bengkel kami untuk penjadwalan servis.
                  </p>
                </div>
              ` : ''}
              
              ${soonCount > 0 ? `
                <div style="background-color: #fef3c7; border-left: 4px solid #d97706; padding: 12px 15px; margin: 15px 0; border-radius: 4px;">
                  <p style="color: #92400e; margin: 0; font-weight: bold;">
                    📅 <strong>${soonCount} KENDARAAN SEGERA JATUH TEMPO</strong>
                  </p>
                  <p style="color: #78350f; margin: 5px 0 0 0; font-size: 14px;">
                    Waktunya menjadwalkan servis berkala.
                  </p>
                </div>
              ` : ''}
              
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f8fafc; border-radius: 6px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #1e40af; color: white;">
                    <th style="padding: 12px; text-align: left;">Kendaraan</th>
                    <th style="padding: 12px; text-align: left;">Plat</th>
                    <th style="padding: 12px; text-align: left;">Terakhir Servis</th>
                    <th style="padding: 12px; text-align: left;">Interval</th>
                    <th style="padding: 12px; text-align: left;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${vehicles.map(vehicle => {
                    const statusText = vehicle.status === "due" ? 
                      `<span style="color: #dc2626; font-weight: bold;">⏰ JATUH TEMPO</span>` : 
                      `<span style="color: #d97706;">📅 SEGERA</span>`;
                    
                    const lastServiceText = vehicle.lastServiceDate ? 
                      new Date(vehicle.lastServiceDate).toLocaleDateString('id-ID') : 
                      "Belum pernah";
                    
                    const progress = vehicle.lastServiceDate && vehicle.intervalDays ? 
                      Math.min(100, Math.round((vehicle.daysSince! / vehicle.intervalDays) * 100)) : 0;
                    
                    const progressColor = vehicle.status === "due" ? "#dc2626" : "#d97706";
                    
                    return `
                      <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 12px;">${vehicle.brand} ${vehicle.model} (${vehicle.year})</td>
                        <td style="padding: 12px; font-weight: bold;">${vehicle.plate}</td>
                        <td style="padding: 12px;">${lastServiceText}</td>
                        <td style="padding: 12px;">${vehicle.intervalDays} hari</td>
                        <td style="padding: 12px;">
                          ${statusText}
                          ${vehicle.lastServiceDate ? `
                            <div style="margin-top: 5px; font-size: 12px; color: #64748b;">
                              ${vehicle.daysSince} hari sejak servis terakhir (${progress}% dari interval)
                            </div>
                          ` : ''}
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
              
              <div style="background-color: #dbeafe; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #1e40af; margin-top: 0;">🎯 Tindakan yang Disarankan:</h3>
                <ul style="margin: 10px 0; padding-left: 20px; color: #1e293b;">
                  ${dueCount > 0 ? `<li><strong>Hubungi kami segera</strong> untuk servis kendaraan yang sudah jatuh tempo</li>` : ''}
                  ${soonCount > 0 ? `<li><strong>Jadwalkan servis</strong> untuk kendaraan yang segera jatuh tempo</li>` : ''}
                </ul>
              </div>
              
              <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                Servis berkala penting untuk menjaga performa dan keamanan kendaraan Anda, 
                serta menghindari kerusakan yang lebih serius di masa depan.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;">
              
              <div style="text-align: center; color: #64748b; font-size: 12px;">
                <p style="margin: 5px 0;">
                  <strong>Fantasi Jaya Sys</strong><br>
                  Buka: Senin-Jumat 08:00-17:00, Sabtu 08:00-13:00
                </p>
                <p style="margin: 5px 0; font-size: 11px;">
                  Email ini dikirim otomatis. Untuk berhenti menerima email reminder, 
                  <a href="mailto:admin@fantasijayasys.com" style="color: #3b82f6;">hubungi admin</a>.
                </p>
              </div>
            </div>
          </div>
        `,
        text: `Pengingat Servis Kendaraan - ${customer.name}

${dueCount > 0 ? `⚠️ ${dueCount} KENDARAAN SUDAH JATUH TEMPO SERVIS!\nSegera hubungi bengkel kami untuk penjadwalan servis.\n` : ''}
${soonCount > 0 ? `📅 ${soonCount} KENDARAAN SEGERA JATUH TEMPO\nWaktunya menjadwalkan servis berkala.\n` : ''}

DETAIL KENDARAAN:
${vehicles.map(v => `• ${v.brand} ${v.model} (${v.plate})
  - Terakhir servis: ${v.lastServiceDate ? new Date(v.lastServiceDate).toLocaleDateString('id-ID') : 'Belum pernah'}
  - Interval: ${v.intervalDays} hari
  - Status: ${v.status === 'due' ? 'JATUH TEMPO' : 'SEGERA JATUH TEMPO'}
  - ${v.daysSince ? `${v.daysSince} hari sejak servis terakhir` : ''}\n`).join('')}

TINDAKAN YANG DISARANKAN:
${dueCount > 0 ? '• Hubungi kami segera untuk servis kendaraan yang sudah jatuh tempo\n' : ''}
${soonCount > 0 ? '• Jadwalkan servis untuk kendaraan yang segera jatuh tempo\n' : ''}

Servis berkala penting untuk menjaga performa dan keamanan kendaraan Anda.

--
Bengkel Fantasi Jaya 
Email otomatis. Untuk berhenti menerima: hubungi admin@fantasijayasys.com`
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        results.push({ 
          customerId: customer.id,
          customerName: customer.name, 
          email: customer.email, 
          success: true,
          vehiclesCount: vehicles.length,
          dueCount,
          soonCount
        });
        console.log(`✅ Email terkirim ke: ${customer.name} (${customer.email}) - ${vehicles.length} kendaraan`);
      } catch (error: any) {
        results.push({ 
          customerId: customer.id,
          customerName: customer.name, 
          email: customer.email, 
          success: false,
          error: error.message 
        });
        console.error(`❌ Gagal ke ${customer.email}:`, error.message);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalVehicles = vehiclesNeedingAttention.length;
    
    return NextResponse.json({ 
      success: successCount > 0,
      message: `Berhasil mengirim email ke ${successCount} dari ${customersToNotify.length} pelanggan`,
      summary: {
        totalVehicles,
        totalCustomers: customersToNotify.length,
        customersWithEmail: customersToNotify.filter(c => c.customer.email).length,
        sent: successCount,
        failed: results.length - successCount,
        dueVehicles: vehiclesNeedingAttention.filter(v => v.status === "due").length,
        soonVehicles: vehiclesNeedingAttention.filter(v => v.status === "soon").length
      },
      results: results
    });

  } catch (error: any) {
    console.error('❌ Error utama:', error);
    
    // Cek error Gmail
    let errorMessage = 'Gagal mengirim email reminder';
    if (error.code === 'EAUTH') {
      errorMessage = 'Error autentikasi Gmail. Periksa GMAIL_USER dan GMAIL_APP_PASSWORD di .env.local';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Tidak bisa terhubung ke server Gmail. Periksa koneksi internet.';
    } else if (error.message?.includes('prisma')) {
      errorMessage = 'Error database. Pastikan koneksi database berjalan.';
    }
    
    return NextResponse.json({ 
      success: false,
      error: errorMessage,
      details: error.message 
    }, { status: 500 });
  }
}

// Handler untuk GET request
export async function GET() {
  return NextResponse.json({ 
    error: 'Method GET tidak didukung',
    message: 'Gunakan POST request untuk mengirim email reminder',
    example: 'fetch("/api/reminders/send-email", { method: "POST" })'
  }, { status: 405 });
}