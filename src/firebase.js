// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your Firebase project configuration
// Get this from Firebase Console -> Project Settings -> Your apps -> Web app
const firebaseConfig = {
  apiKey: "AIzaSyBroF8Z0DwztBxS-g6CjYqaAxWWRBRMny4",
  authDomain: "ecard-generator-fac4f.firebaseapp.com",
  projectId: "ecard-generator-fac4f",
  storageBucket: "ecard-generator-fac4f.firebasestorage.app",
  messagingSenderId: "691622498173",
  appId: "1:691622498173:web:71ab163395fb667612c614",
  measurementId: "G-LE5D8Q57XL"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
