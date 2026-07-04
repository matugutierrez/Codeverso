(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const raw = window.CODEVERSO_ACTIVITY || []
    const lookup = {}
    raw.forEach((d) => { lookup[d.activity_date] = Number(d.count) })
    const days = []
    const now = new Date()
    const tz = now.getTimezoneOffset() * 60000
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now - i * 86400000 - tz)
      const key = d.toISOString().slice(0, 10)
      days.push({
        label: d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
        value: lookup[key] || 0
      })
    }
    const container = document.getElementById('activity-chart')
    if (container) {
      const hasAny = days.some((d) => d.value > 0)
      if (!hasAny) {
        container.innerHTML = '<p style="color:#a6adc8;font-size:13px;">Todavia no hay actividad registrada en los ultimos 14 dias.</p>'
      } else {
        window.CodeversoCharts.barChart(container, days)
      }
    }
  })
})()
