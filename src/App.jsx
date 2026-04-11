import React, { useState } from 'react'
import WeatherCard from './components/WeatherCard'

const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search?count=1&language=en&format=json&name='
const FORECAST_URL = (lat, lon) => `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius`

export default function App() {
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [weather, setWeather] = useState(null)
  const [error, setError] = useState(null)

  const mapWeatherCode = (code) => {
    if (code === 0) return 'Clear'
    if (code <= 3) return 'Mainly clear / partly cloudy'
    if (code <= 49) return 'Fog / Depositing rime'
    if (code <= 69) return 'Drizzle / Freezing Drizzle'
    if (code <= 79) return 'Rain'
    if (code <= 84) return 'Snow'
    return 'Unusual'
  }

  const handleSearch = async () => {
    setError(null)
    setWeather(null)

    const q = city.trim()
    if (!q) {
      setError('Please enter a city')
      return
    }

    setLoading(true)

    // First try calling a backend proxy at /api/weather (if user has Flask running)
    try {
      const proxyResp = await fetch(`/api/weather?city=${encodeURIComponent(q)}`)
      if (proxyResp.ok) {
        const data = await proxyResp.json()
        setWeather({
          city: data.city || q,
          country: data.country,
          temperature: data.temperature,
          condition: data.condition,
          humidity: data.humidity,
          wind_speed: data.wind_speed,
          precipitation: data.precipitation
        })
        setLoading(false)
        return
      }
      // if proxy returns not found or error, fallback to direct Open-Meteo
    } catch (e) {
      // ignore and fallback
    }

    // Direct Open-Meteo calls
    try {
      const g = await fetch(GEOCODE_URL + encodeURIComponent(q))
      const geodata = await g.json()
      if (!geodata.results || geodata.results.length === 0) {
        setError('No location found for that city')
        setLoading(false)
        return
      }

      const res = geodata.results[0]
      const lat = res.latitude
      const lon = res.longitude

      const f = await fetch(FORECAST_URL(lat, lon))
      const fdata = await f.json()
      const current = fdata.current_weather

      if (!current) {
        setError('No weather data available')
        setLoading(false)
        return
      }

      setWeather({
        city: res.name || q,
        country: res.country,
        temperature: current.temperature,
        condition: mapWeatherCode(current.weathercode),
        humidity: null,
        wind_speed: current.windspeed,
        precipitation: null
      })
    } catch (e) {
      setError('Unable to fetch weather: ' + e.message)
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
