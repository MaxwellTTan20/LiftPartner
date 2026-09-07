import { initializeApp } from 'firebase/app'
import { isSupported, getAnalytics, type Analytics } from 'firebase/analytics'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Same config as provided for the liftpartner-776e5 Firebase project. Web
// API keys are not secret - they only identify the project to Firebase,
// access is enforced by Firestore/Storage security rules.
const firebaseConfig = {
  apiKey: 'AIzaSyBvbD6h_UafR_3ykPlhvzgDEjWWEf7sMGU',
  authDomain: 'liftpartner-776e5.firebaseapp.com',
  projectId: 'liftpartner-776e5',
  storageBucket: 'liftpartner-776e5.firebasestorage.app',
  messagingSenderId: '179809976201',
  appId: '1:179809976201:web:b459eddf9dc7ab75552b58',
  measurementId: 'G-BQBYY3EMH8',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const googleProvider = new GoogleAuthProvider()

export let analytics: Analytics | null = null
isSupported()
  .then((supported) => {
    if (supported) analytics = getAnalytics(app)
  })
  .catch(() => {
    // analytics isn't available (e.g. blocked, unsupported browser) - safe to ignore
  })
