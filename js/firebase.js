// imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/9.14.0/firebase-database.js';

export const app = initializeApp({
	apiKey: "AIzaSyAsSXjzZ0KymkoQHS2gDKpXIGwVSdnFoYo",
	authDomain: "abante-bonawon.firebaseapp.com",
	databaseURL: "https://abante-bonawon-default-rtdb.asia-southeast1.firebasedatabase.app",
	projectId: "abante-bonawon",
	storageBucket: "abante-bonawon.appspot.com",
	messagingSenderId: "628961225447",
	appId: "1:628961225447:web:34b731494a53443f6c1042",
	measurementId: "G-L9RYJQKTMD"
});

export const auth = getAuth(app);
export const db = getDatabase();