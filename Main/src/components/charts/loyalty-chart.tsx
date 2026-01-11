"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface LoyaltyChartProps {
  data: {
    indicator: string;
    score: number;
    responses: number;
  }[];
}

export default function LoyaltyChart({ data }: LoyaltyChartProps) {
  // Warna untuk chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Format data untuk pie chart
  const pieData = data.map(item => ({
    name: item.indicator,
    value: item.score,
    responses: item.responses
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            Skor: <span className="font-medium">{payload[0].value.toFixed(1)}</span> / 5
          </p>
          <p className="text-sm text-gray-600">
            Responses: <span className="font-medium">{payload[0].payload.responses}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(entry) => `${entry.name}: ${entry.value.toFixed(1)}`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Versi sederhana tanpa recharts
export function SimpleLoyaltyChart({ data }: LoyaltyChartProps) {
  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="p-3 border rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-gray-900">{item.indicator}</span>
            <span className="text-sm font-bold text-blue-600">
              {item.score.toFixed(1)}/5
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-blue-500"
              style={{ width: `${(item.score / 5) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {item.responses} responses
          </p>
        </div>
      ))}
    </div>
  );
}