import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js';
import { ref, query, orderByChild, equalTo, get, set, push, update, child, remove, onValue, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.14.0/firebase-database.js';
import { db, auth } from '../js/firebase.js';
import { btnLogout, tbodyNews, modalNews, tvAddNews, etTitle, etContent, btnSaveNews, tvDelete, modalDelete, btnDelete } from '../js/ui.js';
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
	getNewsData();
	//loadSavedPendingNewsCount();
	//getNewPendingRequestCounts();
});

window.showEditNewsModal = showEditNewsModal;
function showEditNewsModal(newsUid, newsTitle, newsContent) { // changes modal contents
	// null newsUid => new news
	if (newsUid == null) {
		etTitle.value = "";
		etContent.value = "";

		tvAddNews.textContent = "Add News";
		btnSaveNews.textContent = "Publish News";
	}
	else {
		// update modal UI
		const myModal = new bootstrap.Modal('#modalNews', null);
		tvAddNews.textContent = "Edit News";
		btnSaveNews.textContent = "Save Changes";
		myModal.show();

		etTitle.value = newsTitle;
		etContent.value = newsContent;
	}

	btnSaveNews.addEventListener("click", function() {saveNews(newsUid)}, {once: true});
}

function saveNews(newsUid) { // updates firebase data
	if (etTitle.value == "" || etContent.value == "") {
		return;
	}

	if (newsUid == null) {
		// add new news
		const refNews = ref(db, "news");
		const newNewsKey = push(child(ref(db), "news")).key;

		const newsData = {
			uid: newNewsKey,
			title: etTitle.value,
			content: etContent.value,
			author: "Abante Bonawon",
			timestamp: serverTimestamp()
		}

		update(child(refNews, newNewsKey), newsData);
	}
	else {
		// edit news
		const refSelectedNews = ref(db, "news/"+newsUid);

		const newsData = {
			title: etTitle.value,
			content: etContent.value
		}

		update(refSelectedNews, newsData);
	}

	etTitle.value = "";
	etContent.value = "";
}

function getNewsData() {
	const refNews = ref(db, "news");

	// show clearance table (or div) and hide all other tables (or divs)
    onValue(refNews, (snapAllNews) => {
        // clear
        tbodyNews.innerHTML = '';
        // listen for request changes
        snapAllNews.forEach(snapRequest => {
            // get each request and their corresponding user:
            renderTable(
				snapRequest.val().uid,
				snapRequest.val().title,
				snapRequest.val().content,
				snapRequest.val().author,
				snapRequest.val().timestamp
			);
        });
    });
}

function renderTable(uid, title, content, author, timestamp) {
    const rowId = document.createElement('tr');
    const cellDate = document.createElement('td');
    const cellTitle = document.createElement('td');
    const cellContent = document.createElement('td');
    const cellAuthor = document.createElement('td');
    const cellAction = document.createElement('td');
    const buttonEdit = document.createElement('button');
    const buttonDelete = document.createElement('button');

    cellTitle.innerHTML = title;
    cellTitle.classList.toggle('news-title', true);
    cellContent.innerHTML = content;
    cellContent.classList.toggle('news-content', true);
    cellAuthor.innerHTML = author;
	cellDate.innerHTML = utils.parseDateTime(timestamp);

    buttonEdit.type = 'button';
    buttonEdit.textContent = "Edit";
    buttonEdit.classList.toggle('btn', true);
    buttonEdit.classList.toggle('btn-no-border', true);
    buttonEdit.classList.toggle('btn-primary', true);
    buttonEdit.classList.toggle('col-md-6', true);
    buttonEdit.classList.toggle('col-12', true);
    buttonEdit.onclick = function() { showEditNewsModal(uid, title, content) };

    buttonDelete.type = 'button';
    buttonDelete.textContent = "Delete";
    buttonDelete.classList.toggle('btn', true);
    buttonDelete.classList.toggle('btn-no-border', true);
	buttonDelete.classList.toggle('btn-danger', true);
    buttonDelete.classList.toggle('col-md-6', true);
    buttonDelete.classList.toggle('col-12', true);
    buttonDelete.onclick = function() { deleteNews(uid, title) };

    rowId.appendChild(cellDate);
    rowId.appendChild(cellTitle);
    rowId.appendChild(cellContent);
    rowId.appendChild(cellAuthor);
    rowId.appendChild(cellAction);
    cellAction.appendChild(buttonEdit);
	cellAction.appendChild(buttonDelete);

    tbodyNews.prepend(rowId);
}

function editNews(uid) {
	// update modal UI
	const myModal = new bootstrap.Modal('#modalDelete', null);
	tvDelete.textContent = "Delete \""+title+"\"?";
	myModal.show();

	// delete news if confirmed
    const refSelectedNews = ref(db, "news/"+uid);
	btnDelete.onclick = function() {
		remove(refSelectedNews);
	}
}

function deleteNews(uid, title) {
	// update modal UI
	const myModal = new bootstrap.Modal('#modalDelete', null);
	tvDelete.textContent = "Delete \""+title+"\"?";
	myModal.show();

	// delete news if confirmed
    const refSelectedNews = ref(db, "news/"+uid);
	btnDelete.onclick = function() {
		remove(refSelectedNews);
	}
}