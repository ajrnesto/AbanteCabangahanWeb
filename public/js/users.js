import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js';
import { doc, collection, collectionGroup, addDoc, setDoc, getDoc, getDocs, deleteDoc, updateDoc, increment, query, where, orderBy, startAt, endAt, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';
import { db, auth } from '../js/firebase.js';
import { btnLogout } from '../js/ui.js';
import  * as utils from '../js/utils.js';
//import { jsPDF } from "../node_modules/jspdf/dist/jspdf.node.js";

const tvUserName = document.querySelector("#tvUserName");
const tbodyUsers = document.querySelector("#tbodyUsers");

const etUid = document.querySelector("#etUid");
const btnFilterByUid = document.querySelector("#btnFilterByUid");
const etFirstName = document.querySelector("#etFirstName");
const etLastName = document.querySelector("#etLastName");
const btnFilterByName = document.querySelector("#btnFilterByName");

const btnViewClearanceHistory = document.querySelector("#btnViewClearanceHistory");
const btnViewResidencyHistory = document.querySelector("#btnViewResidencyHistory");
const btnViewIndigencyHistory = document.querySelector("#btnViewIndigencyHistory");
const btnViewBusinessHistory = document.querySelector("#btnViewBusinessHistory");
const btnViewCrimeReportsHistory = document.querySelector("#btnViewCrimeReportsHistory");
const btnViewIncidentReportsHistory = document.querySelector("#btnViewIncidentReportsHistory");

btnFilterByName.addEventListener("click", () => {
	etUid.value = "";
	getUsersData();
});

btnFilterByUid.addEventListener("click", () => {
	etFirstName.value = "";
	etLastName.value = "";
	getUsersData();
});

// listen for log out button
btnLogout.addEventListener("click", logOut);

// on load, check if user is not logged in
onAuthStateChanged(auth, user => {
  if (!user) {
		logOut();
		return;
  }

	getUsersData();
});

function logOut() {
	signOut(auth).then(() => {
		window.location = "../index.html";
	}).catch((error) => {});
}

function getUsersData() {
	const refUsers = collection(db, "users");
	let qryUser = null;
	
	const uid = etUid.value;
	const firstName = etFirstName.value.toUpperCase();
	const lastName = etLastName.value.toUpperCase();

	if (firstName && lastName) {
		qryUser = query(refUsers, where("firstName", "==", firstName), where("lastName", "==", lastName));
	}
	else if (firstName && !lastName) {
		qryUser = query(refUsers, where("firstName", "==", firstName)) ;
	}
	else if (!firstName && lastName) {
		qryUser = query(refUsers, where("lastName", "==", lastName)) ;
	}
	else if (uid) {
		qryUser = query(refUsers, where("userUid", "==", uid)) ;
	}
	else if (!firstName && !lastName && !uid) {
		qryUser = query(refUsers) ;
	}

	onSnapshot(qryUser, (snapUser) => {
		// clear table
		tbodyUsers.innerHTML = '';

		snapUser.forEach(user => {
			if (user.data().email != "barangay360.admin@gmail.com") {
				renderTable(
					user.id,
					user.data().firstName,
					user.data().middleName,
					user.data().lastName,
					user.data().mobile,
					user.data().email,
					user.data().birthdate
				);
			}
    });
	});
}

function renderTable(id, firstName, middleName, lastName, mobile, email, birthdate) {
	const age = Date.now() - birthdate;

  const rowClearance = document.createElement('tr');
  const cellUid = document.createElement('td');
  const cellName = document.createElement('td');
  const cellMobile = document.createElement('td');
  const cellEmail = document.createElement('td');
  const cellBirthDate = document.createElement('td');
  const cellAction = document.createElement('td');
  const buttonAction = document.createElement('button');

  cellUid.innerHTML = id;
  cellName.innerHTML = utils.titleCase(utils.parseFullName(firstName, middleName, lastName));
  cellMobile.innerHTML = mobile;
  cellEmail.innerHTML = email;
  cellBirthDate.innerHTML = utils.parseDate(birthdate);

  buttonAction.type = 'button';
  buttonAction.textContent = "View User Activity"
	buttonAction.className = "btn btn-no-border btn-success text-white col-auto px-2 me-2";
    buttonAction.onclick = function() { 
			viewUserActivity(id, firstName, lastName);
		};

    rowClearance.appendChild(cellUid);
    rowClearance.appendChild(cellName);
    rowClearance.appendChild(cellMobile);
    rowClearance.appendChild(cellEmail);
    rowClearance.appendChild(cellBirthDate);
    rowClearance.appendChild(cellAction);
    	cellAction.appendChild(buttonAction);

    tbodyUsers.appendChild(rowClearance);
}

function viewUserActivity(userId, firstName, lastName) {
	tvUserName.innerHTML = firstName + " " + lastName;
	utils.showModal("#modalViewUserActivity");

	btnViewClearanceHistory.onclick = function() {
		window.location = "./clearance.html?id="+userId;
	}

	btnViewResidencyHistory.onclick = function() {
		window.location = "./residency.html?id="+userId;
	}

	btnViewIndigencyHistory.onclick = function() {
		window.location = "./indigency.html?id="+userId;
	}

	btnViewBusinessHistory.onclick = function() {
		window.location = "./business.html?id="+userId;
	}

	btnViewCrimeReportsHistory.onclick = function() {
		window.location = "./crimes.html?id="+userId;
	}

	btnViewIncidentReportsHistory.onclick = function() {
		window.location = "./incidents.html?id="+userId;
	}
}