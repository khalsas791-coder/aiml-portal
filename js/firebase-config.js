// js/firebase-config.js — Neural Data Core v4.0
// Centralized Firebase configuration for the GNDECB AIML Hub
// Using Firebase 9+ (Modular)

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB-MOCK-KEY-FOR-DEMO",
    authDomain: "aiml-portal-8862c.firebaseapp.com",
    projectId: "aiml-portal-8862c",
    storageBucket: "aiml-portal-8862c.appspot.com",
    messagingSenderId: "931284712",
    appId: "1:931284712:web:7f8a12b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log("🚀 Neural Data Core: Firebase v9 Initialized.");
