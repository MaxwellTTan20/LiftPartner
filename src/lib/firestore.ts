import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  addDoc,
  updateDoc,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from '../firebase'
import type { UserProfile, Workout } from '../types'

function userDoc(uid: string) {
  return doc(db, 'users', uid)
}

function workoutsCol(uid: string) {
  return collection(db, 'users', uid, 'workouts')
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(userDoc(uid))
  return snap.exists() ? (snap.data() as UserProfile) : null
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await setDoc(userDoc(profile.uid), profile, { merge: true })
}

/** Every user's profile doc - used to build the leaderboard. Firestore rules
 * allow any signed-in user to read the `users` collection, but each user's
 * `workouts` subcollection stays locked to its owner, so this never exposes
 * anyone's actual exercises/sets/comments - just the profile fields
 * (name, selfie, goal, frequency, currentMonthKey/currentMonthScores). */
export async function getAllUserProfiles(): Promise<UserProfile[]> {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs.map((d) => d.data() as UserProfile)
}

export async function uploadSelfie(uid: string, blob: Blob): Promise<string> {
  const path = ref(storage, `selfies/${uid}.jpg`)
  await uploadBytes(path, blob, { contentType: 'image/jpeg' })
  return getDownloadURL(path)
}

export async function addWorkout(uid: string, workout: Omit<Workout, 'id'>): Promise<string> {
  const docRef = await addDoc(workoutsCol(uid), workout)
  return docRef.id
}

export async function updateWorkout(uid: string, workoutId: string, data: Partial<Workout>): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'workouts', workoutId), data)
}

export async function getWorkouts(uid: string): Promise<Workout[]> {
  const q = query(workoutsCol(uid), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Workout, 'id'>) }))
}

export async function getWorkout(uid: string, workoutId: string): Promise<Workout | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'workouts', workoutId))
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as Omit<Workout, 'id'>) }) : null
}

export async function deleteWorkout(uid: string, workoutId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'workouts', workoutId))
}
