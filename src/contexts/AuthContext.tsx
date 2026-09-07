import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { getUserProfile, saveUserProfile } from '../lib/firestore'
import { withTimeout } from '../lib/utils'
import type { UserProfile } from '../types'

interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  profileError: string | null
  signInWithGoogle: () => Promise<void>
  signOutUser: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)

  async function loadProfile(u: User) {
    const existing = await withTimeout(getUserProfile(u.uid), 12000, 'Loading your profile')
    if (existing) {
      setProfile(existing)
      return
    }
    const fresh: UserProfile = {
      uid: u.uid,
      displayName: u.displayName,
      email: u.email,
      googlePhotoURL: u.photoURL,
      selfieURL: null,
      goal: null,
      frequency: null,
      onboardingComplete: false,
      createdAt: Date.now(),
      language: null,
      weightUnit: null,
      currentMonthKey: null,
      currentMonthScores: null,
    }
    await withTimeout(saveUserProfile(fresh), 12000, 'Creating your profile')
    setProfile(fresh)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      setProfileError(null)
      try {
        if (u) {
          await loadProfile(u)
        } else {
          setProfile(null)
        }
      } catch (err) {
        // Common causes: Firestore security rules not published yet, or the
        // Firestore database not created in the Firebase console. Surface it
        // instead of leaving the app stuck on a loading spinner.
        console.error('Failed to load/create user profile:', err)
        setProfileError(err instanceof Error ? err.message : 'Failed to load your profile.')
      } finally {
        setLoading(false)
      }
    })
    return unsubscribe
  }, [])

  async function signInWithGoogle() {
    await signInWithPopup(auth, googleProvider)
  }

  async function signOutUser() {
    await signOut(auth)
  }

  async function refreshProfile() {
    if (!user) return
    const fresh = await getUserProfile(user.uid)
    setProfile(fresh)
  }

  async function updateProfile(patch: Partial<UserProfile>) {
    if (!user || !profile) return
    const next = { ...profile, ...patch }
    await withTimeout(saveUserProfile(next), 15000, 'Saving your profile')
    setProfile(next)
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, profileError, signInWithGoogle, signOutUser, refreshProfile, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
