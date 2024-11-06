const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const { access } = require('fs');
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return typeof username === 'string' && username.trim().length > 0;
};

const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  console.log("Attempting login for:", username, password);
  console.log("Current users:", users);

  if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
      return res.status(401).json({ message: "Invalid username or password" });
  }

  const accessToken = jwt.sign({ username }, "your_jwt_secret_key", { expiresIn: '1h' });
  req.session.accessToken = accessToken;
  req.session.username = username;

  return res.status(200).json({ message: "Login successful", accessToken });
});


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;  
  const username = req.session.username;  

  if (!review) {
      return res.status(400).json({ message: "Review content is null" });
  }

  const book = books[isbn];
  if (!book) {
      return res.status(404).json({ message: "Book not found!" });
  }

  if (!book.reviews) {
      book.reviews = {};  
  }
  book.reviews[username] = review;  

  return res.status(200).json({ message: "Review added/updated successfully", reviews: book.reviews });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.username; 

  const book = books[isbn];
  if (!book) {
      return res.status(404).json({ message: "Book not found" });
  }

  if (book.reviews[username]) {
      delete book.reviews[username];
      return res.status(200).json({ message: "Review deleted successfully", reviews: book.reviews });
  } else {
      return res.status(404).json({ message: "Review not found for this user" });
  }
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
