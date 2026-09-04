import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    /* One React, one ReactDOM. Kept from the phase-1 attempt: it is correct
       regardless, and it is the first thing to rule out if the KendoReact 16 /
       React 19 problem in docs/kendo-migration-scope.md §9 is revisited. */
    dedupe: ['react', 'react-dom'],
  },
})
