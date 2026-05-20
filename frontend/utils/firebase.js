// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "authexamnotes-9bd56.firebaseapp.com",
  projectId: "authexamnotes-9bd56",
  storageBucket: "authexamnotes-9bd56.firebasestorage.app",
  messagingSenderId: "270166208515",
  appId: "1:270166208515:web:a1e2345af0f335e7615e36",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth, provider };
