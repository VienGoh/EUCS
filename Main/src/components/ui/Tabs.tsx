'use client';

import * as React from "react"

interface TabsProps {
  defaultValue: string
  children: React.ReactNode
  className?: string
}

export function Tabs({ defaultValue, children, className }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue)
  
  const childrenArray = React.Children.toArray(children)
  const tabsList = childrenArray.find((child: any) => child.type === TabsList)
  const tabsContent = childrenArray.filter((child: any) => child.type === TabsContent)
  
  return (
    <div className={className}>
      {tabsList && React.cloneElement(tabsList as any, { activeTab, setActiveTab })}
      {tabsContent}
    </div>
  )
}

export function TabsList({ children, activeTab, setActiveTab }: any) {
  const enhancedChildren = React.Children.map(children, (child: any) => {
    return React.cloneElement(child, { 
      active: child.props.value === activeTab,
      onClick: () => setActiveTab(child.props.value)
    })
  })
  
  return (
    <div className="flex space-x-2 border-b">
      {enhancedChildren}
    </div>
  )
}

export function TabsTrigger({ children, active, onClick, value }: any) {
  return (
    <button
      className={`px-4 py-2 font-medium ${active ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export function TabsContent({ children, value, activeTab }: any) {
  if (value !== activeTab) return null
  return <div className="mt-4">{children}</div>
}