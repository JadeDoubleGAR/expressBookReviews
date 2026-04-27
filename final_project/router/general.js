const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

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
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;

    try {
        const response = await axios.get('http://localhost:5000/books');

        const books = response.data;

        const book = books[isbn];

        if (book) {
            return res.status(200).json(book);
        } else {
            return res.status(404).json({ message: "Book not found" });
        }

    } catch (error) {
        return res.status(500).json({ message: "Error fetching book details" });
    }
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
  public_users.get('/', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:5000/books');
        return res.json(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books" });
    }
});

  //public_users.get('/books', (req, res) => {
    //return res.json(books);
//});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;

    try {
        const response = await axios.get('http://localhost:5000/books');

        const books = response.data;

        // filtriamo tutti i libri con quel titolo
        const result = Object.values(books).filter(
            book => book.title === title
        );

        if (result.length > 0) {
            return res.status(200).json(result);
        } else {
            return res.status(404).json({ message: "No books found for this title" });
        }

    } catch (error) {
        return res.status(500).json({ message: "Error fetching books" });
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