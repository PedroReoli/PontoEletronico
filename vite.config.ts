import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), // Plugin para suporte ao React
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Atalho para o diretório src
    },
  },
  server: {
    port: 3000, // Porta do servidor de desenvolvimento
    open: true, // Abre o navegador automaticamente
    headers: {
      "Content-Security-Policy": `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval';
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: blob:;
        font-src 'self' data:;
        connect-src 'self' ws: wss:;
        frame-src 'self';
        object-src 'none';
        base-uri 'self';
      `
        .replace(/\s{2,}/g, " ") // Remove espaços extras
        .trim(), // Remove espaços no início e no final
    },
  },
  build: {
    outDir: "dist", // Diretório de saída para build
    sourcemap: true, // Gera mapas de origem para depuração
    rollupOptions: {
      output: {
        manualChunks: {
          // Divisão de chunks para otimização
          vendor: ["react", "react-dom"],
        },
      },
    },
  },
  publicDir: "public", // Diretório para arquivos estáticos (como favicon)
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`, // Importa variáveis SCSS globais
      },
    },
  },
})