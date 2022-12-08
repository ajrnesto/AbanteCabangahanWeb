import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js';
import { ref, get } from 'https://www.gstatic.com/firebasejs/9.14.0/firebase-database.js';
import { auth, db } from '../js/firebase.js';
import { errLogin } from '../js/ui.js';

// on load, check if someone is signed in
window.addEventListener("load", () => {
    if (auth.currentUser != null) {
        window.location = "../requests.html";
    }
});

// listen for sign-ins
onAuthStateChanged(auth, user => {
    if (user) { // if someone logged in, check userType
        const refUserType = ref(db, "users/"+user.uid+"/userType");

        get(refUserType)
            .then((snapshot) => {
                const userType = snapshot.val();
                
                if (userType != 1) {
                    signOut(auth);
                    alert("Your account does not have administrator privileges!");
                    return;
                }
        
                // if user is admin, allow access and redirect
                window.location = "../requests.html";
            })
            .catch((err) => {
                console.error(err);
        });
    } 
});

// listen for the log in button
btnLogin.addEventListener("click", () => {
    const email = etEmail.value;
    const password = etPassword.value;

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // let onAuthStateChanged handle the authentication validation
    })
    .catch((error) => {
        // display error text
        errLogin.style.display = "block";
    });
});
