// src/utils/exportUtils.ts
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportToPDF = async (elementId: string, filename: string = 'eucs-chart.pdf') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Element not found:', elementId);
      return false;
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const imgWidth = 280;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save(filename);
    
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
};

export const exportToPNG = async (elementId: string, filename: string = 'eucs-chart.png') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Element not found:', elementId);
      return false;
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    return true;
  } catch (error) {
    console.error('Error exporting to PNG:', error);
    return false;
  }
};

export const exportToExcel = (data: any, filename: string = 'eucs-data.xlsx') => {
  try {
    // Convert data to CSV format
    let csvContent = '';
    
    if (data.dimensions) {
      csvContent += 'DIMENSI EUCS\n';
      csvContent += 'Dimensi,Rata-rata,Min,Max,Jumlah Data\n';
      Object.entries(data.dimensions).forEach(([key, value]: [string, any]) => {
        csvContent += `${key},${value.average},${value.min},${value.max},${value.count}\n`;
      });
      csvContent += '\n';
    }
    
    if (data.distribution) {
      csvContent += 'DISTRIBUSI SKOR\n';
      csvContent += 'Kategori,Rentang Skor,Jumlah\n';
      const categories = [
        { key: 'veryHigh', label: 'Sangat Tinggi', range: '4.0 - 5.0' },
        { key: 'high', label: 'Tinggi', range: '3.0 - 3.9' },
        { key: 'medium', label: 'Sedang', range: '2.0 - 2.9' },
        { key: 'low', label: 'Rendah', range: '1.0 - 1.9' }
      ];
      
      categories.forEach(cat => {
        csvContent += `${cat.label},${cat.range},${data.distribution[cat.key] || 0}\n`;
      });
      csvContent += '\n';
    }
    
    if (data.recentAnalyses && data.recentAnalyses.length > 0) {
      csvContent += 'DATA RESPONDEN TERBARU\n';
      csvContent += 'No,Tanggal,Skor Total,Loyalitas,Konten,Akurasi,Format,Kemudahan,Ketepatan Waktu\n';
      
      data.recentAnalyses.forEach((item: any, index: number) => {
        csvContent += `${index + 1},`;
        csvContent += `${new Date(item.createdAt).toLocaleDateString('id-ID')},`;
        csvContent += `${item.totalScore.toFixed(2)},`;
        csvContent += `${(item.scores?.loyalty || 0).toFixed(2)},`;
        csvContent += `${(item.scores?.content || 0).toFixed(2)},`;
        csvContent += `${(item.scores?.accuracy || 0).toFixed(2)},`;
        csvContent += `${(item.scores?.format || 0).toFixed(2)},`;
        csvContent += `${(item.scores?.easeOfUse || 0).toFixed(2)},`;
        csvContent += `${(item.scores?.timeliness || 0).toFixed(2)}\n`;
      });
    }
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename.replace('.xlsx', '.csv');
    link.click();
    
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
};