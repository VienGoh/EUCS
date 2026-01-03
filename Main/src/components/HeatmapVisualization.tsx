'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

export default function HeatmapVisualization() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Heatmap Interaksi Pengguna</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="shopee">
          <TabsList className="mb-4">
            <TabsTrigger value="shopee">Shopee</TabsTrigger>
            <TabsTrigger value="tiktok">TikTok Shop</TabsTrigger>
          </TabsList>
          
          <TabsContent value="shopee">
            <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-gray-50">
              <div className="mb-4">
                <h3 className="font-semibold">Homepage Shopee</h3>
                <p className="text-sm text-gray-500">Distribusi klik berdasarkan heatmap</p>
              </div>
              {/* Simulasi heatmap dengan div */}
              <div className="relative h-64 bg-white border rounded-md overflow-hidden">
                {/* Area dengan banyak klik */}
                <div className="absolute top-4 left-4 w-20 h-10 bg-red-500/40 rounded"></div>
                <div className="absolute top-20 right-8 w-16 h-16 bg-orange-500/30 rounded-full"></div>
                <div className="absolute bottom-8 left-1/2 w-24 h-8 bg-green-500/20 rounded"></div>
                
                {/* Label area */}
                <div className="absolute top-6 left-6 text-xs font-medium">Search Bar</div>
                <div className="absolute top-24 right-10 text-xs font-medium">Cart Icon</div>
                <div className="absolute bottom-10 left-1/2 text-xs font-medium">Checkout Button</div>
              </div>
              
              <div className="mt-4 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500/40 rounded"></div>
                  <span>High Interaction</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500/30 rounded"></div>
                  <span>Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500/20 rounded"></div>
                  <span>Low</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="tiktok">
            <div className="border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-gray-50">
              <p className="text-gray-500">Heatmap untuk TikTok Shop akan ditampilkan di sini</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}