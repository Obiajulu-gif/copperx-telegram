"use client"

import { useEffect, useRef } from "react"

interface ChartData {
  name: string
  value: number
}

export function LineChart({ data }: { data: ChartData[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    const width = canvasRef.current.width
    const height = canvasRef.current.height
    const padding = 40

    // Find max value for scaling
    const maxValue = Math.max(...data.map((item) => item.value))

    // Draw axes
    ctx.beginPath()
    ctx.strokeStyle = "#e2e8f0"
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.stroke()

    // Draw line chart
    if (data.length > 1) {
      ctx.beginPath()
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 2

      const pointWidth = (width - padding * 2) / (data.length - 1)

      data.forEach((point, index) => {
        const x = padding + index * pointWidth
        const y = height - padding - (point.value / maxValue) * (height - padding * 2)

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()

      // Draw points
      data.forEach((point, index) => {
        const x = padding + index * pointWidth
        const y = height - padding - (point.value / maxValue) * (height - padding * 2)

        ctx.beginPath()
        ctx.fillStyle = "#3b82f6"
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw labels
      ctx.fillStyle = "#64748b"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"

      data.forEach((point, index) => {
        const x = padding + index * pointWidth
        ctx.fillText(point.name, x, height - padding + 15)
      })
    }
  }, [data])

  return <canvas ref={canvasRef} width={500} height={300} className="w-full h-auto" />
}

export function BarChart({ data }: { data: ChartData[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    const width = canvasRef.current.width
    const height = canvasRef.current.height
    const padding = 40

    // Find max value for scaling
    const maxValue = Math.max(...data.map((item) => item.value))

    // Draw axes
    ctx.beginPath()
    ctx.strokeStyle = "#e2e8f0"
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.stroke()

    // Draw bars
    const barWidth = ((width - padding * 2) / data.length) * 0.8
    const barSpacing = ((width - padding * 2) / data.length) * 0.2

    data.forEach((item, index) => {
      const x = padding + index * (barWidth + barSpacing)
      const barHeight = (item.value / maxValue) * (height - padding * 2)
      const y = height - padding - barHeight

      ctx.fillStyle = "#3b82f6"
      ctx.fillRect(x, y, barWidth, barHeight)

      // Draw value on top of bar
      ctx.fillStyle = "#64748b"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(item.value.toString(), x + barWidth / 2, y - 5)

      // Draw label below bar
      ctx.fillText(item.name, x + barWidth / 2, height - padding + 15)
    })
  }, [data])

  return <canvas ref={canvasRef} width={400} height={300} className="w-full h-auto" />
}

