// Import the functions you need from the Firebase SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Import the auth module

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAT9TXdYY5QDNBVDvgNbJYqfRVl-wHAULg",
  authDomain: "manchikoppa-portal.firebaseapp.com",
  projectId: "manchikoppa-portal",
  storageBucket: "manchikoppa-portal.firebasestorage.app",
  messagingSenderId: "804177072117",
  appId: "1:804177072117:web:d01be3ff78a7d13ef09abc",
  measurementId: "G-3RBQYD3GWG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and get a reference to the service
const db = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Export the db and auth instances so other components can use them
export { db, auth };