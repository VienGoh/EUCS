const { PrismaClient } = require('@prisma/client')
const { Parser } = require('json2csv')
const fs = require('fs')

const prisma = new PrismaClient()

async function exportTable(name, data) {
  if (!data || data.length === 0) {
    console.log(`⚠️ ${name} kosong`)
    return
  }

  const parser = new Parser()
  const csv = parser.parse(data)

  fs.writeFileSync(`${name}.csv`, csv)
  console.log(`✅ ${name}.csv berhasil dibuat`)
}

async function main() {
  await exportTable('users', await prisma.user.findMany())
  await exportTable('respondents', await prisma.respondent.findMany())
  await exportTable('surveys', await prisma.survey.findMany())
  await exportTable('dimensions', await prisma.dimension.findMany())
  await exportTable('questions', await prisma.question.findMany())
  await exportTable('answers', await prisma.answer.findMany())
  await exportTable('analyses', await prisma.analysis.findMany())
  await exportTable('visualizations', await prisma.visualization.findMany())
  await exportTable('exports', await prisma.export.findMany())
  await exportTable('validity_reliability', await prisma.validityReliability.findMany())
  await exportTable('regressions', await prisma.regression.findMany())
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())