import React, { useState, useRef, useEffect } from 'react';
import WeatherCard from './components/WeatherCard';
import Settings from './components/Settings';
import { saveForecast, saveRecent as saveRecentDB, getAllRecents } from './db/indexeddb';
import {
  getWeatherByCity,
  tryProxyCity,
  searchLocations,
  getWeatherByCoords,
} from './api/weatherService';

export default function App() {
  const [showTips, setShowTips] = useState(true);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem('weather_settings')) || {
          units: 'C',
          days: 7,
          theme: 'dark',
          autoRefresh: 0,
        }
      );
    } catch {
      return { units: 'C', days: 7, theme: 'dark', autoRefresh: 0 };
    }
  });

  const handleSearch = async () => {
    setError(null);
    setWeather(null);
    const q = city.trim();
    if (!q) {
      setError('Please enter a city');
      return;
    }

    setLoading(true);

    // Try local proxy first (if user runs a backend), then fallback to direct Open-Meteo via service
    try {
      const proxy = await tryProxyCity(q);
      if (proxy) {
        setWeather(proxy);
        await saveForecast(q.toLowerCase(), proxy);
        await saveRecentDB(q.toLowerCase(), q);
        addRecentLocal(q);
        setLoading(false);
        return;
      }
    } catch (e) {
      // ignore proxy errors and fallback
    }

    try {
      const res = await getWeatherByCity(q, settings.days, settings.units);
      setWeather(res);
      await saveForecast(q.toLowerCase(), res);
      await saveRecentDB(q.toLowerCase(), q);
      addRecentLocal(q);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Typeahead: debounce search for suggestions
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    clearTimeout(debounceRef.current);
    setSuggestLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchLocations(query);
        setSuggestions(res.slice(0, 6));
        setActiveIdx(-1);
      } finally {
        setSuggestLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // load recents from IndexedDB on mount
  useEffect(() => {
    let mounted = true;
    getAllRecents()
      .then((items) => {
        if (mounted) setRecent(items);
      })
      .catch((err) => {
        console.debug('getAllRecents error', err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // persist settings
  useEffect(() => {
    try {
      localStorage.setItem('weather_settings', JSON.stringify(settings));
    } catch (e) {
      console.debug('Failed to persist settings', e);
    }
  }, [settings]);

  // auto-refresh logic
  useEffect(() => {
    let timer = null;
    if (settings.autoRefresh && settings.autoRefresh > 0) {
      timer = setInterval(() => {
        if (city) handleSearch();
      }, settings.autoRefresh * 60 * 1000);
    }
    return () => clearInterval(timer);
  }, [settings.autoRefresh, city]);

  // preview when navigating suggestions
  const previewRef = useRef(null);
  useEffect(() => {
    clearTimeout(previewRef.current);
    if (activeIdx < 0 || !suggestions[activeIdx]) {
      setPreview(null);
      setPreviewLoading(false);
      return;
    }
    setPreviewLoading(true);
    previewRef.current = setTimeout(async () => {
      const s = suggestions[activeIdx];
      try {
        const p = await getWeatherByCoords(s.latitude, s.longitude, s.name, s.country, 1);
        setPreview(p);
      } catch (e) {
        setPreview(null);
      } finally {
        setPreviewLoading(false);
      }
    }, 150);
    return () => clearTimeout(previewRef.current);
  }, [activeIdx, suggestions]);

  // recent searches
  const [recent, setRecent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('recent_searches') || '[]');
    } catch {
      return [];
    }
  });

  function addRecentLocal(item) {
    const key = typeof item === 'string' ? item : item.name || item.location?.name;
    if (!key) return;
    const next = [key, ...recent.filter((r) => r !== key)].slice(0, 6);
    setRecent(next);
    localStorage.setItem('recent_searches', JSON.stringify(next));
  }

  function pickSuggestion(s) {
    setCity(s.name);
    setQuery(s.name);
    setSuggestions([]);
    setActiveIdx(-1);
    // optionally trigger search immediately
    handleSearch();
    addRecentLocal(s.name);
  }

  function onInputKey(e) {
    if (suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      setActiveIdx((i) => Math.max(i - 1, 0));
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (activeIdx >= 0 && suggestions[activeIdx]) {
        pickSuggestion(suggestions[activeIdx]);
        e.preventDefault();
      } else {
        handleSearch();
        addRecentLocal(query);
      }
    } else if (e.key === 'Escape') {
      setSuggestions([]);
    }
  }

  return (
    <div className="min-h-screen px-2 sm:px-6 py-6 bg-gradient-to-br from-slate-900 to-slate-950 text-slate-100">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-8">
          <div className="flex items-center gap-3">
            <div className="logo bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400 animate-gradient-x shadow-lg">W</div>
            <div>
              <div className="text-2xl font-extrabold tracking-tight">Weather App</div>
              <div className="text-xs sm:text-sm text-slate-400 font-medium">Current weather and 7-day forecast</div>
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="relative mb-4">
              <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 items-center">
                <div className="flex items-center gap-2">
                  <Settings settings={settings} onChange={setSettings} />
                </div>
                <input
                  className="flex-1 rounded-xl bg-slate-800/60 px-4 py-3 text-slate-100 focus:outline-none min-w-[180px] max-w-xs border border-slate-700 focus:ring-2 focus:ring-indigo-500"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setCity(e.target.value);
                  }}
                  onKeyDown={onInputKey}
                  placeholder="Search city, e.g. Bangkok"
                />
                <button
                  className="px-3 py-2 rounded-md bg-slate-700/40 text-sm border border-slate-700 hover:bg-slate-700/60 transition"
                  onClick={async () => {
                    if (!navigator.geolocation) return alert('Geolocation not supported');
                    navigator.geolocation.getCurrentPosition(
                      async (pos) => {
                        const lat = pos.coords.latitude;
                        const lon = pos.coords.longitude;
                        setLoading(true);
                        try {
                          const res = await getWeatherByCoords(
                            lat,
                            lon,
                            'Current location',
                            null,
                            settings.days,
                            settings.units
                          );
                          setWeather(res);
                          await saveForecast(`${lat},${lon}`, res);
                          await saveRecentDB(`${lat},${lon}`, `My Location`);
                          addRecentLocal('My Location');
                        } catch (e) {
                          setError(e.message);
                        } finally {
                          setLoading(false);
                        }
                      },
                      (err) => {
                        setError(err.message);
                      }
                    );
                  }}
                >
                  Use my location
                </button>
                {/* spinner for suggestions */}
                {suggestLoading && (
                  <div className="absolute right-28 top-3">
                    <svg
                      className="w-5 h-5 text-slate-300 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                  </div>
                )}
                <button
                  className="btn-accent shadow-lg"
                  onClick={() => {
                    handleSearch();
                    addRecentLocal(query);
                  }}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Search'}
                </button>
              </div>

              {/* suggestions dropdown */}
              {suggestions.length > 0 && (
                <ul className="absolute left-0 right-0 mt-2 bg-slate-800/80 rounded-lg backdrop-blur-sm shadow-lg z-20 overflow-hidden transition-all duration-200 ease-out transform origin-top">
                  {suggestions.map((s, i) => (
                    <li
                      key={`${s.name}-${i}`}
                      className={`px-4 py-2 cursor-pointer hover:bg-slate-700 ${
                        i === activeIdx ? 'bg-slate-700' : ''
                      }`}
                      onMouseDown={() => pickSuggestion(s)}
                      onMouseEnter={() => setActiveIdx(i)}
                    >
                      <div className="font-medium">
                        {s.name}
                        {s.country ? `, ${s.country}` : ''}
                      </div>
                      <div className="text-xs text-slate-400">
                        {s.latitude.toFixed(2)}, {s.longitude.toFixed(2)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* preview panel for highlighted suggestion */}
              {activeIdx >= 0 &&
                (() => {
                  const visible = preview || previewLoading;
                  const cls = `absolute top-full right-0 mt-2 w-80 z-30 transition-all duration-200 origin-top ${
                    visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                  }`;
                  return (
                    <div
                      className={cls}
                      onMouseDown={() => {
                        // clicking preview fills input but does not trigger search
                        const s = suggestions[activeIdx];
                        if (s) {
                          setQuery(s.name);
                          setCity(s.name);
                          setSuggestions([]);
                          setActiveIdx(-1);
                        }
                      }}
                    >
                      <div className="p-3 rounded-lg bg-slate-800/90 backdrop-blur-sm shadow-lg">
                        {previewLoading ? (
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-5 h-5 animate-spin text-slate-300"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                              ></path>
                            </svg>
                            <div className="text-sm text-slate-300">Loading preview...</div>
                          </div>
                        ) : preview ? (
                          <div>
                            <div className="text-sm font-medium">
                              {preview.location.name}
                              {preview.location.country ? `, ${preview.location.country}` : ''}
                            </div>
                            <div className="mt-2 text-2xl font-bold">
                              {preview.current?.temperature ?? '—'}°C
                            </div>
                            <div className="text-sm text-slate-400">
                              Wind: {preview.current?.windspeed ?? '—'} m/s
                            </div>
                            <div className="mt-3">
                              <button
                                className="btn-accent mr-2"
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  const s = suggestions[activeIdx];
                                  if (s) {
                                    setQuery(s.name);
                                    setCity(s.name);
                                    setSuggestions([]);
                                    setActiveIdx(-1);
                                  }
                                }}
                              >
                                Use
                              </button>
                              <button
                                className="px-3 py-1 rounded bg-transparent border border-slate-600 text-slate-300"
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  pickSuggestion(suggestions[activeIdx]);
                                }}
                              >
                                Search
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-slate-400">No preview</div>
                        )}
                      </div>
                    </div>
                  );
                })()}

              {/* recent searches */}
              {recent.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-slate-400 mb-1">Recent</div>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((r) => (
                      <button
                        key={r}
                        className="px-2 py-1 text-xs rounded-full bg-slate-700/40 text-slate-100 hover:bg-slate-700"
                        onClick={() => {
                          setQuery(r);
                          setCity(r);
                          handleSearch();
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && <div className="text-sm text-red-400 mb-3">{error}</div>}

            {weather ? (
              <WeatherCard weather={weather} />
            ) : (
              <div className="text-sm text-slate-400">
                Enter a city and press Search. The app will try a local proxy at{' '}
                <code>/api/weather</code>, then fallback to Open-Meteo directly.
              </div>
            )}
          </div>

          <aside>
            {showTips && (
              <div className="tips-card mt-1 p-2 text-xs max-w-xs relative animate-fadein">
                <button
                  className="absolute top-1 right-2 text-slate-400 hover:text-slate-200 text-base px-1"
                  aria-label="Close tips"
                  onClick={() => setShowTips(false)}
                  tabIndex={0}
                >
                  ×
                </button>
                <div className="font-semibold mb-1 text-xs">Tips</div>
                <ul className="ml-3 list-disc space-y-0.5">
                  <li>Use the Node proxy (<code>/proxy_example</code>) to avoid CORS in development.</li>
                  <li>Service worker caches recent API responses for offline view.</li>
                  <li>Click search to fetch current + forecast data.</li>
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
