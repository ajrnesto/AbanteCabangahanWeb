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

function getRequestsData() {
	const refId = ref(db, "businessPermitRequests");

	// show clearance table (or div) and hide all other tables (or divs)
    onValue(refId, (snapAllRequests) => {
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
				snapRequest.val().businessName,
				snapRequest.val().purok,
				snapRequest.val().timestamp,
				snapRequest.val().status
			);
        });
    });
}

function renderTable(uid, firstName, middleName, lastName, businessName, purok, timestamp, status) {
    const rowId = document.createElement('tr');
    const cellFirstName = document.createElement('td');
    const cellMiddleName = document.createElement('td');
    const cellLastName = document.createElement('td');
    const cellBusinessName = document.createElement('td');
    const cellPurok = document.createElement('td');
    const cellDate = document.createElement('td');
    const cellStatus = document.createElement('td');
    const cellAction = document.createElement('td');
    const buttonAction = document.createElement('button');

    cellFirstName.innerHTML = firstName;
    cellMiddleName.innerHTML = middleName;
    cellLastName.innerHTML = lastName;
    cellBusinessName.innerHTML = businessName;
    cellPurok.innerHTML = purok;
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

    rowId.appendChild(cellFirstName);
    rowId.appendChild(cellMiddleName);
    rowId.appendChild(cellLastName);
    rowId.appendChild(cellBusinessName);
    rowId.appendChild(cellPurok);
    rowId.appendChild(cellDate);
    rowId.appendChild(cellStatus);
    rowId.appendChild(cellAction);
    cellAction.appendChild(buttonAction);

    tbodyRequests.appendChild(rowId);
}

function btnAction(requestUid, requestStatus) {
	// get current tab index
	
	
    // reference current request's status
    const refRequestStatus = ref(db, "businessPermitRequests/"+requestUid+"/status");

    // 0 = pending, 1 = on the way, 2 = delivered
    if (requestStatus < 2) {
        // update to next level status
        set(refRequestStatus, requestStatus+=1).then(() => {

        });
    }
    else {
        // if status == 2 or 3
        const refRequest = ref(db, "businessPermitRequests/"+requestUid);
		remove(refRequest);
    }
}