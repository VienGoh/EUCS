'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function DemographicChart() {
  const ageData = [
    { range: '18-25', count: 25 },
    { range: '26-30', count: 20 },
    { range: '31-35', count: 10 },
    { range: '36-40', count: 5 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demografi Responden</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Distribusi Usia */}
          <div>
            <h4 className="font-medium mb-2">Distribusi Usia</h4>
            <div className="space-y-2">
              {ageData.map((item) => (
                <div key={item.range} className="flex items-center">
                  <div className="w-16">{item.range}</div>
                  <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${(item.count / 60) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-8 text-right">{item.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Distribusi Gender */}
          <div>
            <h4 className="font-medium mb-2">Distribusi Gender</h4>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mx-auto">
                  <span className="text-2xl">♀</span>
                </div>
                <div className="mt-2">Perempuan</div>
                <div className="font-bold">65%</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                  <span className="text-2xl">♂</span>
                </div>
                <div className="mt-2">Laki-laki</div>
                <div className="font-bold">35%</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}