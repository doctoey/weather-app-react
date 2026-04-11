// Minimal IndexedDB helper for storing recent searches and forecasts
const DB_NAME = 'weather_app_db'
const DB_VER = 1
const STORE_FORECASTS = 'forecasts'
const STORE_RECENT = 'recent'

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_FORECASTS)) db.createObjectStore(STORE_FORECASTS)
      if (!db.objectStoreNames.contains(STORE_RECENT)) db.createObjectStore(STORE_RECENT)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveForecast(key, value) {
  const db = await openDB()
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE_FORECASTS, 'readwrite')
    tx.objectStore(STORE_FORECASTS).put({ ts: Date.now(), value }, key)
    tx.oncomplete = () => res(true)
    tx.onerror = () => rej(tx.error)
  })
}

export async function getForecast(key) {
  const db = await openDB()
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE_FORECASTS, 'readonly')
    const r = tx.objectStore(STORE_FORECASTS).get(key)
    r.onsuccess = () => res(r.result ? r.result.value : null)
    r.onerror = () => rej(r.error)
  })
}

export async function saveRecent(key, value) {
  const db = await openDB()
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE_RECENT, 'readwrite')
    tx.objectStore(STORE_RECENT).put({ ts: Date.now(), value }, key)
    tx.oncomplete = () => res(true)
    tx.onerror = () => rej(tx.error)
  })
}

export async function getAllRecents() {
  const db = await openDB()
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE_RECENT, 'readonly')
    const store = tx.objectStore(STORE_RECENT)
    const req = store.getAll()
    req.onsuccess = () => {
      const items = req.result || []
      // sort by ts desc
      items.sort((a, b) => b.ts - a.ts)
      res(items.map(i => i.value))
    }
    req.onerror = () => rej(req.error)
  })
}
*** End Patch