const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search?count=1&language=en&format=json&name='
const FORECAST_URL = (lat, lon, days = 7) =>
  `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&forecast_days=${days}&timezone=auto&temperature_unit=celsius`

const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes

function cacheGet(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Date.now() - parsed._ts > CACHE_TTL_MS) {
      localStorage.removeItem(key)
      return null
    }
    return parsed.value
  } catch (e) {
    return null
  }
}

function cacheSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify({ _ts: Date.now(), value }))
  } catch (e) {
    // ignore
  }
}

export async function getWeatherByCity(city, days = 7, unit = 'C') {
  const key = `weather:city:${city.toLowerCase()}:d${days}:u${unit}`
  const cached = cacheGet(key)
  if (cached) return cached

  // geocode
  const g = await fetch(GEOCODE_URL + encodeURIComponent(city))
  if (!g.ok) throw new Error('Geocoding failed')
  const geodata = await g.json()
  if (!geodata.results || geodata.results.length === 0) throw new Error('No location found')
  const r = geodata.results[0]

  const result = await getWeatherByCoords(r.latitude, r.longitude, r.name, r.country, days, unit)
  cacheSet(key, result)
  return result
}

export async function getWeatherByCoords(lat, lon, name = null, country = null, days = 7, unit = 'C') {
  const key = `weather:coords:${lat},${lon}:d${days}:u${unit}`
  const cached = cacheGet(key)
  if (cached) return cached
  const tempUnit = unit === 'F' ? 'fahrenheit' : 'celsius'
  const url = FORECAST_URL(lat, lon, days).replace('temperature_unit=celsius', `temperature_unit=${tempUnit}`)
  const resp = await fetch(url)
  if (!resp.ok) throw new Error('Forecast request failed')
  const data = await resp.json()

  const current = data.current_weather || null
  const daily = data.daily || {}

  const parsed = {
    location: { name, country, lat, lon },
    current: current
      ? {
          temperature: current.temperature,
          weathercode: current.weathercode,
          windspeed: current.windspeed
        }
      : null,
    daily: (daily.time || []).map((date, i) => ({
      date,
      temp_max: daily.temperature_2m_max ? daily.temperature_2m_max[i] : null,
      temp_min: daily.temperature_2m_min ? daily.temperature_2m_min[i] : null,
      precipitation: daily.precipitation_sum ? daily.precipitation_sum[i] : null,
      weathercode: daily.weathercode ? daily.weathercode[i] : null
    }))
  }

  cacheSet(key, parsed)
  return parsed
}

// Optional proxy helper: try fetch to /api/weather if available
export async function tryProxyCity(city) {
  try {
    const resp = await fetch(`/api/weather?city=${encodeURIComponent(city)}`)
    if (!resp.ok) return null
    const j = await resp.json()
    return {
      location: { name: j.city || city, country: j.country },
      current: {
        temperature: j.temperature,
        weathercode: null,
        windspeed: j.wind_speed
      },
      daily: []
    }
  } catch (e) {
    return null
  }
}

export async function searchLocations(query) {
  if (!query || !query.trim()) return []
  try {
    const resp = await fetch(GEOCODE_URL + encodeURIComponent(query))
    if (!resp.ok) return []
    const j = await resp.json()
    if (!j.results) return []
    return j.results.map(r => ({ name: r.name, latitude: r.latitude, longitude: r.longitude, country: r.country }))
  } catch (e) {
    return []
  }
}
