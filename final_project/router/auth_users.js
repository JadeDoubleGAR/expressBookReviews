const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
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

const authenticatedUser = (username, password) => {
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      { username: username },   // better than storing password
      'access',
      { expiresIn: 60 * 60 }
    );

    req.session.authorization = {
      accessToken,
      username
    };

    return res.status(200).json({ message: "User successfully logged in" });
  } else {
    return res.status(401).json({ message: "Invalid login credentials" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;

    // username dalla sessione
    const username = req.session.authorization?.username;

    // controllo input
    if (!review) {
        return res.status(400).json({ message: "Review is required" });
    }

    // controllo libro
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // inizializza reviews se non esiste
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }


    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: "Review added/updated successfully",
        reviews: books[isbn].reviews
    });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    // username dalla sessione
    const username = req.session.authorization?.username;

    // controllo login
    if (!username) {
        return res.status(403).json({ message: "User not logged in" });
    }

    // controllo libro
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // controllo se esistono reviews
    if (!books[isbn].reviews) {
        return res.status(404).json({ message: "No reviews found" });
    }

    // controllo se l'utente ha una review
    if (!books[isbn].reviews[username]) {
        return res.status(404).json({ message: "Review not found for this user" });
    }

    // 🔥 DELETE della review dell'utente loggato
    delete books[isbn].reviews[username];

    return res.status(200).json({
        message: "Review deleted successfully",
        reviews: books[isbn].reviews
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;