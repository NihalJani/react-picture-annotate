import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ReactPictureAnnotate',
      formats: ['es', 'umd'],
      fileName: (format) => `react-picture-annotate.${format}.js`,
    },
    rollupOptions: { 
      external: ['react', 'react-dom', 'react/jsx-runtime', '@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
      output: {
        exports: 'named',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'React',
          '@mui/material': 'MaterialUI',
          '@emotion/react': 'emotionReact',
          '@emotion/styled': 'emotionStyled'
        },
      },
    },
  },
});