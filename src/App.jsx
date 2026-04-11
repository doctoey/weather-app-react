import React, { useState, useRef, useEffect } from 'react'
import WeatherCard from './components/WeatherCard'
import { getWeatherByCity, tryProxyCity, searchLocations } from './api/weatherService'

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

  // Typeahead: debounce search for suggestions
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [activeIdx, setActiveIdx] = useState(-1)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (!query) {
      setSuggestions([])
      return
    }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const res = await searchLocations(query)
      setSuggestions(res.slice(0, 6))
      setActiveIdx(-1)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  // recent searches
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem('recent_searches') || '[]') } catch { return [] }
  })

  function saveRecent(item) {
    const key = typeof item === 'string' ? item : item.name || item.location?.name
    if (!key) return
    const next = [key, ...recent.filter(r => r !== key)].slice(0, 6)
    setRecent(next)
    localStorage.setItem('recent_searches', JSON.stringify(next))
  }

  function pickSuggestion(s) {
    setCity(s.name)
    setQuery(s.name)
    setSuggestions([])
    setActiveIdx(-1)
    // optionally trigger search immediately
    handleSearch()
    saveRecent(s.name)
  }

  function onInputKey(e) {
    if (suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1))
      e.preventDefault()
    } else if (e.key === 'ArrowUp') {
      setActiveIdx(i => Math.max(i - 1, 0))
      e.preventDefault()
    } else if (e.key === 'Enter') {
      if (activeIdx >= 0 && suggestions[activeIdx]) {
        pickSuggestion(suggestions[activeIdx])
        e.preventDefault()
      } else {
        handleSearch()
        saveRecent(query)
      }
    } else if (e.key === 'Escape') {
      setSuggestions([])
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
                <div className="relative mb-4">
                  <div className="flex gap-3">
                    <input
                      className="flex-1 rounded-xl bg-slate-800 px-4 py-3 text-slate-100 focus:outline-none"
                      value={query}
                      onChange={e => { setQuery(e.target.value); setCity(e.target.value) }}
                      onKeyDown={onInputKey}
                      placeholder="Search city, e.g. Bangkok"
                    />
                    <button className="btn-accent" onClick={() => { handleSearch(); saveRecent(query) }} disabled={loading}>{loading ? 'Loading...' : 'Search'}</button>
                  </div>

                  {/* suggestions dropdown */}
                  {(suggestions.length > 0) && (
                    <ul className="absolute left-0 right-0 mt-2 bg-slate-800/80 rounded-lg backdrop-blur-sm shadow-lg z-20 overflow-hidden">
                      {suggestions.map((s, i) => (
                        <li key={`${s.name}-${i}`} className={`px-4 py-2 cursor-pointer hover:bg-slate-700 ${i === activeIdx ? 'bg-slate-700' : ''}`} onMouseDown={() => pickSuggestion(s)}>
                          <div className="font-medium">{s.name}{s.country ? `, ${s.country}` : ''}</div>
                          <div className="text-xs text-slate-400">{s.latitude.toFixed(2)}, {s.longitude.toFixed(2)}</div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* recent searches */}
                  {recent.length > 0 && (
                    <div className="mt-2 text-sm text-slate-400">Recent: {recent.map((r, idx) => (
                      <button key={r} className="ml-2 text-slate-300 hover:underline" onClick={() => { setQuery(r); setCity(r); handleSearch(); }}>{r}</button>
                    ))}</div>
                  )}

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
