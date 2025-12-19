import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    return {
        plugins: [
            react(),
            VitePWA({
                registerType: 'autoUpdate',
                includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-icon.svg'],
                manifest: {
                    name: 'SpendTribe',
                    short_name: 'SpendTribe',
                    description: 'Track and split rental house expenses easily.',
                    theme_color: '#0F1C36',
                    start_url: '/',
                    scope: '/',
                    icons: [
                        {
                            src: 'logo.svg',
                            sizes: '192x192',
                            type: 'image/svg+xml',
                            purpose: 'any maskable'
                        },
                        {
                            src: 'logo.svg',
                            sizes: '512x512',
                            type: 'image/svg+xml',
                            purpose: 'any maskable'
                        }
                    ]
                },
                devOptions: {
                    enabled: true
                }
            })
        ],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
        server: {
            port: 5173,
            proxy: {
                '/api': {
                    target: env.VITE_API_URL || 'http://localhost:5000/api',
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api/, '')
                }
            }
        }
    }
})
