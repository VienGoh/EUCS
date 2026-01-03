'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

const taskData = [
  { task: 'Search Product', time: 15, success: 95 },
  { task: 'Add to Cart', time: 8, success: 98 },
  { task: 'Checkout Process', time: 25, success: 82 },
  { task: 'Payment', time: 18, success: 88 },
  { task: 'Order Confirmation', time: 5, success: 99 },
];

export default function TaskCompletionStats() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistik Penyelesaian Tugas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={taskData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="task" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line yAxisId="left" type="monotone" dataKey="success" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
              <Line yAxisId="right" type="monotone" dataKey="time" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span>Success Rate (%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            <span>Completion Time (s)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}