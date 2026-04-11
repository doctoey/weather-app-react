import React from 'react'
import { iconForCode } from '../icons/weatherIcons'

export default function WeatherCard({ weather }) {
  if (!weather) return null

  const loc = weather.location || {}
  const cur = weather.current || {}

  return (
    <div className="card">
      <h2>{loc.name || 'Unknown'}{loc.country ? `, ${loc.country}` : ''}</h2>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ fontSize: 48 }}>{iconForCode(cur.weathercode)}</div>
        <div>
          <p style={{ margin: 0 }}><strong>{cur.temperature ?? '—'} °C</strong></p>
          <p style={{ margin: 0 }}>Wind: {cur.windspeed ?? '—'} m/s</p>
        </div>
      </div>

      <hr />

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
        {weather.daily && weather.daily.map(d => (
          <div key={d.date} style={{ minWidth: 120, padding: 8, background: '#fff', borderRadius: 6, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 18 }}>{new Date(d.date).toLocaleDateString()}</div>
            <div style={{ fontSize: 24 }}>{iconForCode(d.weathercode)}</div>
            <div>Max: {d.temp_max ?? '—'}°</div>
            <div>Min: {d.temp_min ?? '—'}°</div>
            <div>Rain: {d.precipitation ?? '—'} mm</div>
          </div>
        ))}
      </div>
    </div>
  )
}
