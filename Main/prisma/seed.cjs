const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database EUCS TikTok Shop...')
  
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
    // 5. CREATE RESPONDENTS
    // ====================
    console.log('👥 Creating respondents...')
    
    const respondents = [
      { name: 'Ahmad Fauzi', age: 22, gender: 'Laki-laki', email: 'ahmad@gmail.com', phone: '081234567890', occupation: 'Mahasiswa', education: 'S1', incomeRange: '< 3jt', tiktokUsage: 5, tiktokShopUsage: 4, lastPurchase: new Date('2024-01-15') },
      { name: 'Siti Nurhaliza', age: 25, gender: 'Perempuan', email: 'siti@gmail.com', phone: '081298765432', occupation: 'Pegawai Swasta', education: 'S1', incomeRange: '3-5jt', tiktokUsage: 4, tiktokShopUsage: 5, lastPurchase: new Date('2024-01-20') },
      { name: 'Budi Santoso', age: 30, gender: 'Laki-laki', email: 'budi@gmail.com', phone: '081312345678', occupation: 'Wiraswasta', education: 'SMA', incomeRange: '5-10jt', tiktokUsage: 3, tiktokShopUsage: 3, lastPurchase: new Date('2024-01-10') },
      { name: 'Maya Sari', age: 28, gender: 'Perempuan', email: 'maya@gmail.com', phone: '081323456789', occupation: 'Guru', education: 'S1', incomeRange: '3-5jt', tiktokUsage: 5, tiktokShopUsage: 4, lastPurchase: new Date('2024-01-18') },
      { name: 'Rudi Hartono', age: 35, gender: 'Laki-laki', email: 'rudi@gmail.com', phone: '081334567890', occupation: 'PNS', education: 'S2', incomeRange: '> 10jt', tiktokUsage: 2, tiktokShopUsage: 2, lastPurchase: new Date('2023-12-20') }
    ]
    
    const createdRespondents = []
    for (const resp of respondents) {
      const respondent = await prisma.respondent.create({
        data: resp
      })
      createdRespondents.push(respondent)
    }
    
    console.log(`✅ ${createdRespondents.length} respondents created`)
    
    // ====================
    // 6. CREATE SURVEYS & ANSWERS
    // ====================
    console.log('📝 Creating surveys and answers...')
    
    for (const respondent of createdRespondents) {
      // Create survey
      const survey = await prisma.survey.create({
        data: {
          respondentId: respondent.id,
          researcherId: researcher.id,
          completed: true,
          completedAt: new Date()
        }
      })
      
      // Create answers for each question (random values 1-5)
      const answersData = []
      for (const question of createdQuestions) {
        const value = Math.floor(Math.random() * 5) + 1 // Random 1-5
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
      
      // Create analysis
      const analysisData = {
        surveyId: survey.id,
        content: dimensionScores['Content'] ? dimensionScores['Content'].total / dimensionScores['Content'].count : 0,
        accuracy: dimensionScores['Accuracy'] ? dimensionScores['Accuracy'].total / dimensionScores['Accuracy'].count : 0,
        format: dimensionScores['Format'] ? dimensionScores['Format'].total / dimensionScores['Format'].count : 0,
        easeOfUse: dimensionScores['EaseOfUse'] ? dimensionScores['EaseOfUse'].total / dimensionScores['EaseOfUse'].count : 0,
        timeliness: dimensionScores['Timeliness'] ? dimensionScores['Timeliness'].total / dimensionScores['Timeliness'].count : 0,
        loyalty: dimensionScores['Loyalty'] ? dimensionScores['Loyalty'].total / dimensionScores['Loyalty'].count : 0
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
        ? scores.reduce((a, b) => a + b, 0) / scores.length 
        : 0
      
      await prisma.analysis.create({
        data: analysisData
      })
      
      console.log(`   Survey for ${respondent.name} created with ${answersData.length} answers`)
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
          status: Math.random() > 0.2 ? 'Valid' : 'Tidak Valid',
          cronbachAlpha: parseFloat((0.7 + Math.random() * 0.25).toFixed(3)), // 0.7-0.95
          cronbachStatus: Math.random() > 0.1 ? 'Reliabel' : 'Cukup'
        }
      })
    }
    
    console.log('✅ Validity & reliability data created')
    
    // ====================
    // 8. CREATE REGRESSION DATA
    // ====================
    console.log('📊 Creating regression analysis...')
    
    const regressionData = [
      { dimension: 'Content', coefficient: 0.42, tValue: 2.85, pValue: 0.005, significance: 'Signifikan', rSquared: 0.68, adjustedRSquared: 0.65 },
      { dimension: 'Accuracy', coefficient: 0.38, tValue: 2.45, pValue: 0.015, significance: 'Signifikan', rSquared: 0.62, adjustedRSquared: 0.59 },
      { dimension: 'Format', coefficient: 0.25, tValue: 1.98, pValue: 0.048, significance: 'Signifikan', rSquared: 0.55, adjustedRSquared: 0.52 },
      { dimension: 'EaseOfUse', coefficient: 0.51, tValue: 3.25, pValue: 0.001, significance: 'Signifikan', rSquared: 0.72, adjustedRSquared: 0.70 },
      { dimension: 'Timeliness', coefficient: 0.29, tValue: 2.15, pValue: 0.032, significance: 'Signifikan', rSquared: 0.58, adjustedRSquared: 0.55 }
    ]
    
    for (const reg of regressionData) {
      await prisma.regression.create({
        data: reg
      })
    }
    
    console.log('✅ Regression data created')
    
    // ====================
    // 9. CREATE VISUALIZATION DATA
    // ====================
    console.log('📊 Creating visualization data...')
    
    const visualizationData = {
      labels: ['Content', 'Accuracy', 'Format', 'EaseOfUse', 'Timeliness', 'Loyalty'],
      datasets: [
        {
          label: 'Skor Rata-rata',
          data: [4.2, 3.8, 4.0, 4.5, 3.9, 4.1],
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
          borderWidth: 1
        }
      ]
    }
    
    await prisma.visualization.create({
      data: {
        type: 'BAR',
        data: visualizationData,
        title: 'Skor Rata-rata Dimensi EUCS'
      }
    })
    
    console.log('✅ Visualization data created')
    
    // ====================
    // SUMMARY
    // ====================
    console.log('\n🎉 Seeding completed successfully!')
    console.log('===================================')
    console.log('📊 Database Summary:')
    console.log(`   👤 Users: 2 (1 Researcher, 1 Admin)`)
    console.log(`   📊 Dimensions: ${createdDimensions.length}`)
    console.log(`   ❓ Questions: ${createdQuestions.length}`)
    console.log(`   👥 Respondents: ${createdRespondents.length}`)
    console.log(`   📝 Surveys: ${createdRespondents.length}`)
    console.log(`   ✅ Validity Data: 10 items`)
    console.log(`   📈 Regression Data: 5 items`)
    console.log('\n🔑 Login Credentials:')
    console.log('   Email: jessica@stmiktime.ac.id')
    console.log('   Password: admin123')
    console.log('===================================\n')
    
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