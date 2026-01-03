'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';

interface PlatformComparisonData {
  platform: string;
  avgSUS: number;
  successRate: number;
  avgTime: number;
  totalResponden: number;
}

export default function PlatformComparisonChart() {
  const [data, setData] = useState<PlatformComparisonData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlatformData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/platform-comparison');
        if (response.ok) {
          const platformData = await response.json();
          setData(platformData);
        }
      } catch (error) {
        console.error('Error fetching platform data:', error);
        // Fallback data
        setData([
          {
            platform: 'Shopee',
            avgSUS: 78.5,
            successRate: 85,
            avgTime: 45,
            totalResponden: 30
          },
          {
            platform: 'TikTok Shop',
            avgSUS: 76.2,
            successRate: 83,
            avgTime: 48,
            totalResponden: 30
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlatformData();
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 bg-gray-200 rounded w-40 mb-2"></div>
          <div className="text-gray-500">Memuat data perbandingan...</div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-gray-500 mb-2">Tidak ada data perbandingan</div>
        <div className="text-sm text-gray-400">Pastikan data platform tersedia</div>
      </div>
    );
  }

  // Format data untuk chart
  const chartData = [
    { 
      metric: 'SUS Score', 
      ...Object.fromEntries(data.map(p => [p.platform, p.avgSUS]))
    },
    { 
      metric: 'Success Rate (%)', 
      ...Object.fromEntries(data.map(p => [p.platform, p.successRate]))
    },
    { 
      metric: 'Avg Time (s)', 
      ...Object.fromEntries(data.map(p => [p.platform, p.avgTime]))
    },
  ];

  const colors = {
    'Shopee': '#FF6B35',
    'TikTok Shop': '#00A8E8',
  };

  return (
    <div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="metric" />
          <YAxis />
          <Tooltip />
          <Legend />
          {data.map((platform) => (
            <Bar 
              key={platform.platform} 
              dataKey={platform.platform} 
              fill={colors[platform.platform as keyof typeof colors] || '#8884d8'}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((platform) => (
          <div key={platform.platform} className="p-3 bg-gray-50 rounded-lg">
            <div className="font-semibold text-gray-800 mb-1">{platform.platform}</div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <div className="text-xs text-gray-500">SUS Score</div>
                <div className="font-bold" style={{ color: colors[platform.platform as keyof typeof colors] }}>
                  {platform.avgSUS.toFixed(1)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Success Rate</div>
                <div className="font-bold">{platform.successRate}%</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Avg Time</div>
                <div className="font-bold">{platform.avgTime}s</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}