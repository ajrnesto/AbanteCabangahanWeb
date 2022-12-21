import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js';
import { ref, query, orderByChild, equalTo, get, set, push, update, child, remove, onValue, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.14.0/firebase-database.js';
import { db, auth } from '../js/firebase.js';
import { btnLogout, tbodyNews, modalNews, tvAddNews, etTitle, etContent, btnSaveNews } from '../js/ui.js';
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

window.loadEditNewsModal = loadEditNewsModal;
function loadEditNewsModal(newsUid) { // changes modal contents
	// null newsUid => new news
	if (newsUid == null) {
		tvAddNews.textContent = "Add News";
		btnSaveNews.textContent = "Publish News";
	}
	else {
		tvAddNews.textContent = "Edit News";
		btnSaveNews.textContent = "Save Changes";
	}

	btnSaveNews.addEventListener("click", function() {saveModalNews(newsUid)}, {once: true});
}

function saveModalNews(newsUid) { // updates firebase data
	if (newsUid == null) {
		// add new news
		const refNews = ref(db, "news");
		const newNewsKey = push(child(ref(db), "news")).key;

		const newsData = {
			uid: newNewsKey,
			title: etTitle.value,
			content: etContent.value,
			author: "Abante Bonawon",
			timestamp: 0
		}

		update(child(refNews, newNewsKey), newsData);
	}
	else if (newsUid == 1) {
		// edit news
		const refNewNews = ref(db, "news/"+newsUid);

		set(refContainers, parseInt(etPrice.value));
	}

	etTitle.value = "";
	etContent.value = "";
}

function getNewsData() {
	const refId = ref(db, "news");

	// show clearance table (or div) and hide all other tables (or divs)
    onValue(refId, (snapAllNews) => {
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
    cellContent.innerHTML = content;
    cellAuthor.innerHTML = author;
	cellDate.innerHTML = utils.parseDate(timestamp);

    buttonEdit.type = 'button';
    buttonEdit.textContent = "Edit";
    buttonEdit.classList.toggle('btn', true);
    buttonEdit.classList.toggle('btn-no-border', true);
    buttonEdit.classList.toggle('btn-primary', true);
    buttonEdit.classList.toggle('col-12', true);
    buttonEdit.onclick = function() { editNews(uid) };

    buttonDelete.type = 'button';
    buttonDelete.textContent = "Edit";
    buttonDelete.classList.toggle('btn', true);
    buttonDelete.classList.toggle('btn-no-border', true);
	buttonDelete.classList.toggle('btn-danger', true);
    buttonDelete.classList.toggle('col-12', true);
    buttonDelete.onclick = function() { deleteNews(uid) };

    rowId.appendChild(cellDate);
    rowId.appendChild(cellTitle);
    rowId.appendChild(cellContent);
    rowId.appendChild(cellAuthor);
    rowId.appendChild(cellAction);
    cellAction.appendChild(buttonEdit).appendChild(buttonDelete);

    tbodyNews.appendChild(rowId);
}

function editNews(newsUid) {
    // reference news
    const refNews = ref(db, "news");
}

function deleteNews(newsUid) {
    // reference news
    const refNews = ref(db, "news");
}