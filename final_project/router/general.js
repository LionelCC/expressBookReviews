const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
  }

  if (users.some(user => user.username === username)) {
      return res.status(400).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  console.log(users); // Verify the structure of `users`

  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  res.send(JSON.stringify(books, null, 2));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book){
    res.send(JSON.stringify(book, null, 2));
  } else {
    res.status(404).send("book not found")
  }
 });
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const booksByAuthor = Object.values(books).filter(book => book.author === author);

  if (booksByAuthor.length > 0) {
      res.send(JSON.stringify(booksByAuthor, null, 2));
  } else {
      res.status(404).send("No books found by this author");
  }
});


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();  // Get the title from request parameters
  const booksByTitle = Object.values(books).filter(book => book.title.toLowerCase() === title);

  if (booksByTitle.length > 0) {
      res.send(JSON.stringify(booksByTitle, null, 2));
  } else {
      res.status(404).send("No books found with this title");
  }
});


//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;   
  const book = books[isbn];      

  if (book && book.reviews) {
      res.send(JSON.stringify(book.reviews, null, 2));   
  } else {
      res.status(404).send("Reviews not found for this ISBN");
  }
});




public_users.get('/async/books', async (req, res) => {
  try {
      const response = await axios.get('http://localhost:3000/');
      res.send(response.data);
  } catch (error) {
      res.status(500).json({ message: "Error fetching book list" });
  }
});

public_users.get('/async/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
      const response = await axios.get(`http://localhost:3000/isbn/${isbn}`);
      res.send(response.data);
  } catch (error) {
      res.status(404).json({ message: "Book not found" });
  }
});

public_users.get('/async/author/:author', async (req, res) => {
  const author = req.params.author;
  try {
      const response = await axios.get(`http://localhost:3000/author/${author}`);
      res.send(response.data);
  } catch (error) {
      res.status(404).json({ message: "No books found by this author" });
  }
});

public_users.get('/async/title/:title', async (req, res) => {
  const title = req.params.title;
  try {
      const response = await axios.get(`http://localhost:3000/title/${title}`);
      res.send(response.data);
  } catch (error) {
      res.status(404).json({ message: "No books found with this title" });
  }
});





module.exports.general = public_users;


