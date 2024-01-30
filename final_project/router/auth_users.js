const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
  let usersWithSameName = users.filter((user) => {
    return user.username == username;
  });

  if (usersWithSameName.length > 0) {
    return true;
  } else {
    return false;
  }
};

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
  let validUsers = users.filter((user) => {
    return user.username === username && user.password === password;
  });

  if (validUsers.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "You must enter a username and password" });
  }

  let userIsAuthenticated = authenticatedUser(username, password);

  if (userIsAuthenticated) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );

    req.session.authorization = {
      accessToken,
      username,
    };

    return res.status(200).send("User successfully logged in!");
  }
  return res
    .status(208)
    .json({ message: "Invalid Login. Check username and password" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  let isbnCode = req.params.isbn;
  const reviewText = req.body.review;

  if (isbnCode) {
    const foundBook = books[isbnCode];

    if (foundBook) {
      const reviewId = req.session.authorization.username;

      foundBook.reviews[reviewId] = {
        text: reviewText,
      };

      return res.status(200).json("Review added successfully");
    } else {
      return res.status(404).json({ message: "Book to review not found" });
    }
  }
  return res.status(400).json({ message: "Error processing request" });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  //Write your code here
  let isbnCode = req.params.isbn;

  let currentUser = req.session.authorization.username;

  if (isbnCode) {
    const foundBook = books[isbnCode];

    if (foundBook) {
      if (foundBook.reviews[currentUser]) {
        delete foundBook.reviews[currentUser];
        return res.send("Review deleted successfully");
      } else {
        return res.status(403).json({ message: "User unauthorized" });
      }
    } else {
      return res.status(404).json({ message: "Book to review not found" });
    }
  }
  return res.status(400).json({ message: "Error processing request" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
