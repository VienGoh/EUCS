"use client"

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

export default function ProtectedLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  console.log("ProtectedLayout status:", { status, session: session?.user?.email })

  useEffect(() => {
    // Jika tidak ada session, redirect ke login
    if (status === "unauthenticated") {
      console.log("No session, redirecting to login")
      const callbackUrl = encodeURIComponent(pathname || '/dashboard')
      router.push(`/login?callbackUrl=${callbackUrl}`)
    }
  }, [status, router, pathname])

  // Tampilkan loading saat checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Jika sudah authenticated, tampilkan konten
  if (status === "authenticated" && session) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Simple Header */}
        <header className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <h1 className="font-bold text-xl">EUCS Dashboard</h1>
            <div className="text-sm text-gray-600">
              {session.user?.email} • {session.user?.role}
              <button 
                onClick={() => router.push('/api/auth/signout')}
                className="ml-4 px-3 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Simple Navigation */}
        <nav className="bg-white border-b">
          <div className="container mx-auto px-4 py-2 flex gap-4">
            <a href="/dashboard" className="px-4 py-2 hover:bg-gray-100 rounded">Dashboard</a>
            <a href="/respondents" className="px-4 py-2 hover:bg-gray-100 rounded">Responden</a>
            <a href="/surveys" className="px-4 py-2 hover:bg-gray-100 rounded">Survei</a>
            <a href="/analysis" className="px-4 py-2 hover:bg-gray-100 rounded">Analisis</a>
            <a href="/visualization" className="px-4 py-2 hover:bg-gray-100 rounded">Visualisasi</a>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>

        <footer className="mt-8 border-t pt-4 text-center text-sm text-gray-500">
          © 2024 EUCS Research System
        </footer>
      </div>
    )
  }

  // Return null jika masih dalam proses redirect
  return null
}