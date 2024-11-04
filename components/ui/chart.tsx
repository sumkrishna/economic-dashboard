'use client'

import { TooltipProps } from 'recharts'
import { Card } from '@/components/ui/card'

interface ChartProps {
  children: React.ReactNode
  config: Record<string, { label: string; color: string }>
  className?: string
}

export function ChartContainer({ children, config, className }: ChartProps) {
  return <div className={className}>{children}</div>
}

export function ChartTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload) return null
  return (
    <Card className="p-2 shadow-sm">
      <p className="text-sm font-medium">{label}</p>
      {payload.map((item, i) => (
        <p key={i} className="text-xs" style={{ color: item.color }}>
          {item.name}: {item.value}
        </p>
      ))}
    </Card>
  )
}

export function ChartTooltipContent(props: TooltipProps<number, string>) {
  return <ChartTooltip {...props} />
}
