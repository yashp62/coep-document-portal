import { useEffect, useRef } from 'react'

// Simple Chart component using SVG
const SimpleChart = ({ data, type = 'line', width = 300, height = 200, color = '#3B82F6' }) => {
  const svgRef = useRef()

  useEffect(() => {
    if (!data || data.length === 0) return

    const svg = svgRef.current
    const margin = { top: 20, right: 30, bottom: 30, left: 40 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Clear previous content
    svg.innerHTML = ''

    // Find min/max values
    const values = data.map(d => d.value)
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)
    const valueRange = maxValue - minValue || 1

    // Create scales
    const xScale = (index) => (index / (data.length - 1)) * innerWidth
    const yScale = (value) => innerHeight - ((value - minValue) / valueRange) * innerHeight

    // Create container group
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('transform', `translate(${margin.left}, ${margin.top})`)

    if (type === 'line') {
      // Create line path
      const pathData = data.map((d, i) => {
        const x = xScale(i)
        const y = yScale(d.value)
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
      }).join(' ')

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('d', pathData)
      path.setAttribute('stroke', color)
      path.setAttribute('stroke-width', '2')
      path.setAttribute('fill', 'none')
      g.appendChild(path)

      // Add dots
      data.forEach((d, i) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        circle.setAttribute('cx', xScale(i))
        circle.setAttribute('cy', yScale(d.value))
        circle.setAttribute('r', '3')
        circle.setAttribute('fill', color)
        g.appendChild(circle)
      })
    } else if (type === 'bar') {
      // Create bars
      const barWidth = innerWidth / data.length * 0.8
      const barSpacing = innerWidth / data.length * 0.2

      data.forEach((d, i) => {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        const x = (innerWidth / data.length) * i + barSpacing / 2
        const barHeight = ((d.value - minValue) / valueRange) * innerHeight
        const y = innerHeight - barHeight

        rect.setAttribute('x', x)
        rect.setAttribute('y', y)
        rect.setAttribute('width', barWidth)
        rect.setAttribute('height', barHeight)
        rect.setAttribute('fill', color)
        rect.setAttribute('opacity', '0.8')
        g.appendChild(rect)
      })
    }

    // Add axes
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    xAxis.setAttribute('x1', 0)
    xAxis.setAttribute('x2', innerWidth)
    xAxis.setAttribute('y1', innerHeight)
    xAxis.setAttribute('y2', innerHeight)
    xAxis.setAttribute('stroke', '#E5E7EB')
    g.appendChild(xAxis)

    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    yAxis.setAttribute('x1', 0)
    yAxis.setAttribute('x2', 0)
    yAxis.setAttribute('y1', 0)
    yAxis.setAttribute('y2', innerHeight)
    yAxis.setAttribute('stroke', '#E5E7EB')
    g.appendChild(yAxis)

    svg.appendChild(g)
  }, [data, type, width, height, color])

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="border border-gray-200 rounded-lg bg-white"
    >
    </svg>
  )
}

// Simple Progress Ring component
const ProgressRing = ({ value, max = 100, size = 120, strokeWidth = 8, color = '#3B82F6' }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const progress = (value / max) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-gray-900">{Math.round((value / max) * 100)}%</span>
      </div>
    </div>
  )
}

export { SimpleChart, ProgressRing }