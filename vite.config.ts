import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Only variables starting with VITE_PUBLIC_ are exposed to client code.
// This makes "public" explicit and prevents accidentally shipping secrets
// that happen to use the default VITE_ prefix.
export default defineConfig({
  plugins: [react()],
  envPrefix: 'VITE_PUBLIC_',
  server: { port: 5173 },
  build: { sourcemap: false },
});
