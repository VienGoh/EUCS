import { prisma } from '@/lib/prisma';

export async function getVisualizationData(filter?: { platformId?: number }) {
  // Data platform
  const platforms = await prisma.platform.findMany({
    where: filter?.platformId ? { id: filter.platformId } : {},
    include: { 
      responden: {
        include: {
          taskResults: true,
          susAnswers: {
            include: { question: true }
          }
        }
      }
    }
  });

  const platformData = platforms.map(p => ({
    name: p.name,
    jumlah: p.responden.length,
    fill: p.name === "Shopee" ? "#FF6B35" : "#00A8E8"
  }));

  // Data gender
  const respondenGender = await prisma.responden.groupBy({
    by: ['jenisKelamin'],
    where: filter?.platformId ? { platformId: filter.platformId } : {},
    _count: { id: true }
  });

  const genderData = respondenGender.map(g => ({
    name: g.jenisKelamin,
    value: g._count.id,
    fill: g.jenisKelamin === "Laki-laki" ? "#3B82F6" : "#EC4899"
  }));

  // Data task performance
  const tasks = await prisma.task.findMany({
    include: {
      taskResults: {
        where: filter?.platformId ? { responden: { platformId: filter.platformId } } : {},
        select: { 
          success: true, 
          timeOnTask: true, 
          errorCount: true,
          responden: {
            select: {
              platform: true
            }
          }
        }
      }
    }
  });

  const taskPerformance = tasks.map(task => {
    const results = task.taskResults;
    const total = results.length;
    const success = results.filter(r => r.success).length;
    const avgTime = total === 0 ? 0 : results.reduce((sum, r) => sum + r.timeOnTask, 0) / total;
    const avgError = total === 0 ? 0 : results.reduce((sum, r) => sum + r.errorCount, 0) / total;

    return {
      task: task.namaTask,
      successRate: total === 0 ? 0 : Math.round((success / total) * 100),
      avgTime: Math.round(avgTime),
      avgError: avgError.toFixed(1)
    };
  });

  return {
    platformData,
    genderData,
    taskPerformance
  };
}