// components/charts/task-success-chart.tsx
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

interface TaskData {
  taskName: string;
  successRate: number;
  avgTime: number;
  avgErrors: number;
  platformBreakdown: Array<{
    platform: string;
    successRate: number;
    color: string;
  }>;
}

interface TaskSuccessChartProps {
  data: TaskData[];
}

export default function TaskSuccessChart({ data }: TaskSuccessChartProps) {
  // Format data untuk stacked bar chart
  const chartData = data.map(task => {
    const baseData: any = {
      task: task.taskName,
      overallSuccess: task.successRate,
      avgTime: task.avgTime,
      avgErrors: task.avgErrors
    };

    // Tambahkan data per platform
    task.platformBreakdown.forEach(pb => {
      baseData[pb.platform] = pb.successRate;
    });

    return baseData;
  });

  // Warna untuk platform
  const platformColors = data[0]?.platformBreakdown.reduce((acc: any, pb) => {
    acc[pb.platform] = pb.color;
    return acc;
  }, {}) || {};

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
            label={{ 
              value: 'Success Rate (%)', 
              angle: -90, 
              position: 'insideLeft',
              offset: -10
            }}
            domain={[0, 100]}
          />
          <Tooltip 
            formatter={(value: any, name: any) => {
              if (name === 'avgTime') return [`${value} detik`, 'Rata-rata Waktu'];
              if (name === 'avgErrors') return [value, 'Rata-rata Error'];
              if (name === 'overallSuccess') return [`${value}%`, 'Overall Success Rate'];
              return [`${value}%`, name];
            }}
          />
          <Legend />
          
          {/* Bar untuk overall success rate */}
          <Bar 
            dataKey="overallSuccess" 
            name="Overall Success Rate" 
            fill="#4F46E5" 
            radius={[4, 4, 0, 0]}
          />
          
          {/* Bar untuk per platform */}
          {Object.keys(platformColors).map(platform => (
            <Bar
              key={platform}
              dataKey={platform}
              name={`${platform} Success`}
              fill={platformColors[platform]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}