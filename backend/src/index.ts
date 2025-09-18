import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import { WebSocketServer } from 'ws'
import http from 'http'

import { authMiddleware } from './middleware/auth'
import { authRoutes } from './routes/auth'
import { cameraRoutes } from './routes/cameras'
import { alertRoutes } from './routes/alerts'
import { handleWebSocketConnection } from './utils/websocket'

const app = new Hono()

// 🔹 Global middlewares
app.use('*', logger())
app.use(
  '*',
  cors({
    origin: '*',   // ✅ Allow all origins
    credentials: true,
  })
)

// 🔹 Auth routes (no middleware needed)
app.route('/api/auth', authRoutes)

// 🔹 Protected routes (apply middleware first, then mount routes)
app.use('/api/cameras/*', authMiddleware)
app.route('/api/cameras', cameraRoutes)

app.use('/api/alerts/*', authMiddleware)
app.route('/api/alerts', alertRoutes)

// 🔹 Health check
app.get('/health', (c) =>
  c.json({ status: 'OK', timestamp: new Date().toISOString() })
)

// 🔹 Start HTTP + WebSocket servers
const port = parseInt(process.env.PORT || '3001', 10)

const server = serve({ fetch: app.fetch, port }, () => {
  console.log(`✅ HTTP server running on port ${port}`)
})

// WebSocket server hooked to same HTTP server
const wss = new WebSocketServer({ server: server as unknown as http.Server })
;(global as any).wss = wss

wss.on('connection', (ws) => {
  handleWebSocketConnection(ws)
})

console.log(`✅ WebSocket server is running on port ${port}`)

export default app
