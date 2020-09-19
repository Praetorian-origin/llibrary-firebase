let firebaseConfig = {
  apiKey: "AIzaSyC_QEEdtFwDXaVkamH-B-kVAlDTYMpmR1o",
  authDomain: "libraryjs-the-odin-project.firebaseapp.com",
  databaseURL: "https://libraryjs-the-odin-project.firebaseio.com",
  projectId: "libraryjs-the-odin-project",
  storageBucket: "libraryjs-the-odin-project.appspot.com",
  messagingSenderId: "795712688887",
  appId: "1:795712688887:web:596e95ca487913b56c79f2",
};
firebase.initializeApp(firebaseConfig);

function Book(title, author, numberOfPages, read, id) {
  this.id = id;
  this.title = title;
  this.author = author;
  this.numberOfPages = numberOfPages;
  this.read = read;
}

Book.prototype.toggleRead = function () {
  this.read = !this.read;
};

function transformSnapshotToBookObj(snap) {
  const snapshotValues = snap.val();
  const bookObj = new Book(
    snapshotValues.title,
    snapshotValues.author,
    snapshotValues.numberOfPages,
    snapshotValues.read,
    snap.key
  );
  return bookObj;
}

const dbRefObj = firebase.database().ref().child("books");
dbRefObj.on("child_added", (snap) => {
  const bookObj = transformSnapshotToBookObj(snap);
  const rowTable = generateEntryOfBookTable(bookObj, snap.key);
  tbodyBooks.appendChild(rowTable);
  setNotificationMsg("Book Loaded", "green");
});

dbRefObj.on("child_removed", (snap) => {
  const bookToRemove = document.querySelector(`[data-id='${snap.key}']`);
  bookToRemove.remove();
});

dbRefObj.on("child_changed", (snap) => {
  const rowToUpdate = document.querySelector(`[data-id='${snap.key}']`);

  if (rowToUpdate) {
    const bookObj = transformSnapshotToBookObj(snap);
    const bookLine = generateEntryOfBookTable(bookObj, snap.key);
    tbodyBooks.replaceChild(bookLine, rowToUpdate);
    setNotificationMsg("Book Updated", "green");
  }
});

function setBookData(book) {
  let dbRef;

  if (!book.id) {
    const key = dbRefObj.push().getKey();
    book.id = key;
    dbRef = firebase.database().ref("books/" + key);
  } else {
    dbRef = firebase.database().ref("books/" + book.id);
  }

  dbRef.set(
    {
      ...book,
    },
    function (error) {
      if (error) {
        console.log(error);
      }
    }
  );
}

function isValidBookObj(book) {
  if (
    book.title == "" ||
    book.author == "" ||
    book.numberOfPages == "" ||
    isNaN(book.numberOfPages) ||
    book.read === undefined
  ) {
    return false;
  }
  return true;
}

function addTdTextElementToRow(text, row) {
  const dataCell = document.createElement("td");

  if (typeof text === "string" || typeof text === "number") {
    dataCell.textContent = text;
  } else {
    dataCell.appendChild(text);
  }

  row.append(dataCell);
}

function generateEntryOfBookTable(book, key) {
  const rowTable = document.createElement("tr");
  rowTable.dataset.id = key;
  addTdTextElementToRow(book.title, rowTable);
  addTdTextElementToRow(book.author, rowTable);
  addTdTextElementToRow(book.numberOfPages, rowTable);
  const buttonRead = document.createElement("button");
  buttonRead.textContent = book.read ? "Read" : "Not read";
  buttonRead.addEventListener("click", (e) => {
    book.toggleRead();
    setBookData(book);
  });
  addTdTextElementToRow(buttonRead, rowTable);

  const buttonRemove = document.createElement("button");
  buttonRemove.textContent = "Remove";
  buttonRemove.addEventListener("click", (e) => {
    removeBook(e.target.parentNode.parentNode);
  });

  addTdTextElementToRow(buttonRemove, rowTable);
  return rowTable;
}

function removeBook(bookRow) {
  firebase
    .database()
    .ref("books/" + bookRow.dataset.id)
    .remove();
}

function processBookFormInput() {
  let title = document.getElementById("title");
  let author = document.getElementById("author");
  let numberOfPages = document.getElementById("numberOfPages");
  let read = document.getElementById("read").checked;

  const newBook = new Book(
    title.value,
    author.value,
    Number(numberOfPages.value),
    read
  );

  if (!isValidBookObj(newBook)) {
    setNotificationMsg("Invalid Form Input", "red");
    return;
  }
  setBookData(newBook);

  title.value = "";
  author.value = "";
  numberOfPages.value = "";
}

const tbodyBooks = document.querySelector("tbody");

const buttonToggleFormAddBook = document.getElementById(
  "buttonToggleFormAddBook"
);
const formAddBook = document.getElementById("formAddBook");
const buttonSaveBook = document.getElementById("submitBook");
let formDisplay = false;
formAddBook.style.display = "none";

buttonToggleFormAddBook.addEventListener("click", (e) => {
  formAddBook.style.display = formDisplay ? "none" : "inherit";
  formDisplay = !formDisplay;
});

const notificationDiv = document.getElementById("notification");
notificationDiv.style.display = "none";

buttonSaveBook.addEventListener("click", (e) => {
  e.preventDefault();
  processBookFormInput();
});

function setNotificationMsg(msg, backgroundColor) {
  notificationDiv.textContent = msg;
  notificationDiv.style.backgroundColor = backgroundColor;
  notificationDiv.style.display = "inherit";

  setTimeout(() => {
    notificationDiv.textContent = "";
    notificationDiv.style.backgroundColor = "inherit";
    notificationDiv.style.display = "none";
  }, 5000);
}
