(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const data = window.CODEVERSO_ACTIVITY || []
    const chartData = data.map((d) => ({
      label: new Date(d.activity_date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
      value: Number(d.count)
    }))
    const container = document.getElementById('activity-chart')
    if (container) {
      if (chartData.length === 0) {
        container.innerHTML = '<p style="color:#a6adc8;font-size:13px;">Todavia no hay actividad registrada en los ultimos 14 dias.</p>'
      } else {
        window.CodeversoCharts.barChart(container, chartData)
      }
    }
  })
})()
