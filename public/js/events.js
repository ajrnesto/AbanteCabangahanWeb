import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js';
import { ref, query, orderByChild, equalTo, get, set, push, update, child, remove, onValue, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js';
import { ref as sRef, uploadBytes, getDownloadURL, deleteObject } from "../node_modules/firebase/firebase-storage.js";
import { db, auth, storage } from '../js/firebase.js';
import { btnLogout, tbodyEvent, modalEvent, tvAddEvent, etEventName, etEventDetails, btnSaveEvent, tvDelete, modalDelete, btnDelete } from '../js/ui.js';
import * as utils from '../js/utils.js';

const etKeywords = document.querySelector('#etKeywords');
const dpSchedule = document.querySelector("#dpSchedule");
const btnOpenArchive = document.querySelector('#btnOpenArchive');
const tbodyArchive = document.querySelector('#tbodyArchive');
const imgHolder = document.querySelector('#imgHolder');
const btnUploadImage = document.querySelector('#btnUploadImage');
const btnUploadImageLabel = document.querySelector("#btnUploadImageLabel");

let selectedImage = null;

btnOpenArchive.addEventListener("click", function() {
	renderArchives();
});

// listen for log out button
btnLogout.addEventListener("click", logOut);

btnUploadImage.addEventListener("change", () => {
	selectedImage = btnUploadImage.files[0];
	imgHolder.src = URL.createObjectURL(selectedImage);
	console.log("CHANGED  IMAGE: "+imgHolder.src);
	btnUploadImageLabel.innerHTML = "Change<br>Image";
});

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
	getEventData();
	//loadSavedPendingEventCount();
	//getNewPendingRequestCounts();
});

window.showEditEventModal = showEditEventModal;
function showEditEventModal(eventUid, thumbnail, eventTitle, eventContent, timestamp, arrKeywords) { // changes modal contents
	selectedImage = null;

	if (thumbnail == null) {
		imgHolder.src = "https://via.placeholder.com/300x250?text=Cover+Photo";
	}
	else {
		getDownloadURL(sRef(storage, 'news/'+thumbnail)).then((url) => {
			imgHolder.src = url;
		});
	}

	// null eventUid => new event
	if (eventUid == null) {
		etEventName.value = "";
		etEventDetails.value = "";
		dpSchedule.value = "";
		etKeywords.value = "";

		tvAddEvent.textContent = "Add Event";
		btnSaveEvent.textContent = "Publish Event";
	}
	else {
		// update modal UI
		const myModal = new bootstrap.Modal('#modalEvent', null);
		tvAddEvent.textContent = "Edit Event";
		btnSaveEvent.textContent = "Save Changes";

		const ISO = new Date(timestamp).toISOString();
		dpSchedule.value = ISO.slice(0,16);
		console.log(ISO);
		myModal.show();

		etEventName.value = eventTitle;
		etEventDetails.value = eventContent;
		etKeywords.value = arrKeywords;
	}

	btnSaveEvent.onclick = function() {
		saveEvent(eventUid);
	}
}

function saveEvent(eventUid) { // updates firebase data
	const keywords = etKeywords.value.toUpperCase().split(",").map(function(item) {
		return item.trim();
	});

	const ISO = dpSchedule.value;
	const MILLIS = new Date(ISO).getTime();

	if (etEventName.value == "" ||
		etEventDetails.value == "" ||
		ISO == "" ||
		ISO == null ||
		MILLIS == undefined) {
			return;
	}

	const EVENT_HAS_THUMBNAIL = (selectedImage != null);
	let thumbnail_file_name = null;

	if (EVENT_HAS_THUMBNAIL) {
		thumbnail_file_name = Date.now();

		uploadBytes(sRef(storage, "news/"+thumbnail_file_name), selectedImage).then(() => {
			uploadEventsData(eventUid, thumbnail_file_name, keywords, MILLIS);
		});
	}
	else {
		uploadEventsData(eventUid, thumbnail_file_name, keywords, MILLIS);
	}
}

function uploadEventsData(eventUid, thumbnail_file_name, keywords, MILLIS) {
	const ADDING_NEW_NEWS = (eventUid == null);
	if (ADDING_NEW_NEWS) {
		// add new event
		const refEvent = ref(db, "events");
		const newEventKey = push(child(ref(db), "events")).key;

		const eventData = {
			uid: newEventKey,
			thumbnail: thumbnail_file_name,
			title: etEventName.value,
			content: etEventDetails.value,
			author: "Barangay360",
			isArchived: false,
			timestamp: MILLIS,
			arrKeywords: keywords
		}

		update(child(refEvent, newEventKey), eventData);
	}
	else {
		// edit event
		const refSelectedEvent = ref(db, "events/"+eventUid);
		let eventData = {};

		const THUMBNAIL_WAS_UPDATED = (thumbnail_file_name != null);
		if (THUMBNAIL_WAS_UPDATED) {
			eventData = {
				title: etEventName.value,
				thumbnail: thumbnail_file_name,
				content: etEventDetails.value,
				timestamp: MILLIS,
				arrKeywords: keywords
			}
		}
		else {
			eventData = {
				title: etEventName.value,
				content: etEventDetails.value,
				timestamp: MILLIS,
				arrKeywords: keywords
			}
		}

		utils.hideModal('#modalEvent');
		update(refSelectedEvent, eventData);
	}

	etEventName.value = "";
	etEventDetails.value = "";
}

function getEventData() {
	const refEvents = query(ref(db, "events"), orderByChild("isArchived"), equalTo(false));

	// show clearance table (or div) and hide all other tables (or divs)
    onValue(refEvents, (snapAllEvent) => {
        // clear
        tbodyEvent.innerHTML = '';
        // listen for request changes
        snapAllEvent.forEach(snapRequest => {
            // get each request and their corresponding user:
            renderTable(
				snapRequest.val().uid,
				snapRequest.val().thumbnail,
				snapRequest.val().title,
				snapRequest.val().content,
				snapRequest.val().author,
				snapRequest.val().timestamp,
				snapRequest.val().arrKeywords
			);
        });
    });
}

function renderTable(uid, thumbnail, title, content, author, timestamp, arrKeywords) {
    const rowId = document.createElement('tr');
    const cellDate = document.createElement('td');
    const cellThumbnail = document.createElement('td');
    const imgThumbnail = document.createElement('img');
    const cellTitle = document.createElement('td');
    const cellContent = document.createElement('td');
    const cellAuthor = document.createElement('td');
    const cellAction = document.createElement('td');
    const buttonEdit = document.createElement('button');
    const buttonDelete = document.createElement('button');
    const buttonArchive = document.createElement('button');

		if (thumbnail == null) {
			imgThumbnail.src = "https://via.placeholder.com/150?text=Image";
		}
		else {
			getDownloadURL(sRef(storage, 'news/'+thumbnail)).then((url) => {
				imgThumbnail.src = url;
				imgThumbnail.onclick = function() {
					window.open(url);
				}
				imgThumbnail.style.cursor = "pointer";
				imgThumbnail.title = "Open image in new tab";
			});
		}

		imgThumbnail.className = "col-12 rounded-3";
		imgThumbnail.style.width = "50px";
		imgThumbnail.style.height = "50px";
		imgThumbnail.style.objectFit = "cover";

    cellTitle.innerHTML = title;
    cellTitle.classList.toggle('event-title', true);
    cellContent.innerHTML = content;
    cellContent.classList.toggle('event-content', true);
    cellAuthor.innerHTML = author;
	cellDate.innerHTML = utils.parseDateTime(timestamp);

    buttonEdit.type = 'button';
    buttonEdit.textContent = "Edit";
	buttonEdit.className = "btn btn-no-border btn-primary px-2 me-2"
    buttonEdit.onclick = function() { showEditEventModal(uid, thumbnail, title, content, timestamp, arrKeywords) };

    buttonDelete.type = 'button';
    buttonDelete.textContent = "Delete";
	buttonDelete.className = "btn btn-no-border btn-danger px-2 me-2"
    buttonDelete.onclick = function() { deleteEvent(uid, title) };

    buttonArchive.type = 'button';
    buttonArchive.textContent = "Archive";
	buttonArchive.className = "btn btn-no-border btn-light px-2"
    buttonArchive.onclick = function() { archiveEvent(uid, title) };

    rowId.appendChild(cellDate);
    rowId.appendChild(cellThumbnail);
    	cellThumbnail.appendChild(imgThumbnail);
    rowId.appendChild(cellTitle);
    rowId.appendChild(cellContent);
    rowId.appendChild(cellAuthor);
    rowId.appendChild(cellAction);
    cellAction.appendChild(buttonEdit);
	cellAction.appendChild(buttonDelete);
	cellAction.appendChild(buttonArchive);

    tbodyEvent.prepend(rowId);
}

function editEvent(uid) {
	// update modal UI
	const myModal = new bootstrap.Modal('#modalDelete', null);
	tvDelete.textContent = "Delete \""+title+"\"?";
	myModal.show();

	// delete event if confirmed
    const refSelectedEvent = ref(db, "events/"+uid);
	btnDelete.onclick = function() {
		remove(refSelectedEvent);
	}
}

function deleteEvent(uid, title) {
	// update modal UI
	const myModal = new bootstrap.Modal('#modalDelete', null);
	tvDelete.textContent = "Delete \""+title+"\"?";
	myModal.show();

	// delete event if confirmed
    const refSelectedEvent = ref(db, "events/"+uid);
	btnDelete.onclick = function() {
		remove(refSelectedEvent);
	}
}

function archiveEvent(uid, title) {
	// update modal UI
	const myModal = new bootstrap.Modal('#modalDelete', null);
	tvDelete.textContent = "Archive \""+title+"\"?";
	btnDelete.textContent = "Archive";
	const modalDeleteTitle = document.querySelector("#modalDeleteTitle");
	modalDeleteTitle.textContent = "Archive Event";
	myModal.show();

	// delete events if confirmed
    const refSelectedEvent = ref(db, "events/"+uid);
	btnDelete.onclick = function() {
		update(refSelectedEvent, {
			isArchived: true
		});
	}
}

function renderArchives() {
	// update modal UI
	const myModal = new bootstrap.Modal('#modalArchive', null);
	myModal.show();

	getArchivesData();
}

function getArchivesData() {
	const refEvents = query(ref(db, "events"), orderByChild("isArchived"), equalTo(true));

	// show clearance table (or div) and hide all other tables (or divs)
    onValue(refEvents, (snapAllEvents) => {
        // clear
        tbodyArchive.innerHTML = '';
        // listen for request changes
        snapAllEvents.forEach(snapRequest => {
            // get each request and their corresponding user:
            renderArchiveTable(
				snapRequest.val().uid,
				snapRequest.val().thumbnail,
				snapRequest.val().title,
				snapRequest.val().content,
				snapRequest.val().author,
				snapRequest.val().timestamp
			);
        });
    });
}

function renderArchiveTable(uid, thumbnail, title, content, author, timestamp) {
    const rowId = document.createElement('tr');
    const cellDate = document.createElement('td');
    const cellThumbnail = document.createElement('td');
    const imgThumbnail = document.createElement('img');
    const cellTitle = document.createElement('td');
    const cellContent = document.createElement('td');
    const cellAuthor = document.createElement('td');
    const cellAction = document.createElement('td');
    const buttonUnarchive = document.createElement('button');

		if (thumbnail == null) {
			imgThumbnail.src = "https://via.placeholder.com/150?text=Image";
		}
		else {
			getDownloadURL(sRef(storage, 'news/'+thumbnail)).then((url) => {
				imgThumbnail.src = url;
				imgThumbnail.onclick = function() {
					window.open(url);
				}
				imgThumbnail.style.cursor = "pointer";
				imgThumbnail.title = "Open image in new tab";
			});
		}
	
		imgThumbnail.className = "col-12 rounded-3";
		imgThumbnail.style.width = "50px";
		imgThumbnail.style.height = "50px";
		imgThumbnail.style.objectFit = "cover";

    cellTitle.innerHTML = title;
    cellTitle.classList.toggle('events-title', true);
    cellContent.innerHTML = content;
    cellContent.classList.toggle('events-content', true);
    cellAuthor.innerHTML = author;
	cellDate.innerHTML = utils.parseDateTime(timestamp);

    buttonUnarchive.type = 'button';
    buttonUnarchive.textContent = "Unarchive";
	buttonUnarchive.className = "btn btn-no-border btn-danger px-2 me-2"
    buttonUnarchive.onclick = function() { unarchive(uid, title) };

    rowId.appendChild(cellDate);
    rowId.appendChild(cellThumbnail);
    	cellThumbnail.appendChild(imgThumbnail);
    rowId.appendChild(cellTitle);
    rowId.appendChild(cellContent);
    rowId.appendChild(cellAuthor);
    rowId.appendChild(cellAction);
	cellAction.appendChild(buttonUnarchive);

    tbodyArchive.prepend(rowId);
}

function unarchive(uid, title) {
    const modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#modalArchive')); 
    modal.hide();

	// update modal UI
	const myModal = new bootstrap.Modal('#modalDelete', null);
	tvDelete.textContent = "Unarchive \""+title+"\"?";
	btnDelete.textContent = "Unarchive";
	const modalDeleteTitle = document.querySelector("#modalDeleteTitle");
	modalDeleteTitle.textContent = "Unarchive event";
	myModal.show();

	// delete events if confirmed
    const refSelectedEvent = ref(db, "events/"+uid);
	btnDelete.onclick = function() {
		update(refSelectedEvent, {
			isArchived: false
		});
	}
}