// js/firebase-config.js
// TODO: Replace the config values below with your actual Firebase project settings.
// These can be found in your Firebase Console -> Project Settings.

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDOZmL0zauFHCjd0e0gwvk2eU2C8AXKrGE",
  authDomain: "aiml-portal-8862c.firebaseapp.com",
  projectId: "aiml-portal-8862c",
  storageBucket: "aiml-portal-8862c.firebasestorage.app",
  messagingSenderId: "449549829218",
  appId: "1:449549829218:web:20c43fcf7a3fc942adbd3b",
  measurementId: "G-TD65XLVQPX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
