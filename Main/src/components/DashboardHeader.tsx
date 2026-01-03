interface DashboardHeaderProps {
  title: string
  subtitle?: string
  children?: React.ReactNode
}

export default function DashboardHeader({ title, subtitle, children }: DashboardHeaderProps) {
  return (
    <div className="border-b bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          {children}
        </div>
      </div>
    </div>
  )
}