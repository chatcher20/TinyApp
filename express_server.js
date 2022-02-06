// Constants, middleware
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
// const cookieParser = require('cookie-parser')
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');

const { getUserByEmail, urlsForUser, getOwnerLinks, generateRandomString, checkURL, getUserID, checkCookie } = require('./helpers.js');

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
// app.use(cookieParser());
app.use(cookieSession({
  name: "session",
  keys: ["key1", "key2"],
}));



// Global Variables:

// Global object called users which will be used to store and access the users in the app
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  }
};

let urlDatabase = {
  "abcdef": {
    longURL: "http://www.google.com",
    userID: "userRandomID"
  }
};


// GET Routes

app.get("/", (req, res) => {
  const userID = req.session.userID;
  if (userID) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});


app.get('/urls/new', (req, res) => {
  const userID = req.session.userID;
  console.log("userID is: ", userID);
  if (checkCookie(userID)) {
    const userInfo = users[userID];
    const templateVars = {
      user: userInfo,
    };
    return res.render('urls_new', templateVars);
  }
  res.status(401);     // send("Must log in to create URL.");
  res.statusMessage = "Must log in to create URL.";
  return res.redirect("/login");

});


app.get("/urls/:shortURL", (req, res) => {
  const userID = getUserID(req.session.userID);

  if (!userID) {
    return res.redirect("/login");  // if cookie isn't registered for user
  }

  const shortURL = req.params.shortURL;
  console.log("shortURL is: ", shortURL);
  const longURL = urlDatabase[shortURL].longURL;
  const userInfo = users[userID];

  let userDB = urlsForUser(userID, urlDatabase);
  if (!userDB[shortURL]) {
    return res.redirect('/error');  // if use doens't have proper access
  }



  const templateVars = {
    userInfo,
    shortURL,
    longURL
  };
  return res.render("urls_show", templateVars);

});


// /urls Route Handler.
app.get("/urls", (req, res) => {
  const userID = req.session.userID;
  if (!userID) {
    return res.redirect("/login");
  }
  console.log("userID is: ", userID);
  console.log(urlDatabase);
  const templateVars = {
    urls: getOwnerLinks(userID),
    user: users[userID]
  };
  return res.render("urls_index", templateVars); //passing templateVars object into urls_index

});


app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.redirect('/error');
  }

  const userID = req.session.userID;
  let sessionID = userID;
  
  if (!userID) {
    sessionID = generateRandomString();     // create userID if it doesn't exist
    req.session.visitorID = sessionID;
  }

  let longURL = urlDatabase[shortURL]["longURL"];
  return res.redirect(longURL);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get('/login', (req, res) => {
  const userID = req.session.userID;
  if (checkCookie(userID)) {
    return res.redirect("/urls");
  }

  const userObject = users[userID];
  const templateVars = {
    user: userObject,
  };
  return res.render("urls_login", templateVars);
});


// GET /register endpoint, which returns a registration page templae
app.get("/register", (req, res) => {
  const userID = req.session.userID;
  console.log("userID is: ", userID);
  // if (!userID) {
  //   return res.redirect("/register");
  // }
  if (userID) {
    res.redirect("/urls");
  }
  
  const userObject = users[userID];
 
  const templateVars = {
    user: userObject
    // userObject,
    // user_id: req.cookies.user_id,
    // urls: urlDatabase,
  };
  res.render("urls_register", templateVars);   //passing templateVars object into urls_register
});


app.get("_header", function(req, res) {
  console.log("header user object: " + users);
  const templateVars = {
    users: users,
    user_id: req.cookies.user_id
  };
  res.render("_header.ejs", templateVars);  //passing templateVars object into header
});


// END of GET Routes




// POST Routes

app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.userID;  //check credentials
  if (!userID) {
    return res.redirect('/login');
  }

  const shortURL = req.params.shortURL;
  const userDB = urlsForUser(userID);
  if (!userDB[shortURL]) {
    return res.redirect("/urls");
  }
  delete urlDatabase[shortURL];
  return res.redirect("/urls");

});


app.post("/urls", (req, res) => {
  
  const userID = getUserID(req.session.userID);
  const randomString = generateRandomString(6);

  if (userID) {
    const date = (new Date()).toLocaleDateString('en-US');
    
    urlDatabase[randomString] = {
      date,
      longURL: req.body.longURL,
      userID: userID
    };
    return res.redirect("/urls");
  } else {
    res.status(401).send("401: Bad Request: You cannot create a URL if not logged-in.");
  }
});


app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let userID = getUserByEmail(email); //id or null. ull is falsey

  if (userID) {
    console.log(userID);
    console.log(password);
    const testPassword = bcrypt.compareSync(password, users[userID].password);
    console.log(users[userID].password);
    console.log(testPassword);
    // if (bcrypt.compareSync(password, users[userID].password)) {
    if (password === users[userID].password) {
      console.log("Before: ", req.session.userID);
      req.session.userID = userID;
      console.log("After: ", req.session.userID);
      return res.redirect("/urls");
    } else {
      return res.status(401).send("401: Bad Request: Incorrect password.");
    }
  } else {
    return res.status(401).send("401: Bad Request: You cannot create login since you are not registered yet.");
  }
});


app.post("/logout", (req, res) => {
  req.session = null;
  return res.redirect("/login");
});


// Create a POST /register endpoint that handles the registration form data. This endpoint should add a new user object to the global users object. The user object should include the user's id, email and password, similar to the example above. To generate a random user ID, use the same function you use to generate random IDs for URLs.
app.post("/register", (req, res) => {

  // If the e-mail or password are empty strings, send back a response with the 400 status code.
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("400: Bad Request: This field must not be empty.");
    res.redirect("/register");
  }

  // If someone tries to register with an email that is already in the users object, send back a response with the 400 status code
  if (getUserByEmail(req.body.email)) {
    res.status(400);
    return res.end("400: Bad Request: This email has already been registered.");
  }

  let newUserID = generateRandomString(6);
  console.log("the newUserID is: ", newUserID);
  users[newUserID] = {
    id: newUserID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
  };
  const defaultURLS = {
    "defaultShortURL": {
      "userID": newUserID,
      "longURL": "www.google.com"
    }
  };

  const urlDatabaseCopy = {...urlDatabase, ...defaultURLS};   // "spread" syntax
  console.log("what is urlDatabaseCoy? ", urlDatabaseCopy);
  urlDatabase = urlDatabaseCopy;
  req.session.userID = newUserID;
  return res.redirect("/urls");     // Redirect the user to the /urls page.

});


app.post("/urls/:shortURL", (req, res) => {
  
  const shortURL = req.params.shortURL;

  if (urlDatabase[shortURL].userID === req.session.userID) {
    let newURL = checkURL(req.body.newURL);
    urlDatabase[shortURL].longURL = newURL;
    return res.redirect("/urls");
  }

  return res.status(401).send("401: Bad Request: You don't have permission to edit this URL.");

});


// End of POST routes




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});