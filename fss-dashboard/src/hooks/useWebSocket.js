import { useEffect, useRef, useState, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client/dist/sockjs'

const WS_URL = import.meta.env.VITE_WS_URL || '/ws-fire-suppression'

export default function useWebSocket({ onSensorData, onAlertData, enabled = true }) {
  const [connected, setConnected] = useState(false)
  const clientRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)

  const connect = useCallback(() => {
    if (!enabled) return

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('[WS] Connected to STOMP')
        setConnected(true)

        client.subscribe('/topic/sensors', (message) => {
          try {
            const data = JSON.parse(message.body)
            onSensorData?.(data)
          } catch (e) {
            console.error('[WS] Failed to parse sensor data:', e)
          }
        })

        client.subscribe('/topic/alerts', (message) => {
          try {
            const data = JSON.parse(message.body)
            onAlertData?.(data)
          } catch (e) {
            console.error('[WS] Failed to parse alert data:', e)
          }
        })
      },
      onDisconnect: () => {
        console.log('[WS] Disconnected')
        setConnected(false)
      },
      onStompError: (frame) => {
        console.error('[WS] STOMP error:', frame.headers?.message)
        setConnected(false)
      },
    })

    client.activate()
    clientRef.current = client
  }, [enabled, onSensorData, onAlertData])

  useEffect(() => {
    connect()
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
      if (clientRef.current) {
        clientRef.current.deactivate()
        clientRef.current = null
      }
    }
  }, [connect])

  return { connected }
}
