// app/testing/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

// Data produk dummy untuk simulasi e-commerce
const products = [
  { id: 1, name: "Smartphone Xiaomi", price: 2500000, image: "📱" },
  { id: 2, name: "Laptop ASUS", price: 8500000, image: "💻" },
  { id: 3, name: "Headphone Sony", price: 1200000, image: "🎧" },
  { id: 4, name: "Smart Watch", price: 1500000, image: "⌚" },
  { id: 5, name: "Kamera DSLR", price: 7500000, image: "📷" },
  { id: 6, name: "Speaker Bluetooth", price: 800000, image: "🔊" },
  { id: 7, name: "Keyboard Mechanical", price: 900000, image: "⌨️" },
  { id: 8, name: "Mouse Gaming", price: 500000, image: "🖱️" },
];

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface TaskStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export default function TestingPage() {
  const searchParams = useSearchParams();
  const respondenId = searchParams.get("id");
  
  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [taskStarted, setTaskStarted] = useState(false);
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [timeStart, setTimeStart] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Daftar tugas sesuai proposal
  const tasks: TaskStep[] = [
    {
      id: 1,
      title: "Mencari Produk",
      description: "Cari produk 'Smartphone' menggunakan fitur pencarian",
      completed: false
    },
    {
      id: 2,
      title: "Melihat Detail Produk",
      description: "Klik produk untuk melihat detail",
      completed: false
    },
    {
      id: 3,
      title: "Menambahkan ke Keranjang",
      description: "Tambahkan 2 produk berbeda ke keranjang",
      completed: false
    },
    {
      id: 4,
      title: "Checkout",
      description: "Lanjutkan ke proses checkout",
      completed: false
    },
    {
      id: 5,
      title: "Selesai",
      description: "Konfirmasi pesanan berhasil",
      completed: false
    }
  ];

  // Filter produk berdasarkan pencarian
  const filteredProducts = searchQuery
    ? products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  // Hitung total harga di keranjang
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Mulai timer ketika task dimulai
  useEffect(() => {
    if (taskStarted && !timeStart) {
      setTimeStart(new Date());
      const timer = setInterval(() => {
        if (timeStart) {
          setElapsedTime(Math.floor((new Date().getTime() - timeStart.getTime()) / 1000));
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [taskStarted, timeStart]);

  // Handle mulai testing
  const handleStartTesting = () => {
    setTaskStarted(true);
    setTimeStart(new Date());
  };

  // Handle tambah ke keranjang
  const handleAddToCart = (product: typeof products[0]) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    // Update task completion
    if (currentStep === 3 && cart.length >= 1) {
      const updatedTasks = [...tasks];
      updatedTasks[2].completed = true;
      setCurrentStep(4);
    }
  };

  // Handle hapus dari keranjang
  const handleRemoveFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Handle checkout
  const handleCheckout = () => {
    if (currentStep === 4) {
      const updatedTasks = [...tasks];
      updatedTasks[3].completed = true;
      updatedTasks[4].completed = true;
      setCurrentStep(5);
      setTaskCompleted(true);
      
      // Simpan hasil testing ke API
      saveTestResult();
    }
  };

  // Simpan hasil testing ke database
  const saveTestResult = async () => {
    try {
      const result = {
        respondenId: parseInt(respondenId || "0"),
        taskId: 1, // ID task "Proses Belanja"
        success: true,
        timeOnTask: elapsedTime,
        errorCount: cart.length < 2 ? 1 : 0, // Error jika kurang dari 2 produk
        stepsCompleted: currentStep,
        productsAdded: cart.length,
        totalPrice: cartTotal
      };

      // Kirim ke API
      const response = await fetch("/api/testing/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result)
      });

      if (!response.ok) {
        console.error("Gagal menyimpan hasil testing");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Reset testing
  const handleReset = () => {
    setTaskStarted(false);
    setTaskCompleted(false);
    setCurrentStep(1);
    setCart([]);
    setSearchQuery("");
    setTimeStart(null);
    setElapsedTime(0);
  };

  // Format waktu
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!taskStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🛒</span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Usability Testing
            </h1>
            <p className="text-gray-600 mb-6">
              Simulasi belanja online untuk penelitian UX e-commerce
            </p>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">Instruksi:</h3>
              <ol className="text-left text-sm text-blue-700 space-y-1 list-decimal pl-4">
                <li>Cari produk menggunakan fitur pencarian</li>
                <li>Klik produk untuk melihat detail</li>
                <li>Tambahkan minimal 2 produk ke keranjang</li>
                <li>Lakukan proses checkout</li>
                <li>Konfirmasi pesanan</li>
              </ol>
            </div>

            {respondenId ? (
              <>
                <p className="text-sm text-gray-500 mb-6">
                  ID Responden: <span className="font-medium">{respondenId}</span>
                </p>
                <button
                  onClick={handleStartTesting}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  Mulai Testing
                </button>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-red-600 mb-4">
                  ID Responden tidak ditemukan. Silakan hubungi peneliti.
                </p>
                <button
                  onClick={() => window.location.href = "/"}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Kembali ke Halaman Utama
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header dengan progress */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Simulasi Belanja Online
              </h1>
              <p className="text-gray-600">
                Selesaikan semua langkah untuk menyelesaikan testing
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-sm text-gray-500">Waktu</div>
                <div className="text-xl font-bold text-blue-600">
                  {formatTime(elapsedTime)}
                </div>
              </div>
              
              {taskCompleted && (
                <div className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium">
                  ✅ Selesai
                </div>
              )}
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mt-6">
            <div className="flex justify-between relative">
              <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 -z-10"></div>
              <div 
                className="absolute top-4 left-0 h-1 bg-green-500 -z-10 transition-all duration-300"
                style={{ width: `${(currentStep / tasks.length) * 100}%` }}
              ></div>
              
              {tasks.map((task) => (
                <div key={task.id} className="flex flex-col items-center relative">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-white font-bold
                    ${task.id <= currentStep 
                      ? 'bg-green-500' 
                      : 'bg-gray-300'
                    }
                  `}>
                    {task.id < currentStep ? '✓' : task.id}
                  </div>
                  <div className="mt-2 text-center">
                    <div className={`text-sm font-medium ${
                      task.id <= currentStep ? 'text-gray-800' : 'text-gray-400'
                    }`}>
                      {task.title}
                    </div>
                    {task.id === currentStep && (
                      <div className="text-xs text-gray-500 mt-1 max-w-[120px]">
                        {task.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kiri: Daftar Produk */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Daftar Produk</h2>
                <div className="relative w-64">
                  <input
                    type="text"
                    placeholder="Cari produk..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    🔍
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="text-4xl text-center mb-3">
                      {product.image}
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-blue-600 mb-3">
                      Rp {product.price.toLocaleString("id-ID")}
                    </p>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={taskCompleted}
                      className={`w-full py-2 rounded-lg font-medium ${
                        taskCompleted
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      + Tambah ke Keranjang
                    </button>
                  </div>
                ))}
              </div>
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-3">😕</div>
                  <p>Produk tidak ditemukan. Coba kata kunci lain.</p>
                </div>
              )}
            </div>
          </div>

          {/* Kanan: Keranjang & Checkout */}
          <div className="space-y-6">
            {/* Keranjang */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Keranjang Belanja ({cart.length})
              </h2>
              
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-3">🛒</div>
                  <p>Keranjang masih kosong</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center">
                          <div className="text-2xl mr-3">{item.image}</div>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-500">
                              Rp {item.price.toLocaleString("id-ID")} × {item.quantity}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="font-bold text-gray-800 mr-3">
                            Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                          </div>
                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex justify-between text-lg font-bold text-gray-800">
                      <span>Total</span>
                      <span>Rp {cartTotal.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Checkout */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Checkout</h2>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    Status Tugas
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li className="flex items-center">
                      <span className="mr-2">
                        {cart.length >= 2 ? "✅" : "⭕"}
                      </span>
                      Tambah minimal 2 produk ke keranjang
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">
                        {currentStep >= 4 ? "✅" : "⭕"}
                      </span>
                      Lanjutkan ke proses checkout
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">
                        {taskCompleted ? "✅" : "⭕"}
                      </span>
                      Selesaikan pesanan
                    </li>
                  </ul>
                </div>

                {currentStep === 4 && !taskCompleted && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">
                      Lanjutkan ke Checkout
                    </h3>
                    <p className="text-sm text-yellow-700 mb-3">
                      Klik tombol di bawah untuk menyelesaikan proses checkout
                    </p>
                    <button
                      onClick={handleCheckout}
                      className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:opacity-90"
                    >
                      Proses Checkout
                    </button>
                  </div>
                )}

                {taskCompleted && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="text-4xl mb-3">🎉</div>
                      <h3 className="font-bold text-green-800 text-lg mb-2">
                        Testing Selesai!
                      </h3>
                      <p className="text-green-700 mb-4">
                        Terima kasih telah berpartisipasi dalam penelitian ini.
                      </p>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Waktu penyelesaian: {formatTime(elapsedTime)}</p>
                        <p>Jumlah produk: {cart.length} item</p>
                        <p>Total belanja: Rp {cartTotal.toLocaleString("id-ID")}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Ulangi Testing
                  </button>
                  <button
                    onClick={() => window.location.href = "/"}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Kembali ke Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}