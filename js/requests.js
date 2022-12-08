import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js';
import { ref, query, orderByChild, equalTo, get, set, remove, onValue  } from 'https://www.gstatic.com/firebasejs/9.14.0/firebase-database.js';
import { db, auth } from '../js/firebase.js';
import { btnLogout, tbodyRequests, navClearance, navId, navResidency, navIndigency, navPermit } from '../js/ui.js';
import  * as utils from '../js/utils.js';

function btnAction(requestUid, requestStatus) {
    // reference current request's status
    const refRequestStatus = ref(db, "clearanceRequests/"+requestUid+"/status");

    // 0 = pending, 1 = on the way, 2 = delivered
    if (requestStatus < 2) {
        // update to next level status
        set(refRequestStatus, requestStatus+=1).then(() => {

        });
    }
    else {
        // if status == 2 or 3
        const refRequest = ref(db, "clearanceRequests/"+requestUid);
		remove(refRequest);
    }
}

function logOut() {
    signOut(auth).then(() => {
        window.location = "../index.html";
    }).catch((error) => {});
};

// on load, check if user is not logged in
onAuthStateChanged(auth, user => {
    if (!user) {
        logOut();
    }
});

function renderTable(uid, firstName, middleName, lastName, age, purok, residency, purpose, timestamp, status) {
    const rowClearance = document.createElement('tr');
    const cellName = document.createElement('td');
    const cellAge = document.createElement('td');
    const cellAddress = document.createElement('td');
    const cellResidency = document.createElement('td');
    const cellPurpose = document.createElement('td');
    const cellDate = document.createElement('td');
    const cellStatus = document.createElement('td');
    const cellAction = document.createElement('td');
    const buttonAction = document.createElement('button');

    cellName.innerHTML = utils.parseFullName(firstName, middleName, lastName);
    cellAge.innerHTML = age;
    cellAddress.innerHTML = purok;
    cellResidency.innerHTML = residency;
    cellPurpose.innerHTML = purpose;
	cellDate.innerHTML = utils.parseDate(timestamp);
    cellStatus.innerHTML = utils.parseStatus(status);

    buttonAction.type = 'button';
    buttonAction.textContent = utils.parseAction(status);
    buttonAction.classList.toggle('btn', true);
    buttonAction.classList.toggle('btn-no-border', true);
    buttonAction.classList.toggle('btn-outline-primary', true);
    buttonAction.classList.toggle('col-12', true);
    if (status >= 2) {
        buttonAction.classList.toggle('col-12', true);
        buttonAction.classList.toggle('btn-outline-primary', false);
        buttonAction.classList.toggle('btn-outline-danger', true);
    }
    buttonAction.onclick = function() { btnAction(uid, status) };

    rowClearance.appendChild(cellName);
    rowClearance.appendChild(cellAge);
    rowClearance.appendChild(cellAddress);
    rowClearance.appendChild(cellResidency);
    rowClearance.appendChild(cellPurpose);
    rowClearance.appendChild(cellDate);
    rowClearance.appendChild(cellStatus);
    rowClearance.appendChild(cellAction);
    cellAction.appendChild(buttonAction);

    tbodyRequests.appendChild(rowClearance);
}

function getLastActiveRequestNav() {
	if (localStorage.getItem("active_request_nav") == null) {
		return 0;
	}
	else {
		return localStorage.getItem("active_request_nav");
	}
}

function getRequestCount() {
	const refPendingClearanceReqs = ref(db, "clearanceRequests");
	const qryPendingClearanceReqs = query(refPendingClearanceReqs, orderByChild('status'), equalTo(0));

	onValue(qryPendingClearanceReqs, (snapData) => {
		const count = snapData.exists() && Object.keys(snapData.val()).length || 0;

		if (count != 0) {
			navClearance.innerHTML = "CLEARANCE ("+count+" Pending)";
		}
		else {
			navClearance.innerHTML = "CLEARANCE";
		}
	});
}

function getClearanceData() {
	const refClearance = ref(db, "clearanceRequests");

	// show clearance table (or div) and hide all other tables (or divs)
    onValue(refClearance, (snapAllRequests) => {
        // clear
        tbodyRequests.innerHTML = '';
        // listen for request changes
        snapAllRequests.forEach(snapRequest => {
            // get each request and their corresponding user:
            renderTable(
				snapRequest.val().uid,
				snapRequest.val().firstName,
				snapRequest.val().middleName,
				snapRequest.val().lastName,
				snapRequest.val().age,
				snapRequest.val().purok,
				snapRequest.val().residency,
				snapRequest.val().purpose,
				snapRequest.val().timestamp,
				snapRequest.val().status
			);
        });
    });
}

window.addEventListener("load", () => {
	// check navbar active item
	let navIndex = getLastActiveRequestNav();

    // load table
	// if (navIndex == $clearanceIndex)
    getClearanceData(); // then load table
	getRequestCount(); // then load pending count
});

// listen for log out button
btnLogout.addEventListener("click", logOut);