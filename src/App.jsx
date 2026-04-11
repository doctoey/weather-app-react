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
    <div className="min-h-screen px-6 py-8 bg-gradient-to-b from-slate-900 to-slate-950 text-slate-100">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="logo bg-gradient-to-br from-indigo-600 to-cyan-500">W</div>
            <div>
              <div className="text-xl font-bold">Weather App</div>
              <div className="text-sm text-slate-400">Current weather and 7-day forecast</div>
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex gap-3 mb-4">
              <input className="flex-1 rounded-xl bg-slate-800 px-4 py-3 text-slate-100 focus:outline-none" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Bangkok" />
              <button className="btn-accent" onClick={handleSearch} disabled={loading}>{loading ? 'Loading...' : 'Search'}</button>
            </div>

            {error && <div className="text-sm text-red-400 mb-3">{error}</div>}

            {weather ? (
              <WeatherCard weather={weather} />
            ) : (
              <div className="text-sm text-slate-400">Enter a city and press Search. The app will try a local proxy at <code>/api/weather</code>, then fallback to Open-Meteo directly.</div>
            )}
          </div>

          <aside>
            <div className="p-4 rounded-xl bg-slate-800/40 backdrop-blur-sm"> 
              <div className="text-sm text-slate-300">Tips</div>
              <ul className="mt-2 text-slate-400 text-sm list-disc list-inside">
                <li>Use the Node proxy (`/proxy_example`) to avoid CORS in development.</li>
                <li>Service worker caches recent API responses for offline view.</li>
                <li>Click search to fetch current + forecast data.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
