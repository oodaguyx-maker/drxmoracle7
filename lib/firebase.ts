import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth, setPersistence, browserLocalPersistence } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyCQJPmrs2uqaapaGOWUpFtItBFYKEDmw_4",
  authDomain: "oodaengine-900ed.firebaseapp.com",
  projectId: "oodaengine-900ed",
  storageBucket: "oodaengine-900ed.firebasestorage.app",
  messagingSenderId: "291054343174",
  appId: "1:291054343174:web:384f2bae5f52f087419f87",
  measurementId: "G-923TN98XP3",
}

let app: FirebaseApp
let auth: Auth | null = null

try {
  if (typeof window !== "undefined") {
    // Check if Firebase SDK is available
    if (typeof window.firebase !== "undefined" || typeof (window as any).firebase !== "undefined") {
      app = getApps().length ? getApp() : initializeApp(firebaseConfig)
      auth = getAuth(app)

      setPersistence(auth, browserLocalPersistence).catch((error) => {
        console.error("[v0] Firebase persistence error:", error)
      })

      console.log("[v0] Firebase initialized successfully")
    } else {
      console.warn("[v0] Firebase SDK not loaded, authentication will not work")
    }
  } else {
    console.log("[v0] Skipping Firebase initialization on server")
  }
} catch (error) {
  console.error("[v0] Firebase initialization error:", error)
  console.log("[v0] Continuing without Firebase authentication")
}

export { auth, app }
export default app
