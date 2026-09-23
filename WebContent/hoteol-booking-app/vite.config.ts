import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // /api로 시작하는 요청을 스프링 부트(localhost:8080)로 전달
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // npm run build 시 스프링의 static 리소스 폴더로 바로 산출물 생성
    outDir: path.resolve(__dirname, '../../src/main/resources/static'),
    emptyOutDir: true,
  },
});