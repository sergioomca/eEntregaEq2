import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // AÑADIMOS LA SECCIÓN DE CONFIGURACIÓN DEL SERVIDOR
  server: {
    // 1. Configuración de Proxy
    proxy: {
      // Si la aplicación React intenta acceder a una URL que empiece con '/api'
      '/api': {
        // 2. Redirige esa petición al puerto 8080 (donde está Spring Boot)
        target: 'http://localhost:8080',
        // 3. Permite la redirección de hosts virtuales
        changeOrigin: true,
        // 4. Reescribe la URL si es necesario (no necesario aquí, pero buena práctica)
        // rewrite: (path) => path.replace(/^\/api/, ''), 
      },
    },
    // Opcional: Especifica el puerto (generalmente 5173)
    port: 5173,
    // Habilita fallback para SPA (Single Page Application)
    historyApiFallback: true
  }
})
