'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface GenderChartProps {
  data: Array<{
    name: string;
    value: number;
    fill: string;
  }>;
}

export default function GenderChart({ data }: GenderChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Additional info */}
      <div className="mt-4 text-center">
        {data.map((gender) => (
          <div key={gender.name} className="inline-block mx-4">
            <div className="flex items-center">
              <div 
                className="w-4 h-4 rounded mr-2" 
                style={{ backgroundColor: gender.fill }}
              />
              <span className="font-medium">{gender.name}:</span>
              <span className="ml-2">{gender.value} ({Math.round((gender.value / total) * 100)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}