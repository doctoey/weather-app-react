import React from 'react'

export default function WeatherCard({ weather }) {
  if (!weather) return null

  return (
    <div className="card">
      <h2>{weather.city}{weather.country ? `, ${weather.country}` : ''}</h2>
      <p><strong>Temperature:</strong> {weather.temperature ?? '—'} °C</p>
      <p><strong>Condition:</strong> {weather.condition ?? '—'}</p>
      {weather.humidity !== null && <p><strong>Humidity:</strong> {weather.humidity}%</p>}
      {weather.wind_speed !== null && <p><strong>Wind:</strong> {weather.wind_speed} m/s</p>}
      {weather.precipitation !== null && <p><strong>Precipitation:</strong> {weather.precipitation} mm</p>}
    </div>
  )
}
