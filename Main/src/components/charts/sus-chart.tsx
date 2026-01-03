'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getSUSData() {
  const answers = await prisma.sUSAnswer.findMany({
    include: { question: true, responden: true },
  });

  // Hitung SUS per responden
  const susPerResponden: Record<number, number> = {};
  for (const ans of answers) {
    const base = ans.question.isPositive ? ans.score - 1 : 5 - ans.score;
    susPerResponden[ans.respondenId] = (susPerResponden[ans.respondenId] || 0) + base;
  }

  const susValues = Object.values(susPerResponden).map((total) => total * 2.5);
  
  // Kategorisasi SUS
  const categories = [
    { range: '0-49 (Poor)', min: 0, max: 49, count: 0 },
    { range: '50-69 (OK)', min: 50, max: 69, count: 0 },
    { range: '70-84 (Good)', min: 70, max: 84, count: 0 },
    { range: '85-100 (Excellent)', min: 85, max: 100, count: 0 },
  ];

  susValues.forEach(score => {
    const category = categories.find(cat => score >= cat.min && score <= cat.max);
    if (category) category.count++;
  });

  return categories;
}

export default async function SUSChart() {
  const data = await getSUSData();

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="range" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}