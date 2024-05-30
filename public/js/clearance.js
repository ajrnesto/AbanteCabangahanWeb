import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js';
import { doc, collection, collectionGroup, addDoc, setDoc, getDoc, getDocs, deleteDoc, updateDoc, increment, query, where, orderBy, startAt, endAt, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';
import { db, auth, storage } from '../js/firebase.js';
import { ref as sRef, uploadBytes, getDownloadURL, deleteObject, getMetadata } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-storage.js";
import { btnLogout, tbodyRequests, tabTitle, navClearance, navId, navResidency, navIndigency, navBusinessPermit, etEmail } from '../js/ui.js';
import  * as utils from '../js/utils.js';
//import { jsPDF } from "../node_modules/jspdf/dist/jspdf.node.js";

const etUid = document.querySelector("#etUid");
const btnFilterByUid = document.querySelector("#btnFilterByUid");
const etFirstName = document.querySelector("#etFirstName");
const etLastName = document.querySelector("#etLastName");
const btnFilterByName = document.querySelector("#btnFilterByName");
const tvUserName = document.querySelector("#tvUserName");
const imgId = document.querySelector("#imgId");
const imgCedula = document.querySelector("#imgCedula");

btnFilterByName.addEventListener("click", () => {
	etUid.value = "";
	getRequestsData();
});

btnFilterByUid.addEventListener("click", () => {
	etFirstName.value = "";
	etLastName.value = "";
	getRequestsData();
});

window.addEventListener("load", function() {
	etUid.value = new URL(window.location.href).searchParams.get("id");
	getRequestsData();
});

// listen for log out button
btnLogout.addEventListener("click", logOut);

// on load, check if user is not logged in
onAuthStateChanged(auth, user => {
  if (!user) {
		logOut();
		return;
  }

	getRequestsData();
});

function logOut() {
	signOut(auth).then(() => {
		window.location = "../index.html";
	}).catch((error) => {});
}

function getRequestsData() {
	const refRequest = collection(db, "requests");
	let qryRequest = null;
	
	const uid = etUid.value;
	const firstName = etFirstName.value.toUpperCase();
	const lastName = etLastName.value.toUpperCase();

	if (firstName && lastName) {
		qryRequest = query(refRequest, where("firstName", "==", firstName), where("lastName", "==", lastName), where("documentType", "==", "CLEARANCE"), orderBy("timestamp", "desc"));
	}
	else if (firstName && !lastName) {
		qryRequest = query(refRequest, where("firstName", "==", firstName), where("documentType", "==", "CLEARANCE"), orderBy("timestamp", "desc")) ;
	}
	else if (!firstName && lastName) {
		qryRequest = query(refRequest, where("lastName", "==", lastName), where("documentType", "==", "CLEARANCE"), orderBy("timestamp", "desc")) ;
	}
	else if (uid) {
		qryRequest = query(refRequest, where("userUid", "==", uid), where("documentType", "==", "CLEARANCE"), orderBy("timestamp", "desc")) ;
	}
	else if (!firstName && !lastName && !uid) {
		qryRequest = query(refRequest, where("documentType", "==", "CLEARANCE"), orderBy("timestamp", "desc")) ;
	}

	onSnapshot(qryRequest, (snapRequests) => {
		// clear table
		tbodyRequests.innerHTML = '';

		snapRequests.forEach(request => {
      renderTable(
				request.id,
				request.data().documentType,
				request.data().userUid,
				request.data().firstName,
				request.data().middleName,
				request.data().lastName,
				request.data().birthdate,
				request.data().addressPurok,
				request.data().civilStatus,
				request.data().residencyStatus,
				request.data().purpose,
				request.data().isNonResident,
				request.data().status,
				request.data().timestamp
			);
    });
	});
}

function renderTable(id, documentType, userUid, firstName, middleName, lastName, birthdate, addressPurok, civilStatus, residencyStatus, purpose, isNonResident, status, timestamp) {
	const ageMillis = Date.now() - birthdate;
	const age = parseInt(ageMillis/31536000000);

  const rowClearance = document.createElement('tr');
  const cellName = document.createElement('td');
  const cellMobile = document.createElement('td');
  const cellAge = document.createElement('td');
  const cellAddress = document.createElement('td');
  const cellResidency = document.createElement('td');
  const cellPurpose = document.createElement('td');
  const buttonViewDocuments = document.createElement('button');
  const cellDate = document.createElement('td');
  const cellStatus = document.createElement('td');
  const cellAction = document.createElement('td');
  	const buttonAction = document.createElement('button');
  
  getDoc(doc(db, "users", userUid)).then(user => {
	cellMobile.innerHTML = user.data().mobile;
  });
  cellName.innerHTML = utils.titleCase(utils.parseFullName(firstName, middleName, lastName));
  cellAge.innerHTML = parseInt(age/31536000000);
  cellAddress.innerHTML = utils.titleCase(addressPurok) + ", Cabangahan, Siaton";
  cellPurpose.innerHTML = purpose?utils.titleCase(purpose):"";
  cellResidency.innerHTML = utils.titleCase(residencyStatus);
	cellDate.innerHTML = utils.parseDate(timestamp);
  cellStatus.innerHTML = utils.titleCase(status);

  buttonViewDocuments.type = 'button';
  buttonViewDocuments.textContent = "View";
	buttonViewDocuments.className = "btn btn-no-border btn-primary text-white col-auto px-2 d-none";

	if (isNonResident) {
		getDownloadURL(sRef(storage, 'id/'+id)).then((idUrl)=> {
			getDownloadURL(sRef(storage, 'cedula/'+id)).then((cedulaUrl)=> {
				buttonViewDocuments.classList.toggle("d-none", false);
			buttonViewDocuments.onclick = function() {
				viewDocuments(idUrl, cedulaUrl, firstName, middleName, lastName);
			}
			})
			.catch((error) => { });
		})
		.catch((error) => {
			console.log(error);
		});
	}
  buttonViewDocuments.onclick = function() { btnAction(id, status) };

  buttonAction.type = 'button';
  buttonAction.textContent = utils.parseActionText(status);
	buttonAction.className = "btn btn-no-border btn-success text-white col-auto px-2 me-2";
    // if (status == "COMPLETED") {
    //     //buttonAction.classList.toggle('col-12', true);
    //     buttonAction.classList.toggle('d-none', true);
    // }
	if (status == "PENDING") {
		buttonAction.onclick = function() { btnAction(id, status) }
	}
	else if (status == "COMPLETED") {
		buttonAction.onclick = function() { reqPrint(firstName, middleName, lastName, age, civilStatus, addressPurok, residencyStatus, purpose, timestamp) }
	}

  // buttonPrint.textContent = "Print";
	// buttonPrint.className = "btn btn-no-border btn-primary col-auto px-2 d-none";
	// buttonPrint.onclick = function() { reqPrint(firstName, middleName, lastName, age, civilStatus, addressPurok, residencyStatus, timestamp) }
	// if (status > 0) {
	// 	buttonPrint.classList.toggle('d-none', false);
	// }

    // rowClearance.appendChild(cellUid);
    rowClearance.appendChild(cellName);
    rowClearance.appendChild(cellMobile);
    rowClearance.appendChild(cellAge);
    rowClearance.appendChild(cellAddress);
    rowClearance.appendChild(cellResidency);
    rowClearance.appendChild(cellPurpose);
    rowClearance.appendChild(cellDate);
    rowClearance.appendChild(cellStatus);
    rowClearance.appendChild(cellAction);
    	cellAction.appendChild(buttonAction);
    	//cellAction.appendChild(buttonPrint);

    tbodyRequests.appendChild(rowClearance);
}

function viewDocuments(idUrl, cedulaUrl, firstName, middleName, lastName) {
	tvUserName.innerHTML = utils.titleCase(utils.parseFullName(firstName, middleName, lastName));
	imgId.src = idUrl;
	imgCedula.src = cedulaUrl;

	utils.showModal('#modalViewDocuments');
}

function btnAction(requestUid, requestStatus) {
	const refRequest = doc(db, "requests", requestUid);

	let updateData = {};

	if (requestStatus == "PENDING") {
		updateData = { status: "COMPLETED" }
	}

	updateDoc(refRequest, updateData).then(() => {});
}

function reqPrint(firstName, middleName, lastName, age, civilStatus, addressPurok, residencyStatus, purpose, timestamp) {
	localStorage.setItem("service", "clearance");
	localStorage.setItem("firstName", firstName);
	localStorage.setItem("middleName", middleName);
	localStorage.setItem("lastName", lastName);
	localStorage.setItem("age", age);
	localStorage.setItem("civilStatus", civilStatus);
	localStorage.setItem("purok", addressPurok);
	localStorage.setItem("residency", residencyStatus);
	localStorage.setItem("purpose", purpose);
	localStorage.setItem("timestamp", timestamp);
	window.open("../print-document.html");
}