'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PlatformChartProps {
  data: Array<{
    name: string;
    jumlah: number;
    fill: string;
  }>;
}

export default function PlatformChart({ data }: PlatformChartProps) {
  const total = data.reduce((sum, item) => sum + item.jumlah, 0);

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, jumlah }) => `${name}: ${jumlah}`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="jumlah"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Additional info */}
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>Total Responden: {total}</p>
        {data.map((platform) => (
          <div key={platform.name} className="inline-flex items-center mx-2">
            <div 
              className="w-3 h-3 rounded-full mr-1" 
              style={{ backgroundColor: platform.fill }}
            />
            <span>{platform.name}: {platform.jumlah} ({Math.round((platform.jumlah / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}