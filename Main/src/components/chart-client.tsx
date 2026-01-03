// components/chart-client.tsx
"use client";

import { ReactNode } from "react";

interface ChartClientProps {
  children: ReactNode;
}

export default function ChartClient({ children }: ChartClientProps) {
  return <>{children}</>;
}