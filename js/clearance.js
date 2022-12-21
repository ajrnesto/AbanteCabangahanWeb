import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js';
import { ref, query, orderByChild, equalTo, get, set, remove, onValue  } from 'https://www.gstatic.com/firebasejs/9.14.0/firebase-database.js';
import { db, auth } from '../js/firebase.js';
import { btnLogout, tbodyRequests, tabTitle, navClearance, navId, navResidency, navIndigency, navBusinessPermit } from '../js/ui.js';
import  * as utils from '../js/utils.js';

// listen for log out button
btnLogout.addEventListener("click", logOut);

// on load, check if user is not logged in
onAuthStateChanged(auth, user => {
    if (!user) {
        logOut();
    }
});

function logOut() {
    signOut(auth).then(() => {
        window.location = "../index.html";
    }).catch((error) => {});
};

window.addEventListener("load", () => {
	// check navbar active item
	getRequestsData();
	//loadSavedPendingRequestsCount();
	//getNewPendingRequestCounts();
});

// function loadSavedPendingRequestsCount() {
// 	const clearanceCount = localStorage.getItem("last_clearance_pending_count");
// 	if (clearanceCount != null || clearanceCount != 0) {
// 		navClearance.textContent = "CLEARANCE ("+clearanceCount+" Pending)";
// 	}
// 	else {
// 		navClearance.textContent = "CLEARANCE";
// 	}
	
// 	const idCount = localStorage.getItem("last_id_pending_count");
// 	if (idCount != null || idCount != 0) {
// 		navId.textContent = "RESIDENT'S ID ("+idCount+" Pending)";
// 	}
// 	else {
// 		navId.textContent = "RESIDENT'S ID";
// 	}
	
// 	const residencyCount = localStorage.getItem("last_residency_pending_count");
// 	if (residencyCount != null || residencyCount != 0) {
// 		navResidency.textContent = "RESIDENCY ("+residencyCount+" Pending)";
// 	}
// 	else {
// 		navResidency.textContent = "RESIDENCY";
// 	}
	
	
// 	const indigencyCount = localStorage.getItem("last_indigency_pending_count");
// 	if (indigencyCount != null || indigencyCount != 0) {
// 		navIndigency.textContent = "INDIGENCY ("+indigencyCount+" Pending)";
// 	}
// 	else {
// 		navIndigency.textContent = "INDIGENCY";
// 	}
	
	
// 	const businessPermitCount = localStorage.getItem("last_business_permit_pending_count");
// 	if (businessPermitCount != null || businessPermitCount != 0) {
// 		navBusinessPermit.textContent = "BUSINESS PERMIT ("+businessPermitCount+" Pending)";
// 	}
// 	else {
// 		navBusinessPermit.textContent = "BUSINESS PERMIT";
// 	}
// }

// function getNewPendingRequestCounts() {
// 	// clearance
// 	const refPendingClearanceReqs = ref(db, "clearanceRequests");
// 	const qryPendingClearanceReqs = query(refPendingClearanceReqs, orderByChild('status'), equalTo(0));
// 	onValue(qryPendingClearanceReqs, (snapData) => {
// 		const count = snapData.exists() && Object.keys(snapData.val()).length || 0;
// 		localStorage.setItem("last_clearance_pending_count", count);

// 		if (count != 0) {
// 			navClearance.textContent = "CLEARANCE ("+count+" Pending)";
// 		}
// 		else {
// 			navClearance.textContent = "CLEARANCE";
// 		}
// 	});

// 	// resident's id
// 	const refPendingIdReqs = ref(db, "idRequests");
// 	const qryPendingIdReqs = query(refPendingIdReqs, orderByChild('status'), equalTo(0));
// 	onValue(qryPendingIdReqs, (snapData) => {
// 		const count = snapData.exists() && Object.keys(snapData.val()).length || 0;
// 		localStorage.setItem("last_id_pending_count", count);

// 		if (count != 0) {
// 			navId.textContent = "RESIDENT'S ID ("+count+" Pending)";
// 		}
// 		else {
// 			navId.textContent = "RESIDENT'S ID";
// 		}
// 	});

// 	// residency
// 	const refPendingResidencyReqs = ref(db, "residencyRequests");
// 	const qryPendingResidencyReqs = query(refPendingResidencyReqs, orderByChild('status'), equalTo(0));
// 	onValue(qryPendingResidencyReqs, (snapData) => {
// 		const count = snapData.exists() && Object.keys(snapData.val()).length || 0;
// 		localStorage.setItem("last_residency_pending_count", count);

// 		if (count != 0) {
// 			navResidency.textContent = "RESIDENCY ("+count+" Pending)";
// 		}
// 		else {
// 			navResidency.textContent = "RESIDENCY";
// 		}
// 	});

// 	// indigency
// 	const refPendingIndigencyReqs = ref(db, "indigencyRequests");
// 	const qryPendingIndigencyReqs = query(refPendingIndigencyReqs, orderByChild('status'), equalTo(0));
// 	onValue(qryPendingIndigencyReqs, (snapData) => {
// 		const count = snapData.exists() && Object.keys(snapData.val()).length || 0;

// 		localStorage.setItem("last_indigency_pending_count", count);

// 		if (count != 0) {
// 			navIndigency.textContent = "INDIGENCY ("+count+" Pending)";
// 		}
// 		else {
// 			navIndigency.textContent = "INDIGENCY";
// 		}
// 	});

// 	// business permit
// 	const refPendingBusinessPermitReqs = ref(db, "businessPermitRequests");
// 	const qryPendingBusinessPermitReqs = query(refPendingBusinessPermitReqs, orderByChild('status'), equalTo(0));
// 	onValue(qryPendingBusinessPermitReqs, (snapData) => {
// 		const count = snapData.exists() && Object.keys(snapData.val()).length || 0;

// 		localStorage.setItem("last_business_permit_pending_count", count);

// 		if (count != 0) {
// 			navBusinessPermit.textContent = "BUSINESS PERMIT ("+count+" Pending)";
// 		}
// 		else {
// 			navBusinessPermit.textContent = "BUSINESS PERMIT";
// 		}
// 	});
// }

function getRequestsData() {
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
    buttonAction.classList.toggle('btn-primary', true);
    buttonAction.classList.toggle('col-12', true);
    if (status >= 2) {
        buttonAction.classList.toggle('col-12', true);
        buttonAction.classList.toggle('btn-primary', false);
        buttonAction.classList.toggle('btn-danger', true);
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

function btnAction(requestUid, requestStatus) {
	// get current tab index
	
	
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