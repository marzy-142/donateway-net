
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGCdsHSjB3PrGo9pUkdPbgXV9-zMOeUI8",
  authDomain: "bloodlink-demo.firebaseapp.com",
  projectId: "bloodlink-demo",
  storageBucket: "bloodlink-demo.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:a1b2c3d4e5f6a7b8c9d0e1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;
