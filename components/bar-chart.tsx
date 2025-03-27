"use client"

import { useTheme } from "next-themes"
import { useEffect, useRef } from "react"
import { formatCurrency } from "@/lib/utils"

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
  }[]
}

interface BarChartProps {
  data: ChartData
}

export function BarChart({ data }: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    const width = canvasRef.current.width
    const height = canvasRef.current.height
    const padding = 40
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Find max value for scaling
    const maxValue = Math.max(...data.datasets[0].data, 1)
    const barWidth = chartWidth / data.labels.length / 1.5

    // Colors
    const textColor = isDark ? "#e1e1e1" : "#333333"
    const barColorStart = isDark ? "#3b82f6" : "#2563eb"
    const barColorEnd = isDark ? "#1d4ed8" : "#3b82f6"
    const gridColor = isDark ? "#333333" : "#e5e5e5"

    // Draw axes
    ctx.strokeStyle = textColor
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.stroke()

    // Draw grid lines
    ctx.strokeStyle = gridColor
    ctx.lineWidth = 0.5
    const gridLines = 5
    for (let i = 1; i <= gridLines; i++) {
      const y = height - padding - (i * chartHeight) / gridLines
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()

      // Draw grid value
      ctx.fillStyle = textColor
      ctx.textAlign = "right"
      ctx.textBaseline = "middle"
      ctx.font = "10px sans-serif"
      ctx.fillText(formatCurrency(Math.round((maxValue * i) / gridLines)), padding - 5, y)
    }

    // Create gradient for bars
    const gradient = ctx.createLinearGradient(0, height - padding, 0, padding)
    gradient.addColorStop(0, barColorStart)
    gradient.addColorStop(1, barColorEnd)

    // Draw bars and labels
    data.labels.forEach((label, index) => {
      const value = data.datasets[0].data[index]
      const barHeight = (value / maxValue) * chartHeight
      const x = padding + (index * chartWidth) / data.labels.length + (chartWidth / data.labels.length - barWidth) / 2
      const y = height - padding - barHeight

      // Draw bar with gradient
      ctx.fillStyle = gradient
      ctx.fillRect(x, y, barWidth, barHeight)

      // Add rounded top to bar
      ctx.beginPath()
      ctx.arc(x + barWidth / 2, y, barWidth / 2, 0, Math.PI, true)
      ctx.fillStyle = gradient
      ctx.fill()

      // Draw value on top of bar
      ctx.fillStyle = textColor
      ctx.textAlign = "center"
      ctx.textBaseline = "bottom"
      ctx.font = "bold 12px sans-serif"
      ctx.fillText(formatCurrency(value), x + barWidth / 2, y - 10)

      // Draw label below bar
      ctx.fillStyle = textColor
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      ctx.font = "10px sans-serif"
      ctx.fillText(label, x + barWidth / 2, height - padding + 5)
    })

    // Draw chart title
    ctx.fillStyle = textColor
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    ctx.font = "bold 14px sans-serif"
    ctx.fillText(data.datasets[0].label, width / 2, 15)
  }, [data, resolvedTheme, isDark])

  return <canvas ref={canvasRef} width={800} height={300} className="w-full h-full" />
}

