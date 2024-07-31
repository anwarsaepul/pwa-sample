let db;
const request = indexedDB.open("notesDB", 1);

request.onupgradeneeded = function(e) {
    let db = e.target.result;
    db.createObjectStore("notes", { keyPath: "id", autoIncrement: true });
};

request.onsuccess = function(e) {
    db = e.target.result;
    fetchNotes();
};

request.onerror = function(e) {
    console.log("Error opening DB", e);
};

document.getElementById('add-note').addEventListener('click', addNote);

function addNote() {
    const title = document.getElementById('note-title').value;
    const body = document.getElementById('note-body').value;

    if (title === '' || body === '') return;

    const transaction = db.transaction(["notes"], "readwrite");
    const store = transaction.objectStore("notes");

    const note = { title, body };

    store.add(note);
    transaction.oncomplete = function() {
        fetchNotes();
    };

    transaction.onerror = function() {
        console.log("Error adding note");
    };
}

function fetchNotes() {
    const transaction = db.transaction(["notes"], "readonly");
    const store = transaction.objectStore("notes");

    const request = store.getAll();

    request.onsuccess = function(e) {
        const notes = e.target.result;
        displayNotes(notes);
    };
}

function displayNotes(notes) {
    const notesList = document.getElementById('notes');
    notesList.innerHTML = '';

    notes.forEach(note => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${note.title}</span>
            <span>
                <button onclick="editNote(${note.id})">Edit</button>
                <button onclick="deleteNote(${note.id})">Delete</button>
            </span>
        `;
        notesList.appendChild(li);
    });
}

function deleteNote(id) {
    const transaction = db.transaction(["notes"], "readwrite");
    const store = transaction.objectStore("notes");
    store.delete(id);

    transaction.oncomplete = function() {
        fetchNotes();
    };
}

function editNote(id) {
    const transaction = db.transaction(["notes"], "readonly");
    const store = transaction.objectStore("notes");
    const request = store.get(id);

    request.onsuccess = function(e) {
        const note = e.target.result;
        document.getElementById('note-title').value = note.title;
        document.getElementById('note-body').value = note.body;

        document.getElementById('add-note').innerText = 'Update Note';
        document.getElementById('add-note').onclick = function() {
            updateNote(id);
        };
    };
}

function updateNote(id) {
    const title = document.getElementById('note-title').value;
    const body = document.getElementById('note-body').value;

    const transaction = db.transaction(["notes"], "readwrite");
    const store = transaction.objectStore("notes");

    const note = { id, title, body };

    store.put(note);
    transaction.oncomplete = function() {
        fetchNotes();
        document.getElementById('add-note').innerText = 'Add Note';
        document.getElementById('add-note').onclick = addNote;
        document.getElementById('note-title').value = '';
        document.getElementById('note-body').value = '';
    };

    transaction.onerror = function() {
        console.log("Error updating note");
    };
}

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}
