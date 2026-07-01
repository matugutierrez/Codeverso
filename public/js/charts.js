(function () {
  function svgEl(tag, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag)
    Object.keys(attrs || {}).forEach((k) => el.setAttribute(k, attrs[k]))
    return el
  }

  function barChart(container, data, options) {
    options = options || {}
    const width = container.clientWidth || 600
    const height = options.height || 160
    const padding = 28
    const max = Math.max(1, ...data.map((d) => d.value))
    const barWidth = (width - padding * 2) / data.length

    const svg = svgEl('svg', { width: width, height: height, viewBox: '0 0 ' + width + ' ' + height })

    data.forEach((d, i) => {
      const barHeight = ((height - padding * 2) * d.value) / max
      const x = padding + i * barWidth + barWidth * 0.15
      const y = height - padding - barHeight
      svg.appendChild(svgEl('rect', {
        x: x,
        y: y,
        width: barWidth * 0.7,
        height: barHeight,
        rx: 4,
        fill: options.color || 'var(--accent)'
      }))
      const label = svgEl('text', {
        x: x + (barWidth * 0.7) / 2,
        y: height - padding + 14,
        'text-anchor': 'middle',
        'font-size': '10',
        fill: '#a6adc8'
      })
      label.textContent = d.label
      svg.appendChild(label)

      const valueLabel = svgEl('text', {
        x: x + (barWidth * 0.7) / 2,
        y: y - 6,
        'text-anchor': 'middle',
        'font-size': '11',
        fill: '#cdd6f4'
      })
      valueLabel.textContent = d.value
      svg.appendChild(valueLabel)
    })

    container.innerHTML = ''
    container.appendChild(svg)
  }

  window.CodeversoCharts = { barChart }
})()
