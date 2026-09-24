import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({plugins:[react()], server:{proxy:{'/api':{target: process.env.SPRING_API_TARGET || 'http://localhost:8082',changeOrigin:true}}}});
