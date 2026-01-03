'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowRight, Home, Search, ShoppingCart, CreditCard, Check } from 'lucide-react';

const flowSteps = [
  { icon: Home, label: 'Homepage', dropoff: '2%' },
  { icon: Search, label: 'Search', dropoff: '5%' },
  { icon: ShoppingCart, label: 'Cart', dropoff: '8%' },
  { icon: CreditCard, label: 'Payment', dropoff: '12%' },
  { icon: Check, label: 'Confirmation', dropoff: '1%' },
];

export default function UserFlowDiagram() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Flow dan Drop-off Points</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Flow diagram */}
          <div className="flex items-center justify-between py-8">
            {flowSteps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                  <step.icon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-sm font-medium">{step.label}</div>
                <div className="text-xs text-red-500 mt-1">Drop-off: {step.dropoff}</div>
                
                {/* Arrow connector */}
                {index < flowSteps.length - 1 && (
                  <div className="absolute left-1/2 transform translate-x-16">
                    <ArrowRight className="w-6 h-6 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Drop-off visualization */}
          <div className="mt-8">
            <h4 className="font-medium mb-2">Analisis Drop-off</h4>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm">
                <span className="font-semibold">Titik kritis:</span> Proses pembayaran memiliki drop-off tertinggi (12%). 
                Rekomendasi: Sederhanakan alur pembayaran dan tambahkan lebih banyak opsi pembayaran.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}