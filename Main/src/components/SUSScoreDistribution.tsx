'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useEffect, useState } from 'react';

interface SUSScoreData {
  range: string;
  count: number;
  color: string;
}

export default function SUSScoreDistribution() {
  const [data, setData] = useState<SUSScoreData[]>([
    { range: '0-49 (Poor)', count: 0, color: '#EF4444' },
    { range: '50-69 (OK)', count: 0, color: '#F59E0B' },
    { range: '70-84 (Good)', count: 0, color: '#3B82F6' },
    { range: '85-100 (Excellent)', count: 0, color: '#10B981' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data SUS dari API
    const fetchSUSData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/sus-distribution');
        if (response.ok) {
          const susData = await response.json();
          setData(susData);
        }
      } catch (error) {
        console.error('Error fetching SUS data:', error);
        // Fallback data
        setData([
          { range: '0-49 (Poor)', count: 5, color: '#EF4444' },
          { range: '50-69 (OK)', count: 15, color: '#F59E0B' },
          { range: '70-84 (Good)', count: 25, color: '#3B82F6' },
          { range: '85-100 (Excellent)', count: 15, color: '#10B981' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSUSData();
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="text-gray-500">Memuat data SUS...</div>
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" />
          <YAxis />
          <Tooltip 
            formatter={(value) => [`${value} responden`, 'Jumlah']}
            labelFormatter={(label) => `Range: ${label}`}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        {data.map((item) => (
          <div key={item.range} className="text-center p-2 bg-gray-50 rounded">
            <div className="text-lg font-bold">{item.count}</div>
            <div className="text-xs text-gray-600">{item.range}</div>
            <div className="text-xs text-gray-500">
              {total > 0 ? `${Math.round((item.count / total) * 100)}%` : '0%'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}