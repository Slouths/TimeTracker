import { useState, useEffect, useCallback, useRef } from 'react'

interface UseIdleDetectionOptions {
  idleThreshold?: number // in milliseconds
  enabled?: boolean
}

interface UseIdleDetectionReturn {
  isIdle: boolean
  idleTime: number // in seconds
  resetIdle: () => void
}

export function useIdleDetection({
  idleThreshold = 300000, // 5 minutes default
  enabled = true,
}: UseIdleDetectionOptions = {}): UseIdleDetectionReturn {
  const [isIdle, setIsIdle] = useState(false)
  const [idleTime, setIdleTime] = useState(0)
  const lastActivityRef = useRef<number>(Date.now())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const resetIdle = useCallback(() => {
    lastActivityRef.current = Date.now()
    setIsIdle(false)
    setIdleTime(0)
  }, [])

  useEffect(() => {
    if (!enabled) {
      setIsIdle(false)
      setIdleTime(0)
      return
    }

    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart']

    const handleActivity = () => {
      resetIdle()
    }

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity)
    })

    // Check idle status every second
    intervalRef.current = setInterval(() => {
      const now = Date.now()
      const timeSinceActivity = now - lastActivityRef.current
      const idleSeconds = Math.floor(timeSinceActivity / 1000)

      setIdleTime(idleSeconds)

      if (timeSinceActivity >= idleThreshold && !isIdle) {
        setIsIdle(true)
      }
    }, 1000)

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, idleThreshold, isIdle, resetIdle])

  return {
    isIdle,
    idleTime,
    resetIdle,
  }
}
