'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

const susData = [
  { name: 'Excellent (85-100)', value: 12, color: '#10B981' },
  { name: 'Good (70-84)', value: 28, color: '#3B82F6' },
  { name: 'OK (50-69)', value: 15, color: '#F59E0B' },
  { name: 'Poor (0-49)', value: 5, color: '#EF4444' },
];

export default function SUSScoreChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribusi Skor SUS</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={susData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {susData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>• <span className="font-medium">Skor SUS Rata-rata: 78.2</span> (Kategori: Good)</p>
          <p>• 40 responden memiliki skor di atas 70 (Good-Excellent)</p>
        </div>
      </CardContent>
    </Card>
  );
}