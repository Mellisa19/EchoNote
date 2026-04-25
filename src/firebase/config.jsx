import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
  onAuthStateChanged,
  getRedirectResult,
  sendPasswordResetEmail
} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCyyeUZB7QMkozvyJyf2SvV7KsqcSEHIcI",
  authDomain: "echonote-bd009.firebaseapp.com",
  databaseURL: "https://echonote-bd009-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "echonote-bd009",
  storageBucket: "echonote-bd009.firebasestorage.app",
  messagingSenderId: "172798279810",
  appId: "1:172798279810:web:70a1ead77d4e89ae59b49b",
  measurementId: "G-JFXT9Y8CSE"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

// Export individual auth functions
export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
  onAuthStateChanged,
  getRedirectResult,
  sendPasswordResetEmail
}
