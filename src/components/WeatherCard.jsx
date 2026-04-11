import React from 'react'
import { iconForCode } from '../icons/weatherIcons'
import TempChart from './TempChart'

export default function WeatherCard({ weather }) {
  if (!weather) return null

  const loc = weather.location || {}
  const cur = weather.current || {}

  return (
    <div className="card">
      <div className="location">{loc.name || 'Unknown'}{loc.country ? `, ${loc.country}` : ''}</div>

      <div className="current">
        <div className="big-icon">{iconForCode(cur.weathercode)}</div>
        <div>
          <div className="temp">{cur.temperature ?? '—'} °C</div>
          <div className="muted">Wind: {cur.windspeed ?? '—'} m/s</div>
        </div>
      </div>

      <div className="chart-wrap">
        <TempChart daily={weather.daily} />
      </div>

      <div className="daily-list">
        {weather.daily && weather.daily.map(d => (
          <div key={d.date} className="day">
            <div className="date">{new Date(d.date).toLocaleDateString()}</div>
            <div className="big-icon" style={{ fontSize: 26 }}>{iconForCode(d.weathercode)}</div>
            <div className="temp">{d.temp_max ?? '—'}° / {d.temp_min ?? '—'}°</div>
            <div className="muted">Rain: {d.precipitation ?? '—'} mm</div>
          </div>
        ))}
      </div>
    </div>
  )
}
