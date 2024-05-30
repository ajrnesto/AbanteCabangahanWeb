import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js';
import { doc, collection, collectionGroup, addDoc, setDoc, getDoc, getDocs, deleteDoc, updateDoc, increment, query, where, orderBy, startAt, endAt, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';
import { ref as sRef, uploadBytes, getDownloadURL, deleteObject, getMetadata } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-storage.js";
import { db, auth, storage } from '../js/firebase.js';
import { btnLogout, tabTitle, navClearance, navId, navResidency, navIndigency, navBusinessPermit } from '../js/ui.js';
import  * as utils from '../js/utils.js';
//import { jsPDF } from "../node_modules/jspdf/dist/jspdf.node.js";

const tbodyIncident = document.querySelector("#tbodyIncident");
const divInvolvedPersonsContainer = document.querySelector("#divInvolvedPersonsContainer");
const divSupportingDocumentsContainer = document.querySelector("#divSupportingDocumentsContainer");
const etDatePicker = document.querySelector("#etDatePicker");
const btnSetSchedule = document.querySelector("#btnSetSchedule");

const etUid = document.querySelector("#etUid");
const btnFilterByUid = document.querySelector("#btnFilterByUid");
const etFirstName = document.querySelector("#etFirstName");
const etLastName = document.querySelector("#etLastName");
const btnFilterByName = document.querySelector("#btnFilterByName");

btnFilterByName.addEventListener("click", () => {
	etUid.value = "";
	getIncidentReportsData();
});

btnFilterByUid.addEventListener("click", () => {
	etFirstName.value = "";
	etLastName.value = "";
	getIncidentReportsData();
});

window.addEventListener("load", function() {
	etUid.value = new URL(window.location.href).searchParams.get("id");
	getIncidentReportsData();
});

// listen for log out button
btnLogout.addEventListener("click", logOut);

// on load, check if user is not logged in
onAuthStateChanged(auth, user => {
    if (!user) {
			logOut();
			return;
    }

	getIncidentReportsData();
});

function logOut() {
	signOut(auth).then(() => {
		window.location = "../index.html";
	}).catch((error) => {});
}

function getIncidentReportsData() {
	const refIncident = collection(db, "incidents");
	let qryIncident = null;
	
	const uid = etUid.value;
	const firstName = etFirstName.value.toUpperCase();
	const lastName = etLastName.value.toUpperCase();


	if (firstName || lastName) {
		qryIncident = query(refIncident, where("involvedPersonsSearchKeys", "array-contains-any", [firstName, lastName]), orderBy("timestamp", "desc"));
	}
	else {
		qryIncident = query(refIncident, orderBy("timestamp", "desc"));
	}
	// if (firstName && lastName) {
	// 	qryIncident = query(refIncident, where("firstName", "==", firstName), where("lastName", "==", lastName), orderBy("timestamp", "desc"));
	// }
	// else if (firstName && !lastName) {
	// 	qryIncident = query(refIncident, where("firstName", "==", firstName), orderBy("timestamp", "desc"));
	// }
	// else if (!firstName && lastName) {
	// 	qryIncident = query(refIncident, where("lastName", "==", lastName), orderBy("timestamp", "desc"));
	// }
	// else if (uid) {
	// 	qryIncident = query(refIncident, where("userUid", "==", uid), orderBy("timestamp", "desc"));
	// }
	// else if (!firstName && !lastName && !uid) {
	// 	qryIncident = query(refIncident, orderBy("timestamp", "desc"));
	// }

	onSnapshot(qryIncident, (snapIncidentReports) => {
		// clear table
		tbodyIncident.innerHTML = '';

		snapIncidentReports.forEach(IncidentReport => {
      renderTable(
				IncidentReport.id,
				IncidentReport.data().userUid,
				IncidentReport.data().incidentDate,
				IncidentReport.data().incidentDetails,
				IncidentReport.data().locationPurok,
				IncidentReport.data().incidentType,
				IncidentReport.data().involvedPersons,
				IncidentReport.data().mediaFileNames,
				IncidentReport.data().status,
				IncidentReport.data().timestamp
			);
    });
	});
}

function renderTable(id, userUid, incidentDate, incidentDetails, locationPurok, incidentType, involvedPersons, mediaFileNames, status, timestamp) {
	const rowIncident = document.createElement('tr');
  const cellIncidentDate = document.createElement('td');
  const cellIncidentType = document.createElement('td');
  const cellIncidentDetails = document.createElement('td');
  const cellIncidentLocation = document.createElement('td');
  const cellInvolvedPersons = document.createElement('td');
  	const buttonViewInvolvedPersons = document.createElement('button');
  const cellSupportingDocuments = document.createElement('td');
  	const buttonViewSupportingDocuments = document.createElement('button');
  const cellStatus = document.createElement('td');
  const cellAction = document.createElement('td');
  	const buttonAction = document.createElement('button');
  //const buttonPrint = document.createElement('button');

	cellIncidentDate.innerHTML = utils.parseDate(incidentDate);
	cellIncidentType.innerHTML = utils.titleCase(incidentType);
	cellIncidentDetails.innerHTML = incidentDetails;
  cellIncidentLocation.innerHTML = utils.titleCase(locationPurok) + ", Cabangahan, Siaton";
	// involved persons cell
  buttonViewInvolvedPersons.type = 'button';
  buttonViewInvolvedPersons.textContent = "View";
	buttonViewInvolvedPersons.className = "btn btn-no-border btn-light col-auto px-3";
  buttonViewInvolvedPersons.onclick = function() { showInvolvedPersons(id, involvedPersons, userUid) };
	// supporting documents cell
  buttonViewSupportingDocuments.type = 'button';
  buttonViewSupportingDocuments.textContent = "View";
	buttonViewSupportingDocuments.className = "btn btn-no-border btn-light col-auto px-3";
	buttonViewSupportingDocuments.onclick = function() { showSupportingDocuments(id, mediaFileNames) };
	// status cell
  cellStatus.innerHTML = utils.titleCase(status);
	// action cell
  buttonAction.type = 'button';
  buttonAction.textContent = utils.parseIncidentActionText(status);
	buttonAction.className = "btn btn-no-border btn-success text-white col-auto px-2 me-2";
    if (status == "RESOLVED") {
        //buttonAction.classList.toggle('col-12', true);
        buttonAction.classList.toggle('d-none', true);
    }
    buttonAction.onclick = function() { btnAction(id, status) };

  // buttonPrint.textContent = "Print";
	// buttonPrint.className = "btn btn-no-border btn-primary col-auto px-2 d-none";
	// buttonPrint.onclick = function() { reqPrint(firstName, middleName, lastName, age, civilStatus, addressPurok, residencyStatus, timestamp) }
	// if (status > 0) {
	// 	buttonPrint.classList.toggle('d-none', false);
	// }

    rowIncident.appendChild(cellIncidentDate);
    rowIncident.appendChild(cellIncidentType);
    rowIncident.appendChild(cellIncidentDetails);
    rowIncident.appendChild(cellIncidentLocation);
    rowIncident.appendChild(cellInvolvedPersons);
			cellInvolvedPersons.appendChild(buttonViewInvolvedPersons);
    // rowIncident.appendChild(cellSupportingDocuments);
		// 	cellSupportingDocuments.appendChild(buttonViewSupportingDocuments);
    rowIncident.appendChild(cellStatus);
    rowIncident.appendChild(cellAction);
    	cellAction.appendChild(buttonAction);
    	//cellAction.appendChild(buttonPrint);

    tbodyIncident.appendChild(rowIncident);
}

function btnAction(IncidentReportUid, IncidentReportStatus) {
	const refIncidentReport = doc(db, "incidents", IncidentReportUid);

	let updateData = {};

	if (IncidentReportStatus == "PENDING") {
		showHearingScheduler(IncidentReportUid);	
	}
	else if (IncidentReportStatus == "HEARING SCHEDULED") {
		updateData = { status: "UNDER INVESTIGATION" }
	}
	else if (IncidentReportStatus == "UNDER INVESTIGATION") {
		updateData = { status: "RESOLVED" }
	}

	updateDoc(refIncidentReport, updateData).then(() => {});
}

window.showInvolvedPersons = showInvolvedPersons;
function showInvolvedPersons(IncidentReportId, arrInvolvedPersons, userUid) {
	divInvolvedPersonsContainer.innerHTML = "";
	// update modal UI
	const myModal = new bootstrap.Modal('#modalInvolvedPersons', null);

	for (let i = 0; i < arrInvolvedPersons.length; i++) {
		const divPersonContainer = document.createElement('div');
		const tvName = document.createElement('P');
		const tvInvolvement = document.createElement('P');
		const tvContact = document.createElement('P');
		const tvAddress = document.createElement('p');

		tvName.textContent = i + 1 + ") " + arrInvolvedPersons[i].fullName;
		tvInvolvement.textContent = arrInvolvedPersons[i].involvement;
		tvAddress.textContent = arrInvolvedPersons[i].fullAddress;
		
		if (arrInvolvedPersons[i].involvement == "COMPLAINANT") {
			getDoc(doc(db, "users", userUid)).then(user => {
				tvContact.textContent = user.data().mobile;
			});
		}

		divPersonContainer.className = "row";
		tvName.className = "col-4 my-auto";
		tvInvolvement.className = "col-2 my-auto";
		tvContact.className = "col-2 my-auto";
		tvAddress.className = "col-4 my-auto";

		divPersonContainer.appendChild(tvName);
		divPersonContainer.appendChild(tvInvolvement);
		divPersonContainer.appendChild(tvContact);
		divPersonContainer.appendChild(tvAddress);
		divInvolvedPersonsContainer.appendChild(divPersonContainer);
	}
	myModal.show();
}

window.showSupportingDocuments = showSupportingDocuments;
function showSupportingDocuments(IncidentReportId, arrMediaFileNames) {
	divSupportingDocumentsContainer.innerHTML = "";
	// update modal UI
	const myModal = new bootstrap.Modal('#modalSupportingDocuments', null);

	for (let i = 0; i < arrMediaFileNames.length; i++) {
		const divMediaContainer = document.createElement('div');
		divMediaContainer.className = "col-6";
		const videoMedia = document.createElement('video');
		const imgMedia = document.createElement('img');

		getMetadata(sRef(storage, 'media/'+arrMediaFileNames[i])).then((metadata) => {
			console.log(metadata);
			if (metadata.contentType.includes("video")) {
				getDownloadURL(sRef(storage, 'media/'+arrMediaFileNames[i])).then((url) => {
					videoMedia.controls = true;
					videoMedia.src = url;
					// videoMedia.onclick = function() {
					// 	window.open(url);
					// }

					videoMedia.className = "rounded border-1 col-12 mb-3";
					videoMedia.style.cursor = "pointer";
					videoMedia.style.aspectRatio = "1/1";
					videoMedia.title = "Open image in new tab";
					divMediaContainer.appendChild(videoMedia);
				});
			}
			else if (metadata.contentType.includes("image")) {
				getDownloadURL(sRef(storage, 'media/'+arrMediaFileNames[i])).then((url) => {
					imgMedia.src = url;
					imgMedia.onclick = function() {
						window.open(url);
					}

					imgMedia.className = "rounded border-1 col-12 mb-3";
					imgMedia.style.cursor = "pointer";
					imgMedia.style.aspectRatio = "1/1";
					imgMedia.style.objectFit = "cover";
					imgMedia.title = "Open image in new tab";
					divMediaContainer.appendChild(imgMedia);
				});
			}
		});


		divSupportingDocumentsContainer.appendChild(divMediaContainer);
	}
	myModal.show();
}

window.showHearingScheduler = showHearingScheduler;
function showHearingScheduler(incidentReportId) {
	// update modal UI
	const myModal = new bootstrap.Modal('#modalHearingScheduler', null);

	btnSetSchedule.onclick = function() {
		const hearingDate = new Date(etDatePicker.value).getTime();

		if (hearingDate == NaN) {
			alert("Please select a valid date for the hearing schedule.");
			return;
		}

		const refIncidentReport = doc(db, "incidents", incidentReportId);
		const announcementData = {
			hearingDate: hearingDate,
			status: "HEARING SCHEDULED"
		}

		updateDoc((refIncidentReport), announcementData);
	}

	myModal.show();
}