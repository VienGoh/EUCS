"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

type Role = "ADMIN" | "RESEARCHER"

const menuItems = [
  { href: "/dashboard", label: "Dashboard", role: ["ADMIN", "RESEARCHER"] },
  { href: "/respondents", label: "Responden", role: ["ADMIN", "RESEARCHER"] },
  { href: "/surveys", label: "Survei", role: ["ADMIN", "RESEARCHER"] },
  { href: "/analysis", label: "Analisis", role: ["ADMIN", "RESEARCHER"] },
  { href: "/visualization", label: "Visualisasi", role: ["ADMIN", "RESEARCHER"] },
  // { href: "/admin", label: "Admin", role: ["ADMIN"] }, // Uncomment jika ada
]

export default function Nav({ role }: { role: Role }) {
  const pathname = usePathname()
  
  const filteredMenu = menuItems.filter(item => 
    item.role.includes(role)
  )

  return (
    <nav className="flex gap-1 border-b">
      {filteredMenu.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              px-4 py-2 text-sm font-medium rounded-t-lg transition-colors
              ${isActive 
                ? "bg-white border border-b-0 border-slate-200 text-blue-600" 
                : "text-slate-600 hover:bg-slate-100"
              }
            `}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}