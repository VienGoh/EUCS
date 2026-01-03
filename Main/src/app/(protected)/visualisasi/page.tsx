"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Data = {
  successRate: number;
  avgTime: number;
  errorRate: number;
  avgSUS: number;
};

export default function VisualisasiPage() {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    fetch("/api/visualisasi")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return <p className="p-6">Memuat data...</p>;

  const chartData = [
    { name: "Success Rate (%)", value: data.successRate },
    { name: "Time on Task (detik)", value: data.avgTime },
    { name: "Error Rate", value: data.errorRate },
    { name: "Skor SUS", value: data.avgSUS },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Visualisasi Hasil Analisis User Experience
      </h1>

      <div className="bg-white p-4 rounded shadow h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
