import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js';
import { doc, collection, collectionGroup, addDoc, setDoc, getDoc, getDocs, deleteDoc, updateDoc, increment, query, where, orderBy, startAt, endAt, onSnapshot, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';
import { ref as sRef, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-storage.js";
import { db, auth, storage } from '../js/firebase.js';
import { btnLogout, tbodyAnnouncement, modalAnnouncement, tvAddAnnouncement, etAnnouncementTitle, etAnnouncementDetails, btnSaveAnnouncement, tvDelete, modalDelete, btnDelete } from '../js/ui.js';
import * as utils from '../js/utils.js';

const etKeywords = document.querySelector('#etKeywords');
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
	btnUploadImageLabel.innerHTML = "Change Image";
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
	getAnnouncementData();
	//loadSavedPendingAnnouncementCount();
	//getNewPendingRequestCounts();
});

window.showEditAnnouncementModal = showEditAnnouncementModal;
function showEditAnnouncementModal(announcementUid, thumbnail, announcementTitle, announcementContent, arrKeywords) { // changes modal contents
	selectedImage = null;

	if (thumbnail == null) {
		imgHolder.src = "https://via.placeholder.com/300x250?text=Cover+Photo";
	}
	else {
		getDownloadURL(sRef(storage, 'announcement/'+thumbnail)).then((url) => {
			imgHolder.src = url;
		});
	}
	// null announcementUid => new announcement
	if (announcementUid == null) {
		etAnnouncementTitle.value = "";
		etAnnouncementDetails.value = "";
		etKeywords.value = "";

		tvAddAnnouncement.textContent = "Add Announcement";
		btnSaveAnnouncement.textContent = "Publish Announcement";
	}
	else {
		// update modal UI
		const myModal = new bootstrap.Modal('#modalAnnouncement', null);
		tvAddAnnouncement.textContent = "Edit Announcement";
		btnSaveAnnouncement.textContent = "Save Changes";
		myModal.show();

		etAnnouncementTitle.value = announcementTitle;
		etAnnouncementDetails.value = announcementContent;
		etKeywords.value = arrKeywords;
	}

	btnSaveAnnouncement.onclick = function() {
		saveAnnouncement(announcementUid);
	}
}

function saveAnnouncement(announcementUid) { // updates firebase data
	const keywords = etKeywords.value.toUpperCase().split(",").map(function(item) {
		return item.trim();
	});

	if (etAnnouncementTitle.value == "" || etAnnouncementDetails.value == "") {
		return;
	}

	const NEWS_HAS_THUMBNAIL = (selectedImage != null);
	let thumbnail_file_name = null;

	if (NEWS_HAS_THUMBNAIL) {
		thumbnail_file_name = Date.now();

		uploadBytes(sRef(storage, "announcement/"+thumbnail_file_name), selectedImage).then(() => {
			uploadAnnouncementData(announcementUid, thumbnail_file_name, keywords);
		});
	}
	else {
		uploadAnnouncementData(announcementUid, thumbnail_file_name, keywords);
	}
}

function uploadAnnouncementData(announcementUid, thumbnail_file_name, keywords) {
	const NEW_ANNOUNCEMENT = (announcementUid == null);

	if (NEW_ANNOUNCEMENT) {
		// add new announcement
		const newAnnouncementId = doc(collection(db, "announcements")).id;
		const refAnnouncement = doc(db, "announcements", newAnnouncementId);

		const announcementData = {
			uid: newAnnouncementId,
			thumbnail: thumbnail_file_name,
			title: etAnnouncementTitle.value,
			content: etAnnouncementDetails.value,
			author: "Barangay360",
			isArchived: false,
			timestamp: Date.now(),
			arrKeywords: keywords
		}

		setDoc((refAnnouncement), announcementData);
	}
	else {
		// edit announcement
		const refAnnouncement = doc(db, "announcements", announcementUid);
		let announcementData = {};

		const THUMBNAIL_WAS_UPDATED = (thumbnail_file_name != null);
		if (THUMBNAIL_WAS_UPDATED) {
			announcementData = {
				title: etAnnouncementTitle.value,
				thumbnail: thumbnail_file_name,
				content: etAnnouncementDetails.value,
				arrKeywords: keywords
			}
		}
		else {
			announcementData = {
				title: etAnnouncementTitle.value,
				content: etAnnouncementDetails.value,
				arrKeywords: keywords
			}
		}

		updateDoc((refAnnouncement), announcementData);
	}

	etAnnouncementTitle.value = "";
	etAnnouncementDetails.value = "";
}

function getAnnouncementData() {
	// const refAnnouncements = query(ref(db, "announcements"), orderByChild("isArchived"), equalTo(false));
	const refAnnouncements = collection(db, "announcements");
	const qryAnnouncements = query(refAnnouncements, where("isArchived", "==", false)) 

	// show clearance table (or div) and hide all other tables (or divs)
  onSnapshot(qryAnnouncements, (snapRequests) => {
		// clear table
		tbodyAnnouncement.innerHTML = '';

		snapRequests.forEach(request => {
      renderTable(
				request.id,
				request.data().thumbnail,
				request.data().title,
				request.data().content,
				request.data().author,
				request.data().timestamp,
				request.data().arrKeywords
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
	  getDownloadURL(sRef(storage, 'announcement/'+thumbnail)).then((url) => {
		  imgThumbnail.src = url;
		  imgThumbnail.style.cursor = "pointer";
		  imgThumbnail.onclick = function() {
			  viewImage(url);
		  }
	  });
  }

	imgThumbnail.className = "col-12 rounded-3";
	imgThumbnail.style.width = "50px";
	imgThumbnail.style.height = "50px";
	imgThumbnail.style.objectFit = "cover";

  cellTitle.innerHTML = title;
  cellTitle.classList.toggle('announcement-title', true);
  cellContent.innerHTML = content;
  cellContent.classList.toggle('announcement-content', true);
  cellAuthor.innerHTML = author;
	cellDate.innerHTML = utils.parseDateTime(thumbnail);

  buttonEdit.type = 'button';
  buttonEdit.textContent = "Edit";
	buttonEdit.className = "btn btn-no-border btn-primary px-3 me-2";
  buttonEdit.onclick = function() { showEditAnnouncementModal(uid, thumbnail, title, content, arrKeywords) };

  buttonDelete.type = 'button';
  buttonDelete.textContent = "Delete";
	buttonDelete.className = "btn btn-no-border btn-danger px-3 me-2";
  buttonDelete.onclick = function() { deleteAnnouncement(uid, title) };

  buttonArchive.type = 'button';
  buttonArchive.textContent = "Archive";
	buttonArchive.className = "btn btn-no-border btn-light px-3";
  buttonArchive.onclick = function() { archiveAnnouncement(uid, title) };

  rowId.appendChild(cellThumbnail);
  	cellThumbnail.appendChild(imgThumbnail);
	rowId.appendChild(cellTitle);
	rowId.appendChild(cellContent);
	rowId.appendChild(cellDate);
  //rowId.appendChild(cellAuthor);
  rowId.appendChild(cellAction);
		cellAction.appendChild(buttonEdit);
		// cellAction.appendChild(buttonDelete);
		cellAction.appendChild(buttonArchive);

  tbodyAnnouncement.prepend(rowId);
}

function editAnnouncement(uid) {
	// update modal UI
	const myModal = new bootstrap.Modal('#modalDelete', null);
	tvDelete.textContent = "Delete \""+title+"\"?";
	myModal.show();

	// delete announcement if confirmed
    const refSelectedAnnouncement = ref(db, "announcements/"+uid);
	btnDelete.onclick = function() {
		remove(refSelectedAnnouncement);
	}
}

function deleteAnnouncement(uid, title) {
	// update modal UI
	const myModal = new bootstrap.Modal('#modalDelete', null);
	tvDelete.textContent = "Delete \""+title+"\"?";
	myModal.show();

	// delete announcement if confirmed
	const refSelectedAnnouncement = doc(db, "announcements", uid);
	btnDelete.onclick = function() {
		deleteDoc(refSelectedAnnouncement);
	}
}

function archiveAnnouncement(uid, title) {
	// update modal UI
	const myModal = new bootstrap.Modal('#modalDelete', null);
	tvDelete.textContent = "Archive \""+title+"\"?";
	btnDelete.textContent = "Archive";
	const modalDeleteTitle = document.querySelector("#modalDeleteTitle");
	modalDeleteTitle.textContent = "Archive Announcement";
	myModal.show();

	// delete announcement if confirmed
    const refSelectedAnnouncement = doc(db, "announcements", uid);
	btnDelete.onclick = function() {
		updateDoc(refSelectedAnnouncement, {
			isArchived: true
		});
	}
}

function renderArchives() {
	// update modal UI
	// const myModal = new bootstrap.Modal('#modalArchive', null);
	// myModal.show();

	getArchivesData();
}

function getArchivesData() {
	const refAnnouncement = query(collection(db, "announcements"), where("isArchived", "==", true));

	// show clearance table (or div) and hide all other tables (or divs)
    onSnapshot(refAnnouncement, (snapAllAnnouncement) => {
        // clear
        tbodyArchive.innerHTML = '';
        // listen for request changes
        snapAllAnnouncement.forEach(snapRequest => {
            // get each request and their corresponding user:
            renderArchiveTable(
				snapRequest.data().uid,
				snapRequest.data().thumbnail,
				snapRequest.data().title,
				snapRequest.data().content,
				snapRequest.data().author,
				snapRequest.data().timestamp
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
			getDownloadURL(sRef(storage, 'announcement/'+thumbnail)).then((url) => {
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
    cellTitle.classList.toggle('announcement-title', true);
    cellContent.innerHTML = content;
    cellContent.classList.toggle('announcement-content', true);
    cellAuthor.innerHTML = author;
	cellAuthor.className = "d-none";
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
	const modalDelete = new bootstrap.Modal('#modalDelete', null);
	tvDelete.textContent = "Unarchive \""+title+"\"?";
	btnDelete.textContent = "Unarchive";
	const modalDeleteTitle = document.querySelector("#modalDeleteTitle");
	modalDeleteTitle.textContent = "Unarchive announcement";
	modalDelete.show();

	// delete announcement if confirmed
    const refSelectedAnnouncement = doc(db, "announcements", uid);
	btnDelete.onclick = function() {
		updateDoc(refSelectedAnnouncement, {
			isArchived: false
		});
	}
}

function viewImage(url) {
	imgId.src = url;

	utils.showModal('#modalViewImage');
}