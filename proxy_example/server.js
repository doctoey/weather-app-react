const express = require('express')
const cors = require('cors')
const axios = require('axios')

const app = express()
app.use(cors())

const GEOCODE = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST = 'https://api.open-meteo.com/v1/forecast'

app.get('/api/weather', async (req, res) => {
  const { city, lat, lon } = req.query

  try {
    let latitude = lat
    let longitude = lon
    let name = null
    let country = null

    if (city) {
      const g = await axios.get(GEOCODE, { params: { name: city, count: 1, format: 'json' }, timeout: 10000 })
      if (!g.data || !g.data.results || g.data.results.length === 0) {
        return res.status(404).json({ error: 'not found' })
      }
      const loc = g.data.results[0]
      latitude = loc.latitude
      longitude = loc.longitude
      name = loc.name
      country = loc.country
    }

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'provide city or lat+lon' })
    }

    const f = await axios.get(FORECAST, {
      params: {
        latitude,
        longitude,
        current_weather: true,
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode',
        forecast_days: 7,
        timezone: 'auto',
        temperature_unit: 'celsius'
      },
      timeout: 10000
    })

    const data = f.data || {}
    const current = data.current_weather || {}
    const daily = (data.daily && data.daily.time) ? data.daily.time.map((d, i) => ({
      date: d,
      temp_max: data.daily.temperature_2m_max ? data.daily.temperature_2m_max[i] : null,
      temp_min: data.daily.temperature_2m_min ? data.daily.temperature_2m_min[i] : null,
      precipitation: data.daily.precipitation_sum ? data.daily.precipitation_sum[i] : null,
      weathercode: data.daily.weathercode ? data.daily.weathercode[i] : null
    })) : []

    return res.json({
      city: name,
      country: country,
      temperature: current.temperature,
      wind_speed: current.windspeed,
      weathercode: current.weathercode,
      daily
    })
  } catch (err) {
    console.error('proxy error:', err.message)
    return res.status(502).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Proxy server listening on http://localhost:${PORT}`))
