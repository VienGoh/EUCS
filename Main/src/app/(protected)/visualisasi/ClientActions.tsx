// app/(protected)/visualisasi/ClientActions.tsx
"use client";

import { Download, Filter, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import * as XLSX from 'xlsx';

interface PlatformData {
  name: string;
  jumlah: number;
  fill: string;
}

interface GenderData {
  name: string;
  value: number;
  fill: string;
}

interface TaskPerformance {
  task: string;
  successRate: number;
  avgTime: number;
  avgError: string;
}

interface Platform {
  id: number;
  name: string;
}

interface ClientActionsProps {
  platformData: PlatformData[];
  genderData: GenderData[];
  taskPerformance: TaskPerformance[];
  totalResponden: number;
  avgSuccessRate: number;
  avgCompletionTime: number;
  platformsFilter: Platform[];
}

export default function ClientActions({
  platformData,
  genderData,
  taskPerformance,
  totalResponden,
  avgSuccessRate,
  avgCompletionTime,
  platformsFilter
}: ClientActionsProps) {
  const [showFilter, setShowFilter] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  const handleExport = async () => {
    try {
      setExportLoading(true);
      
      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Sheet 1: Summary
      const summaryData = [
        ['LAPORAN VISUALISASI HASIL EVALUASI UX'],
        ['Dibuat pada', new Date().toLocaleString('id-ID')],
        ['Filter', selectedPlatform === 'all' ? 'Semua Platform' : platformsFilter.find(p => p.id.toString() === selectedPlatform)?.name],
        [],
        ['METRIK', 'NILAI'],
        ['Total Responden', totalResponden],
        ['Rata-rata Success Rate', `${avgSuccessRate}%`],
        ['Rata-rata Waktu Penyelesaian', `${avgCompletionTime}s`],
        ['Jumlah Task yang Dianalisis', taskPerformance.length]
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');

      // Sheet 2: Platform Distribution
      const platformSheetData = [
        ['Platform', 'Jumlah Responden', 'Persentase'],
        ...platformData.map(p => [
          p.name,
          p.jumlah,
          `${((p.jumlah / totalResponden) * 100).toFixed(1)}%`
        ])
      ];
      const platformSheet = XLSX.utils.aoa_to_sheet(platformSheetData);
      XLSX.utils.book_append_sheet(workbook, platformSheet, 'Distribusi Platform');

      // Sheet 3: Gender Distribution
      const genderSheetData = [
        ['Jenis Kelamin', 'Jumlah', 'Persentase'],
        ...genderData.map(g => [
          g.name,
          g.value,
          `${((g.value / genderData.reduce((sum, g2) => sum + g2.value, 0)) * 100).toFixed(1)}%`
        ])
      ];
      const genderSheet = XLSX.utils.aoa_to_sheet(genderSheetData);
      XLSX.utils.book_append_sheet(workbook, genderSheet, 'Distribusi Gender');

      // Sheet 4: Task Performance
      const taskSheetData = [
        ['Task', 'Success Rate (%)', 'Rata-rata Waktu (s)', 'Rata-rata Error', 'Kategori'],
        ...taskPerformance.map(t => [
          t.task,
          t.successRate,
          t.avgTime,
          t.avgError,
          t.successRate >= 80 ? 'Sangat Baik' :
          t.successRate >= 60 ? 'Baik' :
          t.successRate >= 40 ? 'Cukup' : 'Perlu Perbaikan'
        ])
      ];
      const taskSheet = XLSX.utils.aoa_to_sheet(taskSheetData);
      XLSX.utils.book_append_sheet(workbook, taskSheet, 'Performa Task');

      // Export to file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `visualisasi_ux_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Gagal mengekspor data. Silakan coba lagi.');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      {/* Filter Button with Dropdown */}
      <div className="relative">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowFilter(!showFilter)}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>

        {showFilter && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border p-4 z-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Filter Platform</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowFilter(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pilih Platform
                </label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">Semua Platform</option>
                  {platformsFilter.map((platform) => (
                    <option key={platform.id} value={platform.id}>
                      {platform.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedPlatform('all');
                    // TODO: Implement filter logic here
                    // For now, just refresh the page
                    window.location.reload();
                  }}
                  className="flex-1"
                >
                  Reset
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    // TODO: Implement filter logic here
                    // For now, just show a message
                    alert(`Filter diterapkan untuk: ${
                      selectedPlatform === 'all' 
                        ? 'Semua Platform' 
                        : platformsFilter.find(p => p.id.toString() === selectedPlatform)?.name
                    }`);
                    setShowFilter(false);
                  }}
                  className="flex-1"
                >
                  Terapkan
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => window.location.reload()}
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Refresh
      </Button>

      {/* Export Button */}
      <Button 
        size="sm"
        onClick={handleExport}
        disabled={exportLoading || platformData.length === 0}
      >
        {exportLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Mengekspor...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Export Laporan
          </>
        )}
      </Button>
    </div>
  );
}