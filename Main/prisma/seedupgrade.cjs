// prisma/seed.cjs
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// helper functions
const rand = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Nama-nama khas Indonesia
const namaDepan = [
  "Ahmad", "Muhammad", "Abdul", "Ali", "Budi", "Dewi", "Sari", "Putri",
  "Siti", "Rahmat", "Joko", "Sri", "Rini", "Ayu", "Dian", "Eka",
  "Fajar", "Gita", "Hadi", "Indah", "Johan", "Kartika", "Lestari", "Mega",
  "Nina", "Oki", "Putra", "Rama", "Sinta", "Tono", "Umi", "Wawan", "Yuni", "Zaki"
];

const namaBelakang = [
  "Santoso", "Wijaya", "Saputra", "Hidayat", "Setiawan", "Pratama", "Nugroho",
  "Kurniawan", "Susanto", "Purnomo", "Ramadhani", "Firmansyah", "Maulana",
  "Irawan", "Gunawan", "Hartono", "Kusuma", "Siregar", "Simanjuntak", "Nasution",
  "Sihombing", "Sinaga", "Manalu", "Sitorus", "Purba", "Siregar", "Panggabean",
  "Hutagalung", "Situmorang", "Lumban Tobing", "Lumban Gaol", "Marpaung",
  "Samosir", "Pakpahan", "Ginting", "Tarigan", "Sembiring", "Barus", "Perangin-angin"
];

const generateNamaIndonesia = () => {
  // 80% punya nama belakang, 20% hanya nama depan
  const punyaBelakang = Math.random() < 0.8;
  if (punyaBelakang) {
    return `${pick(namaDepan)} ${pick(namaBelakang)}`;
  } else {
    return `${pick(namaDepan)}`;
  }
};

(async function main() {
  try {
    console.log("🧹 Clearing database...");

    // ======================
    // CLEAR DATA (urut aman)
    // ======================
    // Hapus dalam urutan yang benar (child dulu, parent belakangan)
    await prisma.testingActivity.deleteMany();
    await prisma.taskResult.deleteMany();
    await prisma.sUSAnswer.deleteMany();
    await prisma.uEQAnswer.deleteMany();
    await prisma.survey.deleteMany();
    await prisma.session.deleteMany();
    await prisma.responden.deleteMany();
    await prisma.sUSQuestion.deleteMany();
    await prisma.uEQDimension.deleteMany();
    await prisma.task.deleteMany();
    await prisma.platform.deleteMany();
    await prisma.admin.deleteMany();

    console.log("✅ Database cleared");

    // ======================
    // PLATFORM
    // ======================
    console.log("📱 Creating platforms...");
    const shopee = await prisma.platform.create({
      data: { 
        name: "Shopee"
      },
    });

    const tiktok = await prisma.platform.create({
      data: { 
        name: "TikTok Shop"
      },
    });

    const platforms = [shopee, tiktok];
    console.log(`✅ Platforms created: ${platforms.map(p => p.name).join(', ')}`);

    // ======================
    // ADMIN
    // ======================
    console.log("👤 Creating admin...");
    await prisma.admin.create({
      data: {
        username: "admin",
        password: "admin123"
      },
    });
    console.log("✅ Admin created (username: admin, password: admin123)");

    // ======================
    // TASK (Usability Testing)
    // ======================
    console.log("📋 Creating tasks...");
    const tasksData = [
      {
        namaTask: "Mencari produk",
        deskripsi: "Pengguna diminta mencari produk tertentu menggunakan fitur pencarian."
      },
      {
        namaTask: "Melihat detail produk",
        deskripsi: "Pengguna membuka halaman detail produk untuk melihat harga, deskripsi, dan ulasan."
      },
      {
        namaTask: "Menambahkan ke keranjang",
        deskripsi: "Pengguna menambahkan produk yang dipilih ke dalam keranjang belanja."
      },
      {
        namaTask: "Melakukan checkout",
        deskripsi: "Pengguna melakukan proses checkout hingga tahap konfirmasi pesanan."
      },
      {
        namaTask: "Melacak pesanan",
        deskripsi: "Pengguna melihat status dan informasi pengiriman pesanan."
      },
      {
        namaTask: "Proses Belanja Online",
        deskripsi: "Simulasi proses belanja dari pencarian hingga checkout"
      },
    ];

    for (const taskData of tasksData) {
      await prisma.task.create({
        data: taskData
      });
    }

    const tasks = await prisma.task.findMany();
    const belanjaTask = tasks.find(t => t.namaTask === "Proses Belanja Online");
    console.log(`✅ ${tasks.length} tasks created`);

    // ======================
    // SUS QUESTIONS (10 Standard)
    // ======================
    console.log("❓ Creating SUS questions...");
    const susQuestionsData = [
      { question: "Saya merasa platform ini mudah digunakan", isPositive: true, order: 1 },
      { question: "Saya merasa fitur-fitur pada platform ini bekerja secara konsisten", isPositive: true, order: 2 },
      { question: "Saya merasa platform ini terlalu rumit untuk digunakan", isPositive: false, order: 3 },
      { question: "Saya merasa tidak membutuhkan bantuan orang lain untuk menggunakan platform ini", isPositive: true, order: 4 },
      { question: "Saya merasa fitur pada platform ini saling mendukung satu sama lain", isPositive: true, order: 5 },
      { question: "Saya merasa terdapat ketidakkonsistenan dalam platform ini", isPositive: false, order: 6 },
      { question: "Saya merasa pengguna lain dapat mempelajari platform ini dengan cepat", isPositive: true, order: 7 },
      { question: "Saya merasa platform ini membingungkan", isPositive: false, order: 8 },
      { question: "Saya merasa percaya diri ketika menggunakan platform ini", isPositive: true, order: 9 },
      { question: "Saya membutuhkan banyak waktu untuk memahami cara kerja platform ini", isPositive: false, order: 10 },
    ];

    for (const q of susQuestionsData) {
      await prisma.sUSQuestion.create({
        data: q
      });
    }

    const questions = await prisma.sUSQuestion.findMany();
    console.log(`✅ ${questions.length} SUS questions created`);

    // ======================
    // UEQ DIMENSIONS (13 Standard)
    // ======================
    console.log("📊 Creating UEQ Dimensions...");
    const ueqDimensionsData = [
      { name: "Attractiveness", leftLabel: "Tidak menyenangkan", rightLabel: "Menyenangkan", order: 1 },
      { name: "Perspicuity", leftLabel: "Tidak disukai", rightLabel: "Disukai", order: 2 },
      { name: "Efficiency", leftLabel: "Membosankan", rightLabel: "Menarik", order: 3 },
      { name: "Dependability", leftLabel: "Rumit", rightLabel: "Mudah dipahami", order: 4 },
      { name: "Stimulation", leftLabel: "Tidak logis", rightLabel: "Logis", order: 5 },
      { name: "Novelty", leftLabel: "Tidak efisien", rightLabel: "Efisien", order: 6 },
      { name: "Reliability", leftLabel: "Lambat", rightLabel: "Cepat", order: 7 },
      { name: "Security", leftLabel: "Tidak dapat diandalkan", rightLabel: "Andal", order: 8 },
      { name: "Enjoyment", leftLabel: "Tidak aman", rightLabel: "Aman", order: 9 },
      { name: "Helpfulness", leftLabel: "Tidak memotivasi", rightLabel: "Memotivasi", order: 10 },
      { name: "Usefulness", leftLabel: "Membosankan", rightLabel: "Menginspirasi", order: 11 },
      { name: "Satisfaction", leftLabel: "Biasa saja", rightLabel: "Inovatif", order: 12 },
      { name: "Loyalty", leftLabel: "Konvensional", rightLabel: "Kreatif", order: 13 }
    ];

    for (const dim of ueqDimensionsData) {
      await prisma.uEQDimension.create({
        data: dim
      });
    }

    const ueqDimensions = await prisma.uEQDimension.findMany();
    console.log(`✅ ${ueqDimensions.length} UEQ dimensions created`);

    // ======================
    // RESPONDEN & TASK RESULTS (60 responden)
    // ======================
    console.log("\n👥 Generating respondents...");
    let totalResponden = 0;
    let totalTaskResults = 0;
    const allRespondents = [];

    for (const platform of platforms) {
      console.log(`📝 Creating 30 respondents for ${platform.name}...`);
      
      for (let i = 1; i <= 30; i++) {
        totalResponden++;
        const nama = generateNamaIndonesia();
        
        const responden = await prisma.responden.create({
          data: {
            nama: nama,
            umur: rand(18, 45),
            jenisKelamin: pick(["Laki-laki", "Perempuan"]),
            platformId: platform.id,
            createdAt: new Date(Date.now() - rand(1, 30) * 24 * 60 * 60 * 1000)
          },
        });

        allRespondents.push(responden);

        // ---- Task Results untuk SEMUA TASK ----
        for (const task of tasks) {
          const isSuccess = Math.random() > 0.15;
          const timeOnTask = rand(30, 300);
          const errorCount = isSuccess ? rand(0, 2) : rand(2, 5);
          
          await prisma.taskResult.create({
            data: {
              respondenId: responden.id,
              taskId: task.id,
              success: isSuccess,
              timeOnTask: timeOnTask,
              errorCount: errorCount,
              createdAt: new Date(Date.now() - rand(1, 30) * 24 * 60 * 60 * 1000)
            },
          });
          totalTaskResults++;
        }

        // ---- SUS Answers ----
        const susAnswers = [];
        for (const q of questions) {
          let baseScore;
          if (q.isPositive) {
            baseScore = rand(3, 5);
          } else {
            baseScore = rand(1, 3);
          }
          
          susAnswers.push({
            respondenId: responden.id,
            questionId: q.id,
            score: baseScore
          });
        }
        
        await prisma.sUSAnswer.createMany({
          data: susAnswers
        });

        if (i % 10 === 0) console.log(`   Created ${i} respondents...`);
      }
      
      console.log(`   ✅ Created 30 respondents for ${platform.name}`);
    }

    console.log(`\n✅ Total ${totalResponden} respondents created`);
    console.log(`✅ Total ${totalTaskResults} task results created`);

    // ======================
    // SURVEY DATA (untuk 20 responden terakhir)
    // ======================
    console.log("\n📝 Creating survey data...");
    const pendidikanOptions = ["SMA/Sederajat", "D3", "S1", "S2", "S3"];
    const frekuensiOptions = ["1-3 kali/minggu", "4-6 kali/minggu", "7+ kali/minggu"];
    const platformLainOptions = ["Tokopedia", "Lazada", "Blibli", "Bukalapak", "Shopee", "TikTok Shop"];

    // Ambil 20 responden terakhir untuk survey
    const surveyRespondents = allRespondents.slice(-20);
    let surveyCount = 0;

    for (const respondent of surveyRespondents) {
      surveyCount++;
      
      // Buat session untuk survey
      const sessionId = `SURVEY-${Date.now()}-${respondent.id}`;
      
      const session = await prisma.session.create({
        data: {
          sessionId: sessionId,
          respondenId: respondent.id,
          platformId: respondent.platformId,
          status: "completed",
          startTime: new Date(Date.now() - rand(1, 7) * 24 * 60 * 60 * 1000),
          endTime: new Date(Date.now() - rand(0, 6) * 24 * 60 * 60 * 1000),
          surveyUrl: `http://localhost:3000/survey?session=${sessionId}`,
          activities: [
            { 
              time: new Date(Date.now() - rand(1, 7) * 24 * 60 * 60 * 1000), 
              action: "started_session", 
              details: "Memulai sesi testing" 
            },
            { 
              time: new Date(Date.now() - rand(1, 6) * 24 * 60 * 60 * 1000), 
              action: "completed_task", 
              details: "Menyelesaikan task belanja online" 
            }
          ]
        }
      });

      // Buat task result khusus untuk session ini
      if (belanjaTask) {
        await prisma.taskResult.create({
          data: {
            respondenId: respondent.id,
            taskId: belanjaTask.id,
            sessionId: session.id,
            success: Math.random() > 0.2,
            timeOnTask: rand(60, 300),
            errorCount: rand(0, 3),
            createdAt: session.startTime
          }
        });
        totalTaskResults++;
      }

      // Generate SUS dan UEQ scores
      const susScores = Array(10).fill(0).map(() => rand(1, 5));
      const ueqScores = Array(13).fill(0).map(() => rand(1, 7));
      
      // Hitung SUS score dengan reverse scoring
      const adjustedSUS = susScores.map((score, index) => {
        if ([2, 5, 7, 9].includes(index)) { // Item negatif: 3, 6, 8, 10
          return 6 - score;
        }
        return score;
      });
      
      const susSum = adjustedSUS.reduce((a, b) => a + b, 0);
      const totalSUS = susSum * 2.5;
      const averageUEQ = ueqScores.reduce((a, b) => a + b, 0) / ueqScores.length;

      // Platform lain (tidak boleh sama dengan platform utama)
      const otherPlatforms = platformLainOptions.filter(p => 
        p !== respondent.platform.name
      );

      // Buat survey
      const survey = await prisma.survey.create({
        data: {
          respondenId: respondent.id,
          platformId: respondent.platformId,
          sessionId: sessionId,
          pendidikan: pick(pendidikanOptions),
          frekuensiBeli: pick(frekuensiOptions),
          platformLain: pick(otherPlatforms),
          totalSUS: totalSUS,
          averageUEQ: averageUEQ,
          susRawScores: susScores,
          ueqRawScores: ueqScores,
          isCompleted: true,
          startedAt: session.startTime,
          completedAt: session.endTime
        }
      });

      // Update session dengan surveyId
      await prisma.session.update({
        where: { id: session.id },
        data: { surveyId: survey.id }
      });

      // Buat UEQ Answers
      const ueqAnswersData = ueqScores.map((score, index) => ({
        surveyId: survey.id,
        dimensionId: index + 1,
        score: score
      }));

      await prisma.uEQAnswer.createMany({
        data: ueqAnswersData
      });

      // Tambahkan testing activities
      const activityTypes = [
        { action: "viewed_product", details: "Melihat produk elektronik" },
        { action: "searched", details: "Mencari produk dengan keyword" },
        { action: "added_to_cart", details: "Menambahkan 2 produk ke keranjang" },
        { action: "checked_out", details: "Melakukan checkout dengan metode pembayaran" },
        { action: "filled_survey", details: "Mengisi kuesioner evaluasi" }
      ];

      for (const activity of activityTypes) {
        await prisma.testingActivity.create({
          data: {
            sessionId: session.id,
            action: activity.action,
            details: activity.details,
            timestamp: new Date(session.startTime.getTime() + rand(1, 30) * 60 * 1000)
          }
        });
      }

      if (surveyCount % 5 === 0) console.log(`   Created ${surveyCount} surveys...`);
    }

    console.log(`✅ Created ${surveyCount} complete surveys`);

    // ======================
    // MONITORING SESSIONS (seperti di gambar)
    // ======================
    console.log("\n👁️ Creating monitoring sessions (74 & 740)...");
    
    // Ambil 2 responden untuk monitoring
    const monitoringRespondents = allRespondents.slice(0, 2);
    
    // Session 74 (Shopee)
    const session74 = await prisma.session.create({
      data: {
        sessionId: "74",
        respondenId: monitoringRespondents[0].id,
        platformId: shopee.id,
        status: "active",
        startTime: new Date(Date.now() - 45 * 60 * 1000),
        surveyUrl: "http://localhost:3000/testing/monitor/74",
        activities: [
          { 
            time: new Date(Date.now() - 45 * 60 * 1000), 
            action: "session_started", 
            details: "Memulai testing session" 
          },
          { 
            time: new Date(Date.now() - 40 * 60 * 1000), 
            action: "opened_browser", 
            details: "Microsoft Edge" 
          },
          { 
            time: new Date(Date.now() - 35 * 60 * 1000), 
            action: "searched_web", 
            details: "Google - Basic CSS" 
          },
          { 
            time: new Date(Date.now() - 30 * 60 * 1000), 
            action: "visited_website", 
            details: "STMIK TIME Elearning" 
          },
          { 
            time: new Date(Date.now() - 25 * 60 * 1000), 
            action: "contacted_support", 
            details: "Staff IT (Jarim)" 
          }
        ]
      }
    });

    // Session 740 (TikTok Shop)
    const session740 = await prisma.session.create({
      data: {
        sessionId: "740",
        respondenId: monitoringRespondents[1].id,
        platformId: tiktok.id,
        status: "active",
        startTime: new Date(Date.now() - 60 * 60 * 1000),
        surveyUrl: "http://localhost:3000/testing/monitor/740",
        activities: [
          { 
            time: new Date(Date.now() - 60 * 60 * 1000), 
            action: "session_started", 
            details: "Pengembangan Aplikasi Penelitian" 
          },
          { 
            time: new Date(Date.now() - 55 * 60 * 1000), 
            action: "opened_app", 
            details: "WhatsApp" 
          },
          { 
            time: new Date(Date.now() - 50 * 60 * 1000), 
            action: "testing_task", 
            details: "Melakukan testing fitur checkout" 
          }
        ]
      }
    });

    // Buat task results untuk monitoring sessions
    await prisma.taskResult.create({
      data: {
        respondenId: monitoringRespondents[0].id,
        taskId: belanjaTask.id,
        sessionId: session74.id,
        success: true,
        timeOnTask: 180.5,
        errorCount: 1,
        createdAt: session74.startTime
      }
    });

    await prisma.taskResult.create({
      data: {
        respondenId: monitoringRespondents[1].id,
        taskId: belanjaTask.id,
        sessionId: session740.id,
        success: false,
        timeOnTask: 240.2,
        errorCount: 3,
        createdAt: session740.startTime
      }
    });

    totalTaskResults += 2;

    // Tambahkan testing activities untuk monitoring
    const monitoringActivities = [
      { sessionId: session74.id, action: "whatsapp_used", details: "Mengirim pesan via WhatsApp" },
      { sessionId: session74.id, action: "research_done", details: "Membaca dokumentasi CSS" },
      { sessionId: session740.id, action: "testing_continued", details: "Melanjutkan testing aplikasi" },
      { sessionId: session740.id, action: "form_submitted", details: "Mengirim data testing" }
    ];

    for (const activity of monitoringActivities) {
      await prisma.testingActivity.create({
        data: {
          ...activity,
          timestamp: new Date(Date.now() - rand(10, 40) * 60 * 1000)
        }
      });
    }

    console.log("✅ Created monitoring sessions 74 & 740");

    // ======================
    // FINAL STATISTICS
    // ======================
    console.log("\n" + "=".repeat(60));
    console.log("📊 DATABASE SEED COMPLETED - FINAL STATISTICS");
    console.log("=".repeat(60));
    
    // Hitung semua stats
    const totalSurveys = await prisma.survey.count();
    const totalSessions = await prisma.session.count();
    const totalActivities = await prisma.testingActivity.count();
    const totalUEQAnswers = await prisma.uEQAnswer.count();
    const totalSUSAnswers = await prisma.sUSAnswer.count();
    
    // Statistik SUS
    const surveys = await prisma.survey.findMany({
      where: { totalSUS: { not: null } }
    });
    const avgSUS = surveys.length > 0 
      ? surveys.reduce((sum, s) => sum + (s.totalSUS || 0), 0) / surveys.length 
      : 0;
    
    // Statistik UEQ
    const avgUEQ = surveys.length > 0
      ? surveys.reduce((sum, s) => sum + (s.averageUEQ || 0), 0) / surveys.length
      : 0;
    
    // Statistik Task
    const taskStats = await prisma.taskResult.groupBy({
      by: ['success'],
      _count: { success: true }
    });
    
    const successCount = taskStats.find(t => t.success)?._count?.success || 0;
    const failCount = taskStats.find(t => !t.success)?._count?.success || 0;
    const totalTasks = successCount + failCount;
    const successRate = totalTasks > 0 ? (successCount / totalTasks * 100) : 0;

    // Tampilkan stats
    console.log(`👥 RESPONDENTS: ${totalResponden} orang`);
    console.log(`   - Shopee: 30 orang`);
    console.log(`   - TikTok Shop: 30 orang`);
    
    console.log(`\n📊 SURVEY DATA:`);
    console.log(`   - Surveys Completed: ${totalSurveys}`);
    console.log(`   - Average SUS Score: ${avgSUS.toFixed(1)}/100`);
    console.log(`   - Average UEQ Score: ${avgUEQ.toFixed(1)}/7`);
    
    console.log(`\n🎯 TESTING DATA:`);
    console.log(`   - Tasks: ${tasks.length} jenis task`);
    console.log(`   - Task Results: ${totalTaskResults} records`);
    console.log(`   - Success Rate: ${successRate.toFixed(1)}%`);
    
    console.log(`\n🔧 SYSTEM DATA:`);
    console.log(`   - SUS Questions: ${questions.length}`);
    console.log(`   - UEQ Dimensions: ${ueqDimensions.length}`);
    console.log(`   - Sessions: ${totalSessions}`);
    console.log(`   - Activities: ${totalActivities}`);
    console.log(`   - SUS Answers: ${totalSUSAnswers}`);
    console.log(`   - UEQ Answers: ${totalUEQAnswers}`);
    
    // SUS Interpretation
    let susRating = "Poor";
    let susColor = "🔴";
    if (avgSUS >= 85) { susRating = "Excellent"; susColor = "🟢"; }
    else if (avgSUS >= 70) { susRating = "Good"; susColor = "🟡"; }
    else if (avgSUS >= 50) { susRating = "OK"; susColor = "🟠"; }
    
    console.log(`\n📈 SUS INTERPRETATION: ${susColor} ${susRating}`);
    console.log(`   Excellent (85-100) | Good (70-84) | OK (50-69) | Poor (0-49)`);
    
    console.log(`\n🔗 IMPORTANT LINKS:`);
    console.log(`   - Monitoring Session 74: http://localhost:3000/testing/monitor/74`);
    console.log(`   - Monitoring Session 740: http://localhost:3000/testing/monitor/740`);
    console.log(`   - Survey Example: http://localhost:3000/survey?session=SURVEY-[id]`);
    
    console.log(`\n🔐 ADMIN LOGIN:`);
    console.log(`   - Username: admin`);
    console.log(`   - Password: admin123`);
    
    // Sample data preview
    console.log(`\n👁️ SAMPLE DATA PREVIEW:`);
    console.log(`-`.repeat(40));
    
    const sampleSurvey = await prisma.survey.findFirst({
      include: {
        responden: true,
        platform: true
      }
    });
    
    if (sampleSurvey) {
      console.log(`Survey ID: ${sampleSurvey.id}`);
      console.log(`Responden: ${sampleSurvey.responden.nama} (${sampleSurvey.responden.jenisKelamin}, ${sampleSurvey.responden.umur} tahun)`);
      console.log(`Platform: ${sampleSurvey.platform.name}`);
      console.log(`SUS Score: ${sampleSurvey.totalSUS?.toFixed(1)}`);
      console.log(`UEQ Average: ${sampleSurvey.averageUEQ?.toFixed(1)}`);
      console.log(`Pendidikan: ${sampleSurvey.pendidikan}`);
      console.log(`Frekuensi Beli: ${sampleSurvey.frekuensiBeli}`);
    }
    
    const sampleSession = await prisma.session.findFirst({
      where: { sessionId: "74" },
      include: {
        responden: true,
        platform: true
      }
    });
    
    if (sampleSession) {
      console.log(`\nMonitoring Session 74:`);
      console.log(`Responden: ${sampleSession.responden.nama}`);
      console.log(`Status: ${sampleSession.status}`);
      console.log(`Platform: ${sampleSession.platform.name}`);
      console.log(`Start Time: ${sampleSession.startTime?.toLocaleTimeString()}`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("🚀 SEED COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log("\nSelamat! Database siap digunakan dengan:");
    console.log("- 60 responden (30 Shopee + 30 TikTok Shop)");
    console.log("- 6 task usability testing");
    console.log("- 20 survey lengkap dengan SUS & UEQ");
    console.log("- 2 monitoring sessions aktif");
    console.log("\nJalankan: npm run dev untuk memulai aplikasi");
    
  } catch (error) {
    console.error("❌ ERROR DURING SEED:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
