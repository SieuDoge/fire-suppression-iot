/* Tiện ích xuất dữ liệu — tải file CSV / sao chép JSON. */

function downloadBlob(content, filename, mime = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportIncidentsCSV(incidents) {
  if (!incidents.length) {
    alert('No incidents to export!')
    return false
  }
  const rows = ['ID,Level,Zone,Max Temp (C),Water Used (L),Response Time (s),Time,Result']
  incidents.forEach((i) => {
    rows.push(
      `${i.id},${i.level},${i.zone},${i.maxTemp.toFixed(1)},${i.waterUsed.toFixed(1)},${(i.responseTime / 1000).toFixed(1)},${i.startStr},${i.result}`
    )
  })
  downloadBlob(rows.join('\n'), `fss_incidents_${Date.now()}.csv`)
  return true
}

export function exportDataCSV(state, uptimeSec) {
  const rows = ['Timestamp,Temperature (C),Pan Angle,Tilt Angle,Water Used (L),Uptime (s)']
  const len = state.tempHistory.length
  for (let i = 0; i < len; i++) {
    const temp = state.tempHistory[i] || 0
    const pan = state.panHistory[i] || 90
    const tilt = state.tiltHistory[i] || 0
    rows.push(`-${len - i}s,${temp.toFixed(1)},${pan},${tilt},${state.waterUsed.toFixed(1)},${uptimeSec - (len - i)}`)
  }
  downloadBlob(rows.join('\n'), `fss_analytics_data_${Date.now()}.csv`)
}

export function copyDataJSON(state) {
  return navigator.clipboard.writeText(JSON.stringify(state, null, 2)).catch(() => {})
}
