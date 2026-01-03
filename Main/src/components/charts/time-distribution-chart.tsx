// components/charts/time-distribution-chart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";

interface TimeData {
  task: string;
  "Sangat Cepat (< 30s)": number;
  "Cepat (30-60s)": number;
  "Sedang (60-120s)": number;
  "Lambat (120-180s)": number;
  "Sangat Lambat (> 180s)": number;
}

interface TimeDistributionChartProps {
  data: TimeData[];
}

export default function TimeDistributionChart({ data }: TimeDistributionChartProps) {
  const colors = {
    "Sangat Cepat (< 30s)": "#10B981",
    "Cepat (30-60s)": "#3B82F6",
    "Sedang (60-120s)": "#F59E0B",
    "Lambat (120-180s)": "#EF4444",
    "Sangat Lambat (> 180s)": "#7C3AED"
  };

  // Format data untuk stacked bar chart
  const chartData = data.map(task => ({
    task: task.task,
    ...Object.keys(colors).reduce((acc: any, key) => {
      acc[key] = task[key as keyof TimeData];
      return acc;
    }, {})
  }));

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          stackOffset="expand"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="task" 
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
          />
          <Tooltip 
            formatter={(value: number) => [`${value} pengguna`, 'Jumlah']}
          />
          <Legend />
          
          {Object.entries(colors).map(([key, color]) => (
            <Bar
              key={key}
              dataKey={key}
              name={key}
              stackId="a"
              fill={color}
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={color} />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}