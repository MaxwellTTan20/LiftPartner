import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getWorkouts } from '../lib/firestore'
import type { Workout } from '../types'

export function useWorkouts() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setWorkouts([])
      setLoading(false)
      return
    }
    setLoading(true)
    const data = await getWorkouts(user.uid)
    setWorkouts(data)
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { workouts, loading, refresh }
}
