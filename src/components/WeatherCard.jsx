import React from 'react';
import { iconForCode } from '../icons/weatherIcons';
import TempChart from './TempChart';

export default function WeatherCard({ weather }) {
  if (!weather) return null;

  const loc = weather.location || {};
  const cur = weather.current || {};

  return (
    <div className="rounded-2xl p-6 bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl card-fade">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-400 flex items-center justify-center text-5xl shadow-inner">
            {iconForCode(cur.weathercode)}
          </div>
          <div>
            <div className="text-2xl font-semibold">{loc.name || 'Unknown'}</div>
            <div className="text-sm text-slate-300">{loc.country || ''} • Current</div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-5xl font-extrabold">{cur.temperature ?? '—'}°</div>
          <div className="text-sm text-slate-300">Wind {cur.windspeed ?? '—'} m/s • {cur.winddirection ?? ''}</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2">
          <div className="bg-white/10 p-3 rounded-xl">
            <TempChart daily={weather.daily} />
          </div>
          <div className="mt-4 flex gap-3 overflow-x-auto py-1 daily-scroll">
            {weather.daily &&
              weather.daily.map((d) => (
                <div
                  key={d.date}
                  className="min-w-[110px] bg-white/5 p-3 rounded-xl text-center flex-shrink-0 border border-white/10 hover:scale-105 transition-transform duration-150"
                >
                  <div className="text-xs text-slate-300">{new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' })}</div>
                  <div className="text-2xl mt-2">{iconForCode(d.weathercode)}</div>
                  <div className="mt-1 font-medium">
                    <span className="text-indigo-200">{d.temp_max ?? '—'}°</span>
                    <span className="text-slate-400"> / {d.temp_min ?? '—'}°</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Rain {d.precipitation ?? '—'} mm</div>
                </div>
              ))}
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-sm text-slate-300">Details</div>
            <div className="mt-3 text-xs text-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Humidity</span>
                <span className="font-medium">{cur.humidity ?? '—'}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pressure</span>
                <span className="font-medium">{cur.pressure ?? '—'} hPa</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">UV Index</span>
                <span className="font-medium">{cur.uv_index ?? '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
