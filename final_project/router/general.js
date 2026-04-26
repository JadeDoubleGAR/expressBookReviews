const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Check if a user with the given username already exists
const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // 1. controllo input
    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    // 2. controllo esistenza
    const exists = users.some(user => user.username === username);

    if (exists) {
        return res.status(409).json({
            message: "User already exists!"
        });
    }

    // 3. aggiunta utente
    users.push({ username, password });

    return res.status(201).json({
        message: "User successfully registered. Now you can login"
    });
});
// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
    res.send(books[isbn]);

 });
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const bookKeys = Object.keys(books);
    let result = [];
    bookKeys.forEach(key => {
      if (books[key].author === author) {
        result.push(books[key]);
      }
    });
  if (result.length > 0) {
      return res.json(result);
    } else {
      return res.status(404).json({ message: "No books found for this author" });
    }
  });

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title;
    const bookKeys = Object.keys(books);
    let result = [];
    bookKeys.forEach(key => {
      if (books[key].title === title) {
        result.push(books[key]);
      }
    });
  if (result.length > 0) {
      return res.json(result);
    } else {
      return res.status(404).json({ message: "No books found for this title" });
    }
  });

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.json(book.reviews);
  });

module.exports.general = public_users;