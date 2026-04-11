import React, { useState } from 'react'
import WeatherCard from './components/WeatherCard'
import { getWeatherByCity, tryProxyCity } from './api/weatherService'

export default function App() {
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [weather, setWeather] = useState(null)
  const [error, setError] = useState(null)

  const handleSearch = async () => {
    setError(null)
    setWeather(null)
    const q = city.trim()
    if (!q) {
      setError('Please enter a city')
      return
    }

    setLoading(true)

    // Try local proxy first (if user runs a backend), then fallback to direct Open-Meteo via service
    try {
      const proxy = await tryProxyCity(q)
      if (proxy) {
        setWeather(proxy)
        setLoading(false)
        return
      }
    } catch (e) {
      // ignore proxy errors and fallback
    }

    try {
      const res = await getWeatherByCity(q)
      setWeather(res)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <h1>Weather App (React)</h1>
      <div className="search">
        <input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Bangkok" />
        <button onClick={handleSearch} disabled={loading}>{loading ? 'Loading...' : 'Search'}</button>
      </div>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {weather ? (
        <WeatherCard weather={weather} />
      ) : (
        <p>Enter a city and press Search. The app will try a local proxy at <code>/api/weather</code>, then fallback to Open-Meteo directly.</p>
      )}
    </div>
  )
}
