const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'wss://api.driveast.com/api/v1'

class WebSocketService {
  constructor() {
    this.driverWs = null
    this.fleetWs = null
    this.whatsappWs = null
    this.pingTimer = null
    this.listeners = new Map()
    this.driverReconnectTimer = null
    this.driverToken = null
    this.driverWsClosedIntentionally = false
  }

  // Subscribe to WebSocket event types
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    this.listeners.get(eventType).add(callback)

    return () => {
      this.listeners.get(eventType)?.delete(callback)
    }
  }

  emit(eventType, payload) {
    const callbacks = this.listeners.get(eventType)
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(payload)
        } catch (err) {
          console.error(`Error in WebSocket listener for ${eventType}:`, err)
        }
      })
    }
  }

  /**
   * Protocol 1: Driver PWA WebSocket
   * Connection URL: wss://api.driveast.com/api/v1/driver/ws?token=<DRIVER_JWT_TOKEN>
   */
  connectDriverWs(token) {
    if (this.driverReconnectTimer) {
      clearTimeout(this.driverReconnectTimer)
      this.driverReconnectTimer = null
    }
    this.driverToken = token
    this.driverWsClosedIntentionally = false

    if (this.driverWs) {
      this.driverWs.close()
    }

    const wsUrl = `${WS_BASE_URL}/driver/ws${token ? `?token=${encodeURIComponent(token)}` : ''}`

    try {
      this.driverWs = new WebSocket(wsUrl)

      this.driverWs.onopen = () => {
        console.log('Driver WebSocket Connected')
        // Start Ping/Pong keep-alive every 30 seconds
        this.startPingPong()
      }

      this.driverWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'pong') return

          if (data.type) {
            this.emit(data.type, data)
          }
        } catch (err) {
          console.error('Failed to parse Driver WebSocket message:', err)
        }
      }

      this.driverWs.onerror = (err) => {
        console.warn('Driver WebSocket connection error:', err)
      }

      this.driverWs.onclose = () => {
        console.log('Driver WebSocket connection closed')
        this.stopPingPong()
        // Auto-reconnect unless this was an intentional disconnect (e.g. logout).
        // Ride requests only arrive over this connection with a 60s response window --
        // without reconnecting, a dropped connection (network switch, phone sleep) would
        // silently leave the driver deaf to new requests until they reopen the app.
        if (!this.driverWsClosedIntentionally && this.driverToken) {
          this.driverReconnectTimer = setTimeout(() => {
            this.connectDriverWs(this.driverToken)
          }, 3000)
        }
      }
    } catch (err) {
      console.warn('Could not establish Driver WebSocket connection:', err)
    }
  }

  disconnectDriverWs() {
    this.driverWsClosedIntentionally = true
    this.driverToken = null
    if (this.driverReconnectTimer) {
      clearTimeout(this.driverReconnectTimer)
      this.driverReconnectTimer = null
    }
    if (this.driverWs) {
      this.driverWs.close()
      this.driverWs = null
    }
    this.stopPingPong()
  }

  startPingPong() {
    this.stopPingPong()
    this.pingTimer = setInterval(() => {
      if (this.driverWs && this.driverWs.readyState === WebSocket.OPEN) {
        this.driverWs.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000)
  }

  stopPingPong() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
  }

  /**
   * Protocol 2: Admin Live Fleet GPS WebSocket
   */
  connectFleetWs() {
    if (this.fleetWs) this.fleetWs.close()
    try {
      this.fleetWs = new WebSocket(`${WS_BASE_URL}/ws/fleet`)
      this.fleetWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type) this.emit(data.type, data)
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Fleet WS Error:', err)
    }
  }

  /**
   * Protocol 3: Admin WhatsApp Live Chat WebSocket
   */
  connectWhatsAppWs() {
    if (this.whatsappWs) this.whatsappWs.close()
    try {
      this.whatsappWs = new WebSocket(`${WS_BASE_URL}/whatsapp/ws`)
      this.whatsappWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type) this.emit(data.type, data)
        } catch (e) {}
      }
    } catch (err) {
      console.warn('WhatsApp WS Error:', err)
    }
  }

  disconnectAll() {
    this.disconnectDriverWs()
    if (this.fleetWs) this.fleetWs.close()
    if (this.whatsappWs) this.whatsappWs.close()
  }
}

export const websocketService = new WebSocketService()
export default websocketService
