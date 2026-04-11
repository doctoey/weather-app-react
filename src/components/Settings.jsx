import React, { useState } from 'react';

export default function Settings({ settings, onChange }) {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState(settings);

  function apply() {
    onChange(local);
    setOpen(false);
  }

  return (
    <div>
      <button className="px-3 py-2 rounded bg-slate-700 text-sm" onClick={() => setOpen(true)}>
        Settings
      </button>

      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)}></div>
          <div className="bg-slate-800 rounded-lg p-6 z-50 w-[420px]">
            <h3 className="text-lg font-semibold mb-3">Settings</h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-slate-300">Units</div>
                <div className="mt-1 flex gap-2">
                  <button
                    className={`px-3 py-1 rounded ${
                      local.units === 'C' ? 'bg-indigo-600' : 'bg-slate-700'
                    }`}
                    onClick={() => setLocal({ ...local, units: 'C' })}
                  >
                    °C
                  </button>
                  <button
                    className={`px-3 py-1 rounded ${
                      local.units === 'F' ? 'bg-indigo-600' : 'bg-slate-700'
                    }`}
                    onClick={() => setLocal({ ...local, units: 'F' })}
                  >
                    °F
                  </button>
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-300">Forecast days</div>
                <select
                  value={local.days}
                  onChange={(e) => setLocal({ ...local, days: Number(e.target.value) })}
                  className="mt-1 bg-slate-700 px-2 py-1 rounded"
                >
                  <option value={3}>3 days</option>
                  <option value={5}>5 days</option>
                  <option value={7}>7 days</option>
                </select>
              </div>

              <div>
                <div className="text-sm text-slate-300">Auto-refresh</div>
                <select
                  value={local.autoRefresh}
                  onChange={(e) => setLocal({ ...local, autoRefresh: Number(e.target.value) })}
                  className="mt-1 bg-slate-700 px-2 py-1 rounded"
                >
                  <option value={0}>Off</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>

              <div>
                <div className="text-sm text-slate-300">Theme</div>
                <div className="mt-1 flex gap-2">
                  <button
                    className={`px-3 py-1 rounded ${
                      local.theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-700'
                    }`}
                    onClick={() => setLocal({ ...local, theme: 'dark' })}
                  >
                    Dark
                  </button>
                  <button
                    className={`px-3 py-1 rounded ${
                      local.theme === 'light' ? 'bg-indigo-600' : 'bg-slate-700'
                    }`}
                    onClick={() => setLocal({ ...local, theme: 'light' })}
                  >
                    Light
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button className="px-3 py-1 rounded bg-slate-700" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="px-3 py-1 rounded btn-accent" onClick={apply}>
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
