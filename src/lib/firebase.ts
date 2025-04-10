
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAF-fjHh9B88OHoHjbCyMgc5ktLaW9EwNA",
  authDomain: "bloodlink-13d2b.firebaseapp.com",
  projectId: "bloodlink-13d2b",
  storageBucket: "bloodlink-13d2b.firebasestorage.app",
  messagingSenderId: "651543224130",
  appId: "1:651543224130:web:8fed1ab0672afe9c5032db"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;
