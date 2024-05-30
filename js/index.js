import { onAuthStateChanged, signInWithEmailAndPassword, signOut, setPersistence, browserSessionPersistence } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js';
import { auth, db } from '../js/firebase.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';
import { authenticate, validate, invalidate } from '../js/utils.js';

const errLogin = document.querySelector('#errLogin');
const errNotAdmin = document.querySelector('#errNotAdmin');
const btnLogin = document.querySelector('#btnLogin');

const etLoginEmail = document.querySelector('#etLoginEmail');
const etLoginPassword = document.querySelector('#etLoginPassword');

const emailValidator = document.querySelectorAll('.email-validator');
const passwordValidator = document.querySelectorAll('.password-validator');

onAuthStateChanged(auth, user => {
	if (!user) {
		return;
	}

	const userTypeRef = doc(db, "users", user.uid);
	getDoc(userTypeRef).then(userSnap => {
		const userType = userSnap.data().userType;
		if (userType == 0) {
			errNotAdmin.style.display = "block";
			invalidate(emailValidator);
			invalidate(passwordValidator);
			signOut(auth)
			return;
		}
		else if (userType == 1) {
			window.location = "../clearance.html";

			errNotAdmin.style.display = "none";
			validate(emailValidator);
			validate(passwordValidator);
		}
		else if (userType == 2 || userType == 3) {
			window.location = "../appointments.html";
		}
	});
});

btnLogin.addEventListener("click", () => {
    const email = etLoginEmail.value;
    const password = etLoginPassword.value;

	
	setPersistence(auth, browserSessionPersistence).then(() => {
		return signInWithEmailAndPassword(auth, email, password)
		.then((userCredential) => {
		  errLogin.style.display = "none";
		  // let onAuthStateChanged handle the authentication validation
		})
		.catch((error) => {
		  // display error text
			invalidate(emailValidator);
			invalidate(passwordValidator);
		  errLogin.style.display = "block";
		});
	})
	.catch((error) => {
		const errorCode = error.code;
		const errorMessage = error.message;
	});
});