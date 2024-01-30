const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

function getBookByAuthor(authorName) {
  for (let bookId in books) {
    if (books.hasOwnProperty(bookId)) {
      const book = books[bookId];
      const formattedBookAuthor = book.author.toLowerCase().replace(/\s/g, "");
      if (formattedBookAuthor == authorName) {
        return book;
      }
    }
  }
  return null;
}

function getBookByTitle(title) {
  for (let booksId in books) {
    if (books.hasOwnProperty(booksId)) {
      const book = books[booksId];
      const formattedTitle = book.title.toLowerCase().replace(/\s/g, "");
      if (formattedTitle == title) {
        return book;
      }
    }
  }
}

public_users.post("/register", (req, res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: "User successfully registred. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  try {
    const result = await books;
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
  try {
    const isbnCode = req.params.isbn;

    if (!isbnCode) {
      return res.status(400).json({ message: "ISBN code not supplied" });
    }

    const book = await books[isbnCode];

    if (book) {
      return res.status(200).json(book);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
  try {
    const author = req.params.author;

    if (!author) {
      return res.status(400).json({ message: "Author not supplied" });
    }

    const foundBook = await getBookByAuthor(author);

    if (foundBook) {
      return res.status(200).json(foundBook);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all books based on title
public_users.get("/title/:title", async function (req, res) {
  try {
    const title = req.params.title;

    if (!title) {
      return res.status(400).json({ message: "Title not supplied" });
    }

    const foundBook = await getBookByTitle(title);

    if (foundBook) {
      return res.status(200).json(foundBook);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  //Write your code here
  let isbnCode = req.params.isbn;

  if (isbnCode) {
    return res.status(200).send(books[isbnCode].reviews);
  }
  return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;
