'use client'

import type { TooltipProps } from 'recharts'
import { Card } from '@/components/ui/card'

interface ChartProps {
  children: React.ReactNode
  config: Record<string, { label: string; color: string }>
  className?: string
}

export function ChartContainer({ children, config, className }: ChartProps) {
  return <div className={className}>{children}</div>
}

type CustomTooltipProps = TooltipProps<number, string>

export function ChartTooltip({
  active,
  payload,
  label,
}: CustomTooltipProps) {
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

export function ChartTooltipContent(props: CustomTooltipProps) {
  return <ChartTooltip {...props} />
}
