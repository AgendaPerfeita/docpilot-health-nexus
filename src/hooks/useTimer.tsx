
import { useState, useEffect, useRef } from 'react'

interface TimerStats {
  totalTime: number
  averageTime: number
  productivity: 'alta' | 'média' | 'baixa'
}

export function useTimer() {
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, isPaused])

  const start = () => {
    setIsRunning(true)
    setIsPaused(false)
    setStartTime(new Date())
  }

  const pause = () => {
    setIsPaused(true)
  }

  const resume = () => {
    setIsPaused(false)
  }

  const stop = () => {
    setIsRunning(false)
    setIsPaused(false)
    setSeconds(0)
    setStartTime(null)
  }



  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProductivityLevel = (): 'alta' | 'média' | 'baixa' => {
    if (seconds < 600) return 'alta' // menos de 10 min
    if (seconds < 1800) return 'média' // menos de 30 min
    return 'baixa' // mais de 30 min
  }

  const getEstimatedCompletion = () => {
    // Baseado em média de 15-20 minutos por consulta
    const averageTime = 1200 // 20 minutos
    const remaining = Math.max(0, averageTime - seconds)
    return formatTime(remaining)
  }

  return {
    seconds,
    isRunning,
    isPaused,
    startTime,
    formattedTime: formatTime(seconds),
    productivity: getProductivityLevel(),
    estimatedCompletion: getEstimatedCompletion(),
    start,
    pause,
    resume,
    stop
  }
}
