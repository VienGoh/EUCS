import { NextRequest, NextResponse } from 'next/server';
import { getVisualizationData } from '@/lib/visualization';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const platformId = searchParams.get('platform');
    const filter = platformId && !isNaN(Number(platformId)) ? { platformId: Number(platformId) } : undefined;

    const data = await getVisualizationData(filter);

    // Buat workbook Excel
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Platform Distribution
    const platformSheetData = [
      ['Platform', 'Jumlah Responden'],
      ...data.platformData.map(p => [p.name, p.jumlah])
    ];
    const platformSheet = XLSX.utils.aoa_to_sheet(platformSheetData);
    XLSX.utils.book_append_sheet(workbook, platformSheet, 'Platform Distribution');

    // Sheet 2: Gender Distribution
    const genderSheetData = [
      ['Jenis Kelamin', 'Jumlah'],
      ...data.genderData.map(g => [g.name, g.value])
    ];
    const genderSheet = XLSX.utils.aoa_to_sheet(genderSheetData);
    XLSX.utils.book_append_sheet(workbook, genderSheet, 'Gender Distribution');

    // Sheet 3: Task Performance
    const taskSheetData = [
      ['Task', 'Success Rate (%)', 'Average Time (s)', 'Average Errors'],
      ...data.taskPerformance.map(t => [t.task, t.successRate, t.avgTime, t.avgError])
    ];
    const taskSheet = XLSX.utils.aoa_to_sheet(taskSheetData);
    XLSX.utils.book_append_sheet(workbook, taskSheet, 'Task Performance');

    // Tulis workbook ke buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Kembalikan sebagai file download
    return new NextResponse(new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    }), {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="visualization_${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Error exporting visualization data:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}