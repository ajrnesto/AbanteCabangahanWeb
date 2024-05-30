import { db, auth, storage } from '../js/firebase.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js';
import { doc, collection, getDoc, or, and, getDocs, addDoc, updateDoc, increment, deleteDoc, Timestamp, arrayUnion, deleteField, limit, query, where, orderBy, startAt, endAt, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';
import { ref as sRef, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-storage.js";
import * as utils from '../js/utils.js';

const cardCrimeReports = document.querySelector("#cardCrimeReports");
const tvCrimeReports = document.querySelector("#tvCrimeReports");

const cardDocumentRequests = document.querySelector("#cardDocumentRequests");
const tvDocumentRequests = document.querySelector("#tvDocumentRequests");

const cardIncidentReports = document.querySelector("#cardIncidentReports");
const tvIncidentReports = document.querySelector("#tvIncidentReports");

const cardCrimeReportsHistory = document.querySelector("#cardCrimeReportsHistory");
const tvEmptyCrimeReportsHistory = document.querySelector("#tvEmptyCrimeReportsHistory");
const divCrimeReportsHistory = document.querySelector("#divCrimeReportsHistory");
let chartCrimeReportsHistory = Chart.getChart("#chartCrimeReportsHistory");

const cardDocumentRequestsChart = document.querySelector("#cardDocumentRequestsChart");
const tvEmptyDocumentRequestsChart = document.querySelector("#tvEmptyDocumentRequestsChart");
const divDocumentRequestsChart = document.querySelector("#divDocumentRequestsChart");
let chartDocumentRequestsChart = Chart.getChart("#chartDocumentRequestsChart");

const cardIncidentReportsHistory = document.querySelector("#cardIncidentReportsHistory");
const tvEmptyIncidentReportsHistory = document.querySelector("#tvEmptyIncidentReportsHistory");
const divIncidentReportsHistory = document.querySelector("#divIncidentReportsHistory");
let chartIncidentReportsHistory = Chart.getChart("#chartIncidentReportsHistory");

const date = new Date();
const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getTime();
const firstDayOfMonth1MonthAgo = new Date(date.getFullYear(), date.getMonth()-1, 1).getTime();
const lastDayOfMonth1MonthAgo = new Date(date.getFullYear(), date.getMonth()-1 + 1, 0).getTime();
const firstDayOfMonth2MonthsAgo = new Date(date.getFullYear(), date.getMonth()-2, 1).getTime();
const lastDayOfMonth2MonthsAgo = new Date(date.getFullYear(), date.getMonth()-2 + 1, 0).getTime();
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// on load, check if user is not logged in
onAuthStateChanged(auth, user => {
	if (!user) {
		logOut();
		return;
	}
});

function logOut() {
	signOut(auth).then(() => {
		window.location = "../index.html";
	}).catch((error) => {});
};

cardCrimeReports.addEventListener("click", function() {
	window.location = "crimes.html";
});

cardDocumentRequests.addEventListener("click", function() {
	window.location = "clearance.html";
});

cardIncidentReports.addEventListener("click", function() {
	window.location = "incidents.html";
});

cardCrimeReportsHistory.addEventListener("click", function() {
	window.location = "crimes.html";
});

cardIncidentReportsHistory.addEventListener("click", function() {
	window.location = "incidents.html";
});

window.addEventListener("load", function() {
	listenToCrimeReports();
	listenToIncidentReports();
	listenToCrimeReportsHistory();
	listenToIncidentReportsHistory();
	listenToDocumentRequests();
});

function listenToCrimeReports() {
	let qryCrimeReports = query(collection(db, "crimes"), where("status", "!=", "COMPLETED"));

	onSnapshot(qryCrimeReports, (reports) => {
		tvCrimeReports.innerHTML = reports.size;
	})
}

function listenToIncidentReports() {
	let qryIncidentReports = query(collection(db, "incidents"), where("status", "!=", "COMPLETED"));

	onSnapshot(qryIncidentReports, (reports) => {
		tvIncidentReports.innerHTML = reports.size;
	})
}

function listenToDocumentRequests() {
	let qryRequests = query(collection(db, "requests"));

	onSnapshot(qryRequests, (requests) => {
		tvDocumentRequests.innerHTML = requests.size;
		let totalRequests = 0;
		let clearanceCount = 0;
		let residencyCount = 0;
		let indigencyCount = 0;

		requests.forEach(request => {
			totalRequests++;

			const documentType = request.data().documentType;

			if (documentType == "CLEARANCE") {
				clearanceCount++;
			}
			else if (documentType == "RESIDENCY") {
				residencyCount++;
			}
			else if (documentType == "INDIGENCY") {
				indigencyCount++;
			}

			if (chartDocumentRequestsChart != undefined) {
				chartDocumentRequestsChart.destroy();
			}
		
			const d = new Date();
			let month = d.getMonth();
			chartDocumentRequestsChart = new Chart("chartDocumentRequestsChart", {
				type: "pie",
				data: {
					labels: [
						"Clearance",
						"Residency",
						"Indigency"
					],
					datasets: [{
						label: 'Document Requests',
						data: [
							clearanceCount,
							residencyCount,
							indigencyCount
						]
					}]
				},
				options: {
					plugins: {
							legend: {
									display: true,
									position: 'bottom',
									align: 'start'
							}
					}
				}
			});
		
			if (totalRequests == 0) {
				tvEmptyDocumentRequestsChart.classList.toggle("d-none", false);
				divDocumentRequestsChart.classList.toggle("d-none", true);
			}
			else {
				tvEmptyDocumentRequestsChart.classList.toggle("d-none", true);
				divDocumentRequestsChart.classList.toggle("d-none", false);
			}
		});
	})
}

function listenToCrimeReportsHistory() {
	const qryCrimeReports = query(collection(db, "crimes"));

	onSnapshot(qryCrimeReports, (crimes) => {
		let totalCrimeReports = 0;
		let bookingsThisMonth = 0;
		let bookingsOneMonthAgo = 0;
		let bookingsTwoMonthsAgo = 0;
		let extraBookings = 0;

		crimes.forEach(crime => {
			totalCrimeReports++;

			const timestamp = crime.data().timestamp;
			if (timestamp >= firstDayOfMonth && timestamp <= lastDayOfMonth) {
				bookingsThisMonth++;
			}
			else if (timestamp >= firstDayOfMonth1MonthAgo && timestamp <= lastDayOfMonth1MonthAgo) {
				bookingsOneMonthAgo++;
			}
			else if (timestamp >= firstDayOfMonth2MonthsAgo && timestamp <= lastDayOfMonth2MonthsAgo) {
				bookingsTwoMonthsAgo++;
			}
			else {
				extraBookings++;
				console.log("extra: " + extraBookings)
			}
		

			if (chartCrimeReportsHistory != undefined) {
				chartCrimeReportsHistory.destroy();
			}
		
			const d = new Date();
			let month = d.getMonth();
			chartCrimeReportsHistory = new Chart("chartCrimeReportsHistory", {
				type: "line",
				data: {
					labels: [
						months[month-2],
						months[month-1],
						months[month]
					],
					datasets: [{
						label: 'Crime Reports',
						data: [
							bookingsTwoMonthsAgo,
							bookingsOneMonthAgo,
							bookingsThisMonth
						]
					}]
				},
				options: {
					plugins: {
							legend: {
									display: true,
									position: 'bottom',
									align: 'start'
							}
					}
				}
			});
		
			if (totalCrimeReports == 0) {
				tvEmptyCrimeReportsHistory.classList.toggle("d-none", false);
				divCrimeReportsHistory.classList.toggle("d-none", true);
			}
			else {
				tvEmptyCrimeReportsHistory.classList.toggle("d-none", true);
				divCrimeReportsHistory.classList.toggle("d-none", false);
			}
		});
	});
}

function listenToIncidentReportsHistory() {
	const qryCrimeReports = query(collection(db, "incidents"));

	onSnapshot(qryCrimeReports, (incidents) => {
		let totalCrimeReports = 0;
		let bookingsThisMonth = 0;
		let bookingsOneMonthAgo = 0;
		let bookingsTwoMonthsAgo = 0;
		let extraBookings = 0;

		incidents.forEach(crime => {
			totalCrimeReports++;

			const timestamp = crime.data().timestamp;
			if (timestamp >= firstDayOfMonth && timestamp <= lastDayOfMonth) {
				bookingsThisMonth++;
			}
			else if (timestamp >= firstDayOfMonth1MonthAgo && timestamp <= lastDayOfMonth1MonthAgo) {
				bookingsOneMonthAgo++;
			}
			else if (timestamp >= firstDayOfMonth2MonthsAgo && timestamp <= lastDayOfMonth2MonthsAgo) {
				bookingsTwoMonthsAgo++;
			}
			else {
				extraBookings++;
				console.log("extra: " + extraBookings)
			}
		

			if (chartIncidentReportsHistory != undefined) {
				chartIncidentReportsHistory.destroy();
			}
		
			const d = new Date();
			let month = d.getMonth();
			chartIncidentReportsHistory = new Chart("chartIncidentReportsHistory", {
				type: "line",
				data: {
					labels: [
						months[month-2],
						months[month-1],
						months[month]
					],
					datasets: [{
						label: 'Incident Reports',
						data: [
							bookingsTwoMonthsAgo,
							bookingsOneMonthAgo,
							bookingsThisMonth
						]
					}]
				},
				options: {
					plugins: {
							legend: {
									display: true,
									position: 'bottom',
									align: 'start'
							}
					}
				}
			});
		
			if (totalCrimeReports == 0) {
				tvEmptyIncidentReportsHistory.classList.toggle("d-none", false);
				divIncidentReportsHistory.classList.toggle("d-none", true);
			}
			else {
				tvEmptyIncidentReportsHistory.classList.toggle("d-none", true);
				divIncidentReportsHistory.classList.toggle("d-none", false);
			}
		});
	});
}