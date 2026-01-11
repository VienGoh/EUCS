"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function EucsBarChart({ data }: any) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="dimension" />
        <YAxis domain={[0, 5]} />
        <Tooltip />
        <Bar dataKey="average" fill="#6366F1" />
      </BarChart>
    </ResponsiveContainer>
  );
}
