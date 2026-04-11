import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()]
})

// If you run a backend (e.g. Flask on localhost:5000),
// Vite dev server can proxy `/api` to the backend. Uncomment and edit if needed.
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       '/api': 'http://localhost:5000'
//     }
//   }
// })
