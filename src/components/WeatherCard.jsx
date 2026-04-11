import React from 'react'

export default function WeatherCard({ city }) {
  return (
    <div className="card">
      <h2>{city || 'No city selected'}</h2>
      <p>Temperature: —</p>
      <p>Condition: —</p>
    </div>
  )
}
