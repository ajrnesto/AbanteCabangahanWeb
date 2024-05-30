// imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-storage.js';

export const app = initializeApp({
  apiKey: "AIzaSyAOHtuSqRO7XaR6f5dBDOa7x74_VuRxMoA",
  authDomain: "barangay360.firebaseapp.com",
  projectId: "barangay360",
  storageBucket: "barangay360.appspot.com",
  messagingSenderId: "134797484323",
  appId: "1:134797484323:web:b77da1c79e3bd76b196c96",
  measurementId: "G-PZLGW858X7"
});

export const auth = getAuth(app);
export const db = getFirestore();
export const storage = getStorage(app);