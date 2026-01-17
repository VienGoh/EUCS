const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

// Fungsi untuk generate data tanpa faker.js
function generateIndonesianName(gender) {
  const maleNames = [
    'Ahmad', 'Budi', 'Joko', 'Agus', 'Dwi', 'Hadi', 'Rudi', 'Eko', 'Feri', 'Gunawan',
    'Hendra', 'Iwan', 'Joni', 'Kurniawan', 'Lukman', 'Mulyadi', 'Nugroho', 'Oki', 'Prasetyo', 'Rahmat',
    'Surya', 'Tri', 'Umar', 'Wahyudi', 'Yanto', 'Zainal', 'Arief', 'Bayu', 'Cahyo', 'Dedi',
    'Eri', 'Fajar', 'Galih', 'Haris', 'Indra', 'Jaya', 'Kusuma', 'Lestari', 'Maulana', 'Nanda'
  ]
  
  const femaleNames = [
    'Siti', 'Desi', 'Rini', 'Dewi', 'Ani', 'Sri', 'Yuni', 'Maya', 'Nur', 'Lina',
    'Rina', 'Sari', 'Diana', 'Eka', 'Fitri', 'Gita', 'Hani', 'Intan', 'Juli', 'Kartika',
    'Linda', 'Mira', 'Nina', 'Oki', 'Putri', 'Rahma', 'Siska', 'Tika', 'Utami', 'Vina',
    'Wati', 'Yulia', 'Zahra', 'Ayu', 'Bunga', 'Cici', 'Dinda', 'Elsa', 'Fani', 'Gina'
  ]
  
  const surnames = [
    'Santoso', 'Wijaya', 'Pratama', 'Setiawan', 'Kusuma', 'Haryanto', 'Saputra', 'Purnama', 'Nugroho', 'Halim',
    'Susanto', 'Wibowo', 'Hakim', 'Siregar', 'Nasution', 'Simanjuntak', 'Hutagalung', 'Sihombing', 'Situmorang', 'Lubis',
    'Harahap', 'Rambe', 'Ginting', 'Sembiring', 'Peranginangin', 'Tarigan', 'Kaban', 'Manalu', 'Nababan', 'Siahaan',
    'Pardede', 'Silalahi', 'Sinaga', 'Sirait', 'Hutapea', 'Pangaribuan', 'Marpaung', 'Pakpahan', 'Sitorus', 'Purba'
  ]
  
  const firstName = gender === 'Laki-laki' 
    ? maleNames[Math.floor(Math.random() * maleNames.length)]
    : femaleNames[Math.floor(Math.random() * femaleNames.length)]
  
  const lastName = surnames[Math.floor(Math.random() * surnames.length)]
  
  return `${firstName} ${lastName}`
}

function generateEmail(name) {
  const cleanName = name.toLowerCase().replace(/\s+/g, '.')
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'ymail.com']
  const domain = domains[Math.floor(Math.random() * domains.length)]
  return `${cleanName}${Math.floor(Math.random() * 99) + 1}@${domain}`
}

function generateIndonesianPhone() {
  const prefixes = ['0812', '0813', '0814', '0815', '0816', '0817', '0818', '0819', '0852', '0853', '0855', '0856', '0857', '0858', '0877', '0878', '0881', '0882', '0883', '0884', '0885', '0886', '0887', '0888', '0889']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  let suffix = ''
  for (let i = 0; i < 8; i++) {
    suffix += Math.floor(Math.random() * 10)
  }
  return `${prefix}${suffix}`
}

function generateOccupation() {
  const occupations = [
    'Mahasiswa', 'Pegawai Swasta', 'Wiraswasta', 'PNS', 'Guru', 'Dosen', 'Dokter', 'Perawat',
    'Pengusaha', 'Freelancer', 'Karyawan BUMN', 'Buruh', 'Petani', 'Nelayan', 'Pedagang',
    'Konsultan', 'Programmer', 'Desainer', 'Marketing', 'Akuntan', 'Pengacara', 'Arsitek',
    'Peneliti', 'Jurnalis', 'Artis', 'Musisi', 'Atlet', 'Pilot', 'Pramugari', 'Polisi',
    'Tentara', 'Sopir', 'Koki', 'Bartender', 'Penata Rambut', 'Makeup Artist'
  ]
  return occupations[Math.floor(Math.random() * occupations.length)]
}

function generateEducation() {
  const educations = ['SMP', 'SMA', 'D1', 'D2', 'D3', 'S1', 'S2', 'S3']
  return educations[Math.floor(Math.random() * educations.length)]
}

function generateIncomeRange() {
  const ranges = ['< 3jt', '3-5jt', '5-10jt', '> 10jt']
  return ranges[Math.floor(Math.random() * ranges.length)]
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

async function main() {
  console.log('🌱 Seeding database EUCS TikTok Shop (50 data)...')
  
  try {
    // ====================
    // 1. DELETE SEMUA DATA (URUTAN PENTING)
    // ====================
    console.log('🧹 Cleaning existing data...')
    
    // Hapus child tables dulu
    await prisma.regression.deleteMany({})
    await prisma.validityReliability.deleteMany({})
    await prisma.export.deleteMany({})
    await prisma.visualization.deleteMany({})
    await prisma.analysis.deleteMany({})
    await prisma.answer.deleteMany({})
    await prisma.survey.deleteMany({})
    await prisma.question.deleteMany({})
    await prisma.dimension.deleteMany({})
    await prisma.respondent.deleteMany({})
    await prisma.user.deleteMany({})
    
    console.log('✅ Database cleaned')
    
    // ====================
    // 2. CREATE USERS
    // ====================
    console.log('👤 Creating users...')
    
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const users = [
      {
        email: 'jessica@stmiktime.ac.id',
        password: hashedPassword,
        name: 'Jessica',
        role: 'RESEARCHER'
      },
      {
        email: 'admin@eucs.com',
        password: hashedPassword,
        name: 'Admin',
        role: 'ADMIN'
      }
    ]
    
    for (const userData of users) {
      await prisma.user.create({
        data: userData
      })
    }
    
    const researcher = await prisma.user.findUnique({
      where: { email: 'jessica@stmiktime.ac.id' }
    })
    
    console.log('✅ Users created')
    
    // ====================
    // 3. CREATE DIMENSIONS
    // ====================
    console.log('📊 Creating EUCS dimensions...')
    
    const dimensions = [
      {
        name: 'Content',
        description: 'Kualitas, kelengkapan, dan relevansi informasi produk',
        indicators: JSON.stringify(['Relevansi informasi', 'Kelengkapan informasi', 'Kejelasan informasi', 'Konsistensi konten', 'Keterkinian konten'])
      },
      {
        name: 'Accuracy',
        description: 'Ketepatan dan kebenaran data yang dihasilkan sistem',
        indicators: JSON.stringify(['Ketepatan data', 'Keandalan sistem', 'Ketepatan harga', 'Kejujuran ulasan'])
      },
      {
        name: 'Format',
        description: 'Cara informasi ditampilkan dan struktur antarmuka',
        indicators: JSON.stringify(['Tata letak antarmuka', 'Kejelasan visual', 'Struktur menu', 'Estetika tampilan'])
      },
      {
        name: 'EaseOfUse',
        description: 'Kemudahan penggunaan sistem',
        indicators: JSON.stringify(['Kemudahan navigasi', 'Kemudahan transaksi', 'Interaktivitas', 'Kecepatan pembelajaran'])
      },
      {
        name: 'Timeliness',
        description: 'Kecepatan sistem dalam memberikan respons',
        indicators: JSON.stringify(['Kecepatan respons', 'Ketepatan notifikasi', 'Kelancaran akses', 'Ketepatan pembaruan'])
      },
      {
        name: 'Loyalty',
        description: 'Loyalitas pengguna terhadap TikTok Shop',
        indicators: JSON.stringify(['Niat beli ulang', 'Rekomendasi ke orang lain', 'Kepuasan umum', 'Keengganan berpindah platform', 'Keterikatan emosional', 'Kepercayaan sistem'])
      }
    ]
    
    const createdDimensions = []
    for (const dim of dimensions) {
      const dimension = await prisma.dimension.create({
        data: dim
      })
      createdDimensions.push(dimension)
    }
    
    console.log('✅ Dimensions created')
    
    // ====================
    // 4. CREATE QUESTIONS
    // ====================
    console.log('❓ Creating questions...')
    
    const questions = [
      // Content - 5 questions
      { code: 'Q1', text: 'Informasi produk di TikTok Shop sesuai dengan kebutuhan saya.', indicator: 'Relevansi informasi', dimensionName: 'Content', order: 1 },
      { code: 'Q2', text: 'TikTok Shop menampilkan informasi produk secara lengkap (deskripsi, harga, ulasan, dan foto).', indicator: 'Kelengkapan informasi', dimensionName: 'Content', order: 2 },
      { code: 'Q3', text: 'Informasi yang ditampilkan di TikTok Shop mudah dipahami.', indicator: 'Kejelasan informasi', dimensionName: 'Content', order: 3 },
      { code: 'Q4', text: 'Informasi produk yang ditampilkan di berbagai halaman aplikasi bersifat konsisten.', indicator: 'Konsistensi konten', dimensionName: 'Content', order: 4 },
      { code: 'Q5', text: 'Konten promosi dan rekomendasi produk selalu diperbarui secara rutin.', indicator: 'Keterkinian konten', dimensionName: 'Content', order: 5 },
      
      // Accuracy - 4 questions
      { code: 'Q6', text: 'Deskripsi produk di TikTok Shop sesuai dengan barang yang diterima.', indicator: 'Ketepatan data', dimensionName: 'Accuracy', order: 6 },
      { code: 'Q7', text: 'Sistem rekomendasi produk di TikTok Shop menampilkan hasil yang akurat sesuai minat saya.', indicator: 'Keandalan sistem', dimensionName: 'Accuracy', order: 7 },
      { code: 'Q8', text: 'Harga yang tertera sesuai dengan harga akhir saat transaksi.', indicator: 'Ketepatan harga', dimensionName: 'Accuracy', order: 8 },
      { code: 'Q9', text: 'Ulasan dan rating pengguna di TikTok Shop mencerminkan pengalaman sebenarnya.', indicator: 'Kejujuran ulasan', dimensionName: 'Accuracy', order: 9 },
      
      // Format - 4 questions
      { code: 'Q10', text: 'Tampilan halaman TikTok Shop tersusun rapi dan mudah dibaca.', indicator: 'Tata letak antarmuka', dimensionName: 'Format', order: 10 },
      { code: 'Q11', text: 'Warna, ikon, dan font yang digunakan memudahkan saya memahami informasi.', indicator: 'Kejelasan visual', dimensionName: 'Format', order: 11 },
      { code: 'Q12', text: 'Menu navigasi pada aplikasi TikTok Shop mudah diikuti.', indicator: 'Struktur menu', dimensionName: 'Format', order: 12 },
      { code: 'Q13', text: 'Desain aplikasi TikTok Shop menarik dan tidak membingungkan.', indicator: 'Estetika tampilan', dimensionName: 'Format', order: 13 },
      
      // EaseOfUse - 4 questions
      { code: 'Q14', text: 'Saya mudah menemukan produk yang saya cari di TikTok Shop.', indicator: 'Kemudahan navigasi', dimensionName: 'EaseOfUse', order: 14 },
      { code: 'Q15', text: 'Proses pembelian di TikTok Shop mudah dan tidak memerlukan waktu lama.', indicator: 'Kemudahan transaksi', dimensionName: 'EaseOfUse', order: 15 },
      { code: 'Q16', text: 'Fitur-fitur dalam aplikasi TikTok Shop mudah digunakan tanpa bantuan orang lain.', indicator: 'Interaktivitas', dimensionName: 'EaseOfUse', order: 16 },
      { code: 'Q17', text: 'Saya dapat memahami cara menggunakan TikTok Shop tanpa perlu panduan khusus.', indicator: 'Kecepatan pembelajaran', dimensionName: 'EaseOfUse', order: 17 },
      
      // Timeliness - 4 questions
      { code: 'Q18', text: 'Aplikasi TikTok Shop cepat menampilkan hasil pencarian produk.', indicator: 'Kecepatan respons', dimensionName: 'Timeliness', order: 18 },
      { code: 'Q19', text: 'Notifikasi promosi dan penawaran dikirim tepat waktu.', indicator: 'Ketepatan notifikasi', dimensionName: 'Timeliness', order: 19 },
      { code: 'Q20', text: 'Aplikasi TikTok Shop jarang mengalami gangguan saat digunakan.', indicator: 'Kelancaran akses', dimensionName: 'Timeliness', order: 20 },
      { code: 'Q21', text: 'Informasi stok dan ketersediaan produk selalu diperbarui secara real time.', indicator: 'Ketepatan pembaruan', dimensionName: 'Timeliness', order: 21 },
      
      // Loyalty - 6 questions
      { code: 'L1', text: 'Saya berniat berbelanja lagi di TikTok Shop pada kesempatan berikutnya.', indicator: 'Niat beli ulang', dimensionName: 'Loyalty', order: 22 },
      { code: 'L2', text: 'Saya akan merekomendasikan TikTok Shop kepada orang lain.', indicator: 'Rekomendasi ke orang lain', dimensionName: 'Loyalty', order: 23 },
      { code: 'L3', text: 'Saya merasa puas berbelanja di TikTok Shop.', indicator: 'Kepuasan umum', dimensionName: 'Loyalty', order: 24 },
      { code: 'L4', text: 'Saya lebih memilih tetap menggunakan TikTok Shop dibanding platform lain.', indicator: 'Keengganan berpindah platform', dimensionName: 'Loyalty', order: 25 },
      { code: 'L5', text: 'Saya merasa TikTok Shop memahami kebutuhan dan preferensi saya.', indicator: 'Keterikatan emosional', dimensionName: 'Loyalty', order: 26 },
      { code: 'L6', text: 'Saya merasa TikTok Shop memiliki kinerja sistem yang stabil dan handal.', indicator: 'Kepercayaan sistem', dimensionName: 'Loyalty', order: 27 }
    ]
    
    const createdQuestions = []
    for (const q of questions) {
      const dimension = createdDimensions.find(d => d.name === q.dimensionName)
      if (dimension) {
        const question = await prisma.question.create({
          data: {
            code: q.code,
            text: q.text,
            indicator: q.indicator,
            order: q.order,
            dimensionId: dimension.id
          }
        })
        createdQuestions.push(question)
      }
    }
    
    console.log(`✅ ${createdQuestions.length} questions created`)
    
    // ====================
    // 5. CREATE 50 RESPONDENTS
    // ====================
    console.log('👥 Creating 50 respondents...')
    
    const createdRespondents = []
    for (let i = 0; i < 50; i++) {
      const gender = Math.random() > 0.5 ? 'Laki-laki' : 'Perempuan'
      const name = generateIndonesianName(gender)
      
      const respondentData = {
        name: name,
        age: Math.floor(Math.random() * (50 - 18 + 1)) + 18, // 18-50
        gender: gender,
        email: generateEmail(name),
        phone: generateIndonesianPhone(),
        occupation: generateOccupation(),
        education: generateEducation(),
        incomeRange: generateIncomeRange(),
        tiktokUsage: Math.floor(Math.random() * 5) + 1, // 1-5
        tiktokShopUsage: Math.floor(Math.random() * 5) + 1, // 1-5
        lastPurchase: randomDate(new Date('2023-06-01'), new Date('2024-01-30'))
      }
      
      const respondent = await prisma.respondent.create({
        data: respondentData
      })
      createdRespondents.push(respondent)
      
      // Show progress
      if ((i + 1) % 10 === 0) {
        console.log(`   Created ${i + 1} respondents...`)
      }
    }
    
    console.log(`✅ ${createdRespondents.length} respondents created`)
    
    // ====================
    // 6. CREATE SURVEYS & ANSWERS
    // ====================
    console.log('📝 Creating surveys and answers...')
    
    let surveyCounter = 0
    let allDimensionScores = {
      content: [],
      accuracy: [],
      format: [],
      easeOfUse: [],
      timeliness: [],
      loyalty: []
    }
    
    for (const respondent of createdRespondents) {
      surveyCounter++
      
      // Create survey
      const survey = await prisma.survey.create({
        data: {
          respondentId: respondent.id,
          researcherId: researcher.id,
          completed: true,
          completedAt: randomDate(new Date('2024-01-01'), new Date('2024-01-30'))
        }
      })
      
      // Create answers for each question
      const answersData = []
      
      // Generate lebih realistis: responden yang aktif di TikTok Shop cenderung memberikan nilai lebih tinggi
      const tiktokShopUsageFactor = respondent.tiktokShopUsage / 5 // Normalize to 0.2-1.0
      
      for (const question of createdQuestions) {
        let baseValue
        
        // Adjust base value based on dimension and question type
        const dimension = createdDimensions.find(d => d.id === question.dimensionId)
        
        if (dimension.name === 'Loyalty') {
          // Loyalty questions tend to have slightly lower scores
          baseValue = 3 + (tiktokShopUsageFactor * 1.5) // 3.3 - 4.5
        } else if (dimension.name === 'EaseOfUse') {
          // Ease of Use usually gets higher scores
          baseValue = 3.5 + (tiktokShopUsageFactor * 1.3) // 3.8 - 4.8
        } else if (dimension.name === 'Format') {
          // Format/appearance gets decent scores
          baseValue = 3.3 + (tiktokShopUsageFactor * 1.4) // 3.6 - 4.7
        } else {
          // Other dimensions
          baseValue = 3.2 + (tiktokShopUsageFactor * 1.5) // 3.5 - 4.7
        }
        
        // Add some randomness (±0.8)
        const randomFactor = (Math.random() * 1.6) - 0.8
        let value = Math.round(baseValue + randomFactor)
        
        // Ensure value is between 1-5
        value = Math.max(1, Math.min(5, value))
        
        answersData.push({
          surveyId: survey.id,
          questionId: question.id,
          value: value
        })
      }
      
      await prisma.answer.createMany({
        data: answersData
      })
      
      // Calculate average scores per dimension
      const dimensionScores = {}
      for (const answer of answersData) {
        const question = createdQuestions.find(q => q.id === answer.questionId)
        const dimension = createdDimensions.find(d => d.id === question.dimensionId)
        
        if (!dimensionScores[dimension.name]) {
          dimensionScores[dimension.name] = { total: 0, count: 0 }
        }
        dimensionScores[dimension.name].total += answer.value
        dimensionScores[dimension.name].count += 1
      }
      
      // Store dimension scores for later calculation
      allDimensionScores.content.push(dimensionScores['Content'] ? dimensionScores['Content'].total / dimensionScores['Content'].count : 0)
      allDimensionScores.accuracy.push(dimensionScores['Accuracy'] ? dimensionScores['Accuracy'].total / dimensionScores['Accuracy'].count : 0)
      allDimensionScores.format.push(dimensionScores['Format'] ? dimensionScores['Format'].total / dimensionScores['Format'].count : 0)
      allDimensionScores.easeOfUse.push(dimensionScores['EaseOfUse'] ? dimensionScores['EaseOfUse'].total / dimensionScores['EaseOfUse'].count : 0)
      allDimensionScores.timeliness.push(dimensionScores['Timeliness'] ? dimensionScores['Timeliness'].total / dimensionScores['Timeliness'].count : 0)
      allDimensionScores.loyalty.push(dimensionScores['Loyalty'] ? dimensionScores['Loyalty'].total / dimensionScores['Loyalty'].count : 0)
      
      // Create analysis
      const analysisData = {
        surveyId: survey.id,
        content: dimensionScores['Content'] ? parseFloat((dimensionScores['Content'].total / dimensionScores['Content'].count).toFixed(2)) : 0,
        accuracy: dimensionScores['Accuracy'] ? parseFloat((dimensionScores['Accuracy'].total / dimensionScores['Accuracy'].count).toFixed(2)) : 0,
        format: dimensionScores['Format'] ? parseFloat((dimensionScores['Format'].total / dimensionScores['Format'].count).toFixed(2)) : 0,
        easeOfUse: dimensionScores['EaseOfUse'] ? parseFloat((dimensionScores['EaseOfUse'].total / dimensionScores['EaseOfUse'].count).toFixed(2)) : 0,
        timeliness: dimensionScores['Timeliness'] ? parseFloat((dimensionScores['Timeliness'].total / dimensionScores['Timeliness'].count).toFixed(2)) : 0,
        loyalty: dimensionScores['Loyalty'] ? parseFloat((dimensionScores['Loyalty'].total / dimensionScores['Loyalty'].count).toFixed(2)) : 0
      }
      
      // Calculate total score
      const scores = [
        analysisData.content,
        analysisData.accuracy,
        analysisData.format,
        analysisData.easeOfUse,
        analysisData.timeliness,
        analysisData.loyalty
      ].filter(score => score > 0)
      
      analysisData.totalScore = scores.length > 0 
        ? parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2))
        : 0
      
      await prisma.analysis.create({
        data: analysisData
      })
      
      // Show progress
      if (surveyCounter % 10 === 0) {
        console.log(`   Created ${surveyCounter} surveys...`)
      }
    }
    
    console.log('✅ Surveys and answers created')
    
    // ====================
    // 7. CREATE VALIDITY & RELIABILITY DATA
    // ====================
    console.log('📈 Creating validity & reliability data...')
    
    for (const question of createdQuestions.slice(0, 10)) {
      await prisma.validityReliability.create({
        data: {
          questionId: question.id,
          rHitung: parseFloat((Math.random() * 0.3 + 0.5).toFixed(3)), // 0.5-0.8
          rTabel: 0.361,
          status: Math.random() > 0.15 ? 'Valid' : 'Tidak Valid',
          cronbachAlpha: parseFloat((0.7 + Math.random() * 0.25).toFixed(3)), // 0.7-0.95
          cronbachStatus: Math.random() > 0.05 ? 'Reliabel' : 'Cukup'
        }
      })
    }
    
    console.log('✅ Validity & reliability data created')
    
    // ====================
    // 8. CREATE REGRESSION DATA (dengan 50 data, hasil akan lebih akurat)
    // ====================
    console.log('📊 Creating regression analysis...')
    
    const regressionData = [
      { dimension: 'Content', coefficient: 0.42, tValue: 3.85, pValue: 0.0002, significance: 'Signifikan', rSquared: 0.71, adjustedRSquared: 0.69 },
      { dimension: 'Accuracy', coefficient: 0.38, tValue: 3.45, pValue: 0.0008, significance: 'Signifikan', rSquared: 0.65, adjustedRSquared: 0.63 },
      { dimension: 'Format', coefficient: 0.35, tValue: 2.98, pValue: 0.004, significance: 'Signifikan', rSquared: 0.58, adjustedRSquared: 0.56 },
      { dimension: 'EaseOfUse', coefficient: 0.51, tValue: 4.25, pValue: 0.0001, significance: 'Signifikan', rSquared: 0.75, adjustedRSquared: 0.73 },
      { dimension: 'Timeliness', coefficient: 0.32, tValue: 2.75, pValue: 0.007, significance: 'Signifikan', rSquared: 0.61, adjustedRSquared: 0.59 }
    ]
    
    for (const reg of regressionData) {
      await prisma.regression.create({
        data: reg
      })
    }
    
    console.log('✅ Regression data created')
    
    // ====================
    // 9. CREATE VISUALIZATION DATA (update dengan data dari 50 responden)
    // ====================
    console.log('📊 Creating visualization data...')
    
    // Calculate averages from all dimension scores
    const calculateAverage = (arr) => {
      if (arr.length === 0) return 0
      const sum = arr.reduce((a, b) => a + b, 0)
      return parseFloat((sum / arr.length).toFixed(2))
    }
    
    const contentAvg = calculateAverage(allDimensionScores.content)
    const accuracyAvg = calculateAverage(allDimensionScores.accuracy)
    const formatAvg = calculateAverage(allDimensionScores.format)
    const easeOfUseAvg = calculateAverage(allDimensionScores.easeOfUse)
    const timelinessAvg = calculateAverage(allDimensionScores.timeliness)
    const loyaltyAvg = calculateAverage(allDimensionScores.loyalty)
    
    const visualizationData = {
      labels: ['Content', 'Accuracy', 'Format', 'EaseOfUse', 'Timeliness', 'Loyalty'],
      datasets: [
        {
          label: 'Skor Rata-rata (50 Responden)',
          data: [contentAvg, accuracyAvg, formatAvg, easeOfUseAvg, timelinessAvg, loyaltyAvg],
          backgroundColor: [
            'rgba(59, 130, 246, 0.5)',
            'rgba(16, 185, 129, 0.5)',
            'rgba(139, 92, 246, 0.5)',
            'rgba(245, 158, 11, 0.5)',
            'rgba(239, 68, 68, 0.5)',
            'rgba(236, 72, 153, 0.5)'
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(16, 185, 129)',
            'rgb(139, 92, 246)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)',
            'rgb(236, 72, 153)'
          ],
          borderWidth: 2
        }
      ]
    }
    
    await prisma.visualization.create({
      data: {
        type: 'BAR',
        data: visualizationData,
        title: 'Skor Rata-rata Dimensi EUCS (50 Responden)'
      }
    })
    
    console.log('✅ Visualization data created')
    
    // ====================
    // SUMMARY
    // ====================
    console.log('\n🎉 Seeding completed successfully!')
    console.log('=========================================')
    console.log('📊 Database Summary:')
    console.log(`   👤 Users: 2 (1 Researcher, 1 Admin)`)
    console.log(`   📊 Dimensions: ${createdDimensions.length}`)
    console.log(`   ❓ Questions: ${createdQuestions.length}`)
    console.log(`   👥 Respondents: ${createdRespondents.length}`)
    console.log(`   📝 Surveys: ${createdRespondents.length}`)
    console.log(`   📊 Total Answers: ${createdQuestions.length * createdRespondents.length}`)
    console.log(`   ✅ Validity Data: 10 items`)
    console.log(`   📈 Regression Data: 5 items`)
    console.log(`   📊 Average Scores:`)
    console.log(`      Content: ${contentAvg}`)
    console.log(`      Accuracy: ${accuracyAvg}`)
    console.log(`      Format: ${formatAvg}`)
    console.log(`      EaseOfUse: ${easeOfUseAvg}`)
    console.log(`      Timeliness: ${timelinessAvg}`)
    console.log(`      Loyalty: ${loyaltyAvg}`)
    console.log('\n🔑 Login Credentials:')
    console.log('   Email: jessica@stmiktime.ac.id')
    console.log('   Password: admin123')
    console.log('=========================================\n')
    
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })