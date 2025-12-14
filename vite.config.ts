import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'DateRangePicker',
      fileName: (format) => `daterangepicker-lite.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'date-fns', 'clsx'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'date-fns': 'dateFns',
          clsx: 'clsx'
        }
      }
    }
  }
});
