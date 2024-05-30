import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js';
import { doc, collection, collectionGroup, addDoc, setDoc, getDoc, getDocs, deleteDoc, updateDoc, increment, query, where, orderBy, startAt, endAt, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';
import { ref as sRef, uploadBytes, getDownloadURL, deleteObject, getMetadata } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-storage.js";
import { db, auth, storage } from '../js/firebase.js';
import { btnLogout, tabTitle, navClearance, navId, navResidency, navIndigency, navBusinessPermit } from '../js/ui.js';
import  * as utils from '../js/utils.js';
//import { jsPDF } from "../node_modules/jspdf/dist/jspdf.node.js";

const tbodyCrime = document.querySelector("#tbodyCrime");
const divInvolvedPersonsContainer = document.querySelector("#divInvolvedPersonsContainer");
const divSupportingDocumentsContainer = document.querySelector("#divSupportingDocumentsContainer");

const etUid = document.querySelector("#etUid");
const btnFilterByUid = document.querySelector("#btnFilterByUid");
const etFirstName = document.querySelector("#etFirstName");
const etLastName = document.querySelector("#etLastName");
const btnFilterByName = document.querySelector("#btnFilterByName");

const tvBlotterDate = document.querySelector('#tvBlotterDate');
const tvStatus = document.querySelector('#tvStatus');
const tvBlotterType = document.querySelector('#tvBlotterType');
const tvBlotterLocation = document.querySelector('#tvBlotterLocation');
const tvBlotterDetails = document.querySelector('#tvBlotterDetails');
const btnPersonsInvolved = document.querySelector('#btnPersonsInvolved');
const btnSupportingDocuments = document.querySelector('#btnSupportingDocuments');
const btnBlotterAction = document.querySelector('#btnBlotterAction');

let markers = [];

btnFilterByName.addEventListener("click", () => {
	etUid.value = "";
	getCrimeReportsData();
});

btnFilterByUid.addEventListener("click", () => {
	etFirstName.value = "";
	etLastName.value = "";
	getCrimeReportsData();
});

window.addEventListener("load", function() {
	etUid.value = new URL(window.location.href).searchParams.get("id");
	getCrimeReportsData();
});

// listen for log out button
btnLogout.addEventListener("click", logOut);

// on load, check if user is not logged in
onAuthStateChanged(auth, user => {
    if (!user) {
			logOut();
			return;
    }

	getCrimeReportsData();
});

function logOut() {
	signOut(auth).then(() => {
		window.location = "../index.html";
	}).catch((error) => {});
}

function getCrimeReportsData() {
	const refBlotter = collection(db, "blotter");
	let qryCrime = null;
	
	const uid = etUid.value;
	const firstName = etFirstName.value.toUpperCase();
	const lastName = etLastName.value.toUpperCase();

	if (firstName || lastName) {
		qryCrime = query(refBlotter, where("involvedPersonsSearchKeys", "array-contains-any", [firstName, lastName]), orderBy("timestamp", "desc"));
	}
	else {
		qryCrime = query(refBlotter, orderBy("timestamp", "desc"));
	}
	
	// if (firstName && lastName) {
	// 	qryCrime = query(refBlotter, where("involvedPersons", "array-contains-any", [firstName, lastName]), orderBy("timestamp", "desc"));
	// }
	// else if (firstName && !lastName) {
	// 	qryCrime = query(refBlotter, where("firstName", "==", firstName), orderBy("timestamp", "desc"));
	// }
	// else if (!firstName && lastName) {
	// 	qryCrime = query(refBlotter, where("lastName", "==", lastName), orderBy("timestamp", "desc"));
	// }
	// else if (uid) {
	// 	qryCrime = query(refBlotter, where("userUid", "==", uid), orderBy("timestamp", "desc"));
	// }
	// else if (!firstName && !lastName && !uid) {
	// 	qryCrime = query(refBlotter, orderBy("timestamp", "desc"));
	// }
	
	onSnapshot(qryCrime, (snapCrimeReports) => {
		// clear table
		tbodyCrime.innerHTML = '';

		snapCrimeReports.forEach(crimeReport => {
      		renderTable(
				crimeReport.id,
				crimeReport.data().userUid,
				crimeReport.data().incidentDate,
				crimeReport.data().incidentDetails,
				crimeReport.data().locationPurok,
				crimeReport.data().incidentType,
				crimeReport.data().involvedPersons,
				crimeReport.data().mediaFileNames,
				crimeReport.data().status,
				crimeReport.data().timestamp
			);
    	});
	});
}

function renderTable(id, userUid, incidentDate, incidentDetails, locationPurok, incidentType, involvedPersons, mediaFileNames, status, timestamp) {
	const rowCrime = document.createElement('tr');
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
  buttonAction.textContent = utils.parseCrimeActionText(status);
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

    rowCrime.appendChild(cellIncidentDate);
    rowCrime.appendChild(cellIncidentType);
    rowCrime.appendChild(cellIncidentDetails);
    rowCrime.appendChild(cellIncidentLocation);
    rowCrime.appendChild(cellInvolvedPersons);
			cellInvolvedPersons.appendChild(buttonViewInvolvedPersons);
    rowCrime.appendChild(cellSupportingDocuments);
			cellSupportingDocuments.appendChild(buttonViewSupportingDocuments);
    rowCrime.appendChild(cellStatus);
    rowCrime.appendChild(cellAction);
    	cellAction.appendChild(buttonAction);
    	//cellAction.appendChild(buttonPrint);

    tbodyCrime.appendChild(rowCrime);
}

function btnAction(crimeReportUid, crimeReportStatus) {
	const refBlotterReport = doc(db, "blotter", crimeReportUid);

	let updateData = {};

	if (crimeReportStatus == "PENDING") {
		updateData = { status: "UNDER INVESTIGATION" }
	}
	else if (crimeReportStatus == "UNDER INVESTIGATION") {
		updateData = { status: "RESOLVED" }
	}

	updateDoc(refBlotterReport, updateData).then(() => {});
}

window.showInvolvedPersons = showInvolvedPersons;
function showInvolvedPersons(crimeReportId, arrInvolvedPersons, userUid) {
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
function showSupportingDocuments(crimeReportId, arrMediaFileNames) {
	
	if (arrMediaFileNames.length != 0) {
		divSupportingDocumentsContainer.innerHTML = "";
	}
	
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

// Initialize and add the map
let map;
initMap();

async function initMap() {
	// The location of Siaton
	// const position = { lat: location.latitude, lng: location.longitude };
	// Request needed libraries.
	//@ts-ignore
	const { Map } = await google.maps.importLibrary("maps");
	const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

	// The map, centered at Siaton
	map = new Map(document.getElementById("map"), {
		zoom: 12,
		center: {lat: 9.10318209158549, lng:122.96744201094816},
		mapId: "DEMO_MAP_ID",
		zoomControl: false,
		mapTypeControl: false,
		scaleControl: false,
		streetViewControl: false,
		rotateControl: false,
		fullscreenControl: false
	});

	const refBlotter = collection(db, "blotter");
	const qryCrime = query(refBlotter, where("status", "==", "PENDING"), orderBy("timestamp", "desc"));

	onSnapshot(qryCrime, (snapBlotter) => {
		// clear map
		markers.forEach(marker => {
			marker.setMap(null);
		});

		snapBlotter.forEach(blotter => {
			// The marker, positioned at Uluru
			const marker = new AdvancedMarkerElement({
				map: map,
				position: {lat: blotter.data().locationLatLng.latitude, lng: blotter.data().locationLatLng.longitude},
				title: blotter.data().incidentType,
			});

			// show info window
			const infowindow = new google.maps.InfoWindow({
				// content: `<button class="btn btn-primary px-4" onclick=(function(){
				// 	console.log("Id: "${blotter.id})
				// })()>${blotter.data().incidentType}</button>`
				// content: "<button class=\"btn btn-primary px-4\" onclick=(function(){console.log(\"Id: \""+blotter.id+")})()>"+blotter.data().incidentType+"</button>"
				content: blotter.data().incidentType
			});

			infowindow.open({
				anchor: marker,
				map
			});

			google.maps.event.addListener(marker, 'click', function() {
				infowindow.open(map,marker);
				const modalBlotter = new bootstrap.Modal('#modalBlotter', null);

				tvBlotterDate.textContent = utils.parseDate(blotter.data().incidentDate);
				tvStatus.textContent = utils.titleCase(blotter.data().status);
				tvBlotterType.textContent = blotter.data().incidentType;
				tvBlotterLocation.textContent = blotter.data().location;
				tvBlotterDetails.textContent = blotter.data().incidentDetails;

				btnPersonsInvolved.onclick = function() {
					showInvolvedPersons(blotter.id, blotter.data().involvedPersons, blotter.data().userUid)
					modalBlotter.hide();
				};

				btnSupportingDocuments.onclick = function() {
					showSupportingDocuments(blotter.id, blotter.data().mediaFileNames)
					modalBlotter.hide();
				};

				const status = blotter.data().status;
				btnBlotterAction.textContent = utils.parseCrimeActionText(status);
				btnBlotterAction.onclick = function() { modalBlotter.hide(); btnAction(blotter.id, status) };

				// if (status == "RESOLVED") {
				// 	btnBlotterAction.classList.toggle("d-none", true)
				// }

				modalBlotter.show();
			});
				
			markers.push(marker);
		});
	});
}