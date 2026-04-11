import React from 'react';
import { iconForCode } from '../icons/weatherIcons';
import TempChart from './TempChart';

export default function WeatherCard({ weather }) {
  if (!weather) return null;

  const loc = weather.location || {};
  const cur = weather.current || {};

  return (
    <div className="rounded-xl p-6 bg-gradient-to-b from-slate-800/60 to-slate-800/40 shadow-lg card-fade">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">
            {loc.name || 'Unknown'}
            {loc.country ? `, ${loc.country}` : ''}
          </div>
          <div className="text-sm text-slate-400">Current conditions</div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold">{cur.temperature ?? '—'}°C</div>
          <div className="text-sm text-slate-400">Wind: {cur.windspeed ?? '—'} m/s</div>
        </div>
      </div>

      <div className="flex gap-6 items-center mt-4">
        <div className="text-6xl">{iconForCode(cur.weathercode)}</div>
        <div className="flex-1">
          <TempChart daily={weather.daily} />
        </div>
      </div>

      <div className="mt-6 flex gap-3 overflow-x-auto">
        {weather.daily &&
          weather.daily.map((d) => (
            <div key={d.date} className="min-w-[120px] bg-slate-700/30 p-3 rounded-lg text-center">
              <div className="text-xs text-slate-400">{new Date(d.date).toLocaleDateString()}</div>
              <div className="text-2xl mt-2">{iconForCode(d.weathercode)}</div>
              <div className="mt-1 font-medium">
                {d.temp_max ?? '—'}° / {d.temp_min ?? '—'}°
              </div>
              <div className="text-xs text-slate-400 mt-1">Rain: {d.precipitation ?? '—'} mm</div>
            </div>
          ))}
      </div>
    </div>
  );
}
