import React, { useState } from 'react'
import WeatherCard from './components/WeatherCard'

export default function App() {
  const [city, setCity] = useState('')
  const [message, setMessage] = useState('Enter a city and press Search.')

  const handleSearch = () => {
    if (!city.trim()) {
      setMessage('Please enter a city')
      return
    }
    setMessage(`Searching weather for ${city}... (not implemented)`) 
  }

  return (
    <div className="app">
      <h1>Weather App (React)</h1>
      <div className="search">
        <input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Bangkok" />
        <button onClick={handleSearch}>Search</button>
      </div>
      <p>{message}</p>
      <WeatherCard city={city} />
    </div>
  )
}
