import { db, auth, storage } from '../js/firebase.js';
import { ref, query, orderByChild, equalTo, get, set, push, update, child, remove, onValue, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js';
import { getNthDayOfMonth, getMonth, capitalizeString, parseDate } from "../js/utils.js";

const btnPrint = document.querySelector("#btnPrint");
const serviceTitle = document.querySelector("#serviceTitle");
const tvPunongBarangay = document.querySelector("#tvPunongBarangay");
const documentContent = document.querySelector(".document-content");

btnPrint.addEventListener("click", function() {
	window.print();
});

window.addEventListener("load", function() {
	// getPunongBarangayData();

	const service = localStorage.getItem("service");
	console.log(service);

	if (service == "clearance") {
		serviceTitle.innerHTML = "BARANGAY CLEARANCE";

		const firstName = localStorage.getItem("firstName");
		const middleName = localStorage.getItem("middleName");
		const lastName = localStorage.getItem("lastName");
		const age = localStorage.getItem("age");
		const civilStatus = localStorage.getItem("civilStatus");
		const purok = localStorage.getItem("purok");
		const residency = localStorage.getItem("residency");
		const purpose = localStorage.getItem("purpose");
		const timestamp = localStorage.getItem("timestamp");

		console.log("firstName: " + firstName);
		console.log("middleName: " + middleName);
		console.log("lastName: " + lastName);
		console.log("age: " + age);
		console.log("civilStatus: " + civilStatus);
		console.log("purok: " + purok);
		console.log("residency: " + residency);
		console.log("purpose: " + purpose);
		console.log("timestamp: " + timestamp);

		const date = new Date(Number(timestamp));

		documentContent.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
			"This is to certify that <u>"+firstName.toUpperCase()+" "+middleName.toUpperCase()+" "+lastName.toUpperCase()+"</u>, "+
			"<u>"+age+"</u> years old, <u>"+civilStatus.toUpperCase()+"</u>, "+
			"<u>"+residency.toUpperCase()+"</u> at <u>"+purok.toUpperCase()+"</u>, Siaton, "+
			"is a law abiding citizen and has NO DEROGATORY record/s in this office up to this date.<br><br>"+
			"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
			"Given this <u>"+getNthDayOfMonth(timestamp).toUpperCase()+" DAY OF "+getMonth(timestamp).toUpperCase()+", "+
			date.getFullYear()+"</u>, Barangay Cabangahan, Siaton.<br><br>"+
			"Purpose: <u>"+purpose.toUpperCase()+"</u><br><br><br>"+
			"<u>"+firstName.toUpperCase()+" "+middleName.toUpperCase()+" "+lastName.toUpperCase()+"</u><br>"+
			"Applicant's Signature";
	}
	else if (service == "residency") {
		serviceTitle.innerHTML = "CERTIFICATE OF RESIDENCY";

		const firstName = localStorage.getItem("firstName");
		const middleName = localStorage.getItem("middleName");
		const lastName = localStorage.getItem("lastName");
		const age = localStorage.getItem("age");
		const civilStatus = localStorage.getItem("civilStatus");
		const timestamp = localStorage.getItem("timestamp");

		const date = new Date(Number(timestamp));

		documentContent.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
			"This is to certify that <u>"+firstName.toUpperCase()+" "+middleName.toUpperCase()+" "+lastName.toUpperCase()+"</u>, "+
			"<u>"+age+" years old</u>, <u>"+civilStatus.toUpperCase()+"</u>, "+
			"is a <b>RESIDENT</b> of Barangay Cabangahan, Siaton, Negros Oriental.<br><br>"+
			"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
			"Based on record of this office, he/she has been residing at Barangay Cabangahan, Siaton, Negros Oriental.<br><br>"+
			"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
			"This <b>CERTIFICATION</b> is being issued upon the request of the above-named person for whatever legal purpose it may serve.<br><br>"+
			"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
			"Issued this <u>"+getNthDayOfMonth(timestamp).toUpperCase()+" DAY OF "+getMonth(timestamp).toUpperCase()+", "+
			date.getFullYear()+"</u>, Barangay Cabangahan, Siaton, Negros Oriental.<br><br>"+
			"<u>"+firstName.toUpperCase()+" "+middleName.toUpperCase()+" "+lastName.toUpperCase()+"</u><br>"+
			"Applicant's Signature";
	}
	else if (service == "indigency") {
		serviceTitle.innerHTML = "CERTIFICATE OF INDIGENCY";

		const firstName = localStorage.getItem("firstName");
		const middleName = localStorage.getItem("middleName");
		const lastName = localStorage.getItem("lastName");
		const age = localStorage.getItem("age");
		const civilStatus = localStorage.getItem("civilStatus");
		const timestamp = localStorage.getItem("timestamp");

		const date = new Date(Number(timestamp));

		documentContent.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
			"This is to certify that <u>"+firstName.toUpperCase()+" "+middleName.toUpperCase()+" "+lastName.toUpperCase()+"</u>, "+
			"<u>"+age+" years old</u>, <u>"+civilStatus.toUpperCase()+"</u>, "+
			"is one of the <b>INDIGENTS</b> in our barangay.<br><br>"+
			"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
			"This <b>CERTIFICATION</b> is being issued upon the request of the above-named person for whatever legal purpose it may serve.<br><br>"+
			"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
			"Issued this <u>"+getNthDayOfMonth(timestamp).toUpperCase()+" DAY OF "+getMonth(timestamp).toUpperCase()+", "+
			date.getFullYear()+"</u>, Barangay Cabangahan, Siaton, Negros Oriental.<br><br><br>"+
			"<u>"+firstName.toUpperCase()+" "+middleName.toUpperCase()+" "+lastName.toUpperCase()+"</u><br>"+
			"Applicant's Signature";
	}
});

// function getPunongBarangayData() {
// 	const refPunongBarangay = query(ref(db, "punongBarangay"));

// 	// show clearance table (or div) and hide all other tables (or divs)
//     get(refPunongBarangay).then(snapPunongBarangay => {
// 			tvPunongBarangay.innerHTML = "<u><b>"+snapPunongBarangay.val()+"</b></u>";
//     }).then(() => window.print());
// }