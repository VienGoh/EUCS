  "use client";

  import Link from "next/link";
  import { usePathname } from "next/navigation";

  type Role = "ADMIN" | "PENELITI";

  type NavItem = {
    href: string;
    label: string;
    roles?: Role[];
  };

  export default function Nav({ role = "ADMIN" }: { role?: Role }) {
    const pathname = usePathname();

    const navItems: NavItem[] = [
      { href: "/dashboard", label: "Dashboard" },

      { href: "/responden", label: "Data Responden" },

      { href: "/testing/session", label: "Testing Session" }, // Tambahkan ini
      
      { href: "/usability-testing", label: "Analisis Hasil" }, // Ubah label
      
      { href: "/visualisasi", label: "Visualisasi Hasil" },

      // khusus PENELITI (analisis lanjutan / clustering)
      // {
      //   href: "/analytics/cluster",
      //   label: "Clusters",
      //   roles: ["PENELITI"],
      // },
    ];

    const items = navItems.filter(
      (item) => !item.roles || item.roles.includes(role)
    );

    const isActive = (href: string) =>
      pathname === href || pathname.startsWith(href + "/");

    return (
      <nav className="rounded-xl border bg-white px-2 py-2 shadow-sm">
        <ul className="flex flex-wrap gap-1">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={[
                  "inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition",
                  isActive(item.href)
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100",
                ].join(" ")}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    );
  }
