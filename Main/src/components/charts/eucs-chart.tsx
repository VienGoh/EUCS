"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface EUCSChartProps {
  data: {
    name: string;
    score: number;
    maxScore: number;
    fill: string;
  }[];
}

export default function EUCSChart({ data }: EUCSChartProps) {
  // Format data untuk chart
  const chartData = data.map(item => ({
    ...item,
    persentase: (item.score / item.maxScore) * 100
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            Skor: <span className="font-medium">{payload[0].value.toFixed(1)}</span> / {payload[0].payload.maxScore}
          </p>
          <p className="text-sm text-gray-600">
            Persentase: <span className="font-medium">{payload[0].payload.persentase.toFixed(1)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="name" 
          tick={{ fill: '#6b7280' }}
          axisLine={{ stroke: '#d1d5db' }}
        />
        <YAxis 
          domain={[0, 5]}
          tick={{ fill: '#6b7280' }}
          axisLine={{ stroke: '#d1d5db' }}
          label={{ 
            value: 'Skor (1-5)', 
            angle: -90, 
            position: 'insideLeft',
            offset: -10,
            style: { fill: '#6b7280' }
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar 
          dataKey="score" 
          name="Skor EUCS" 
          fill="#8884d8"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Versi sederhana tanpa recharts (jika tidak ingin install recharts)
export function SimpleEUCSChart({ data }: EUCSChartProps) {
  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-700">{item.name}</span>
            <span className="text-sm font-bold text-gray-900">
              {item.score.toFixed(1)}/5
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full"
              style={{ 
                width: `${(item.score / item.maxScore) * 100}%`,
                backgroundColor: item.fill
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}