// Simple emoji/icon mapping for Open-Meteo weather codes
export function iconForCode(code) {
  if (code === null || code === undefined) return '❓'
  if (code === 0) return '☀️'
  if (code === 1) return '🌤️'
  if (code <= 3) return '⛅'
  if (code <= 48) return '🌫️'
  if (code <= 67) return '🌦️'
  if (code <= 79) return '🌧️'
  if (code <= 84) return '❄️'
  return '🌈'
}
