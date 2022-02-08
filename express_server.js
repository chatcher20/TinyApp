// Constants, middleware
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');

const { users, urlDatabase, getUserByEmail, urlsForUser, getOwnerLinks, generateRandomString, checkURL, getUserID, checkCookie } = require('./helpers.js');

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
// app.use(cookieParser());
app.use(cookieSession({
  name: "session",
  keys: ["key1", "key2"],
}));




app.get("/", (req, res) => {
  const userID = req.session.userID;
  if (userID) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
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
  // console.log("userID is: ", userID);
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
  // console.log("header user object: " + users);
  const templateVars = {
    users: users,
    user_id: req.cookies.user_id
  };
  res.render("_header.ejs", templateVars);  //passing templateVars object into header
});



// /urls Route Handler.
app.get("/urls", (req, res) => {
  const userID = req.session.userID;
  const userURLs = urlsForUser(userID, urlDatabase);
  if (!userID) {
    return res.redirect("/login");
  }
  // console.log("userID is: ", userID);
  // console.log(urlDatabase);
  const templateVars = {

    urls: userURLs,
    user: users[userID]
  };
  console.log(templateVars);
  return res.render("urls_index", templateVars); //passing templateVars object into urls_index

});

app.post("/urls", (req, res) => {
  console.log("checking");
  const userID = req.session.userID;
  const shortURL = generateRandomString(6);
  console.log(userID);
  if (userID) {
    const date = (new Date()).toLocaleDateString('en-US');
    
    urlDatabase[shortURL] = {
      // date,
      longURL: req.body.longURL,
      userID: userID
    };
    console.log(urlDatabase);
    res.redirect("/urls");
  } else {
    res.status(401).send("401: Bad Request: You cannot create a URL if not logged-in.");
  }
});

app.get('/urls/new', (req, res) => {
  // const userID = req.session.userID;
  // const userInfo = users[userID];     // moved up from line 152
  
  if (req.session.userID) {
    
    const templateVars = {
      user: users[req.session.userID],
    };
    return res.render('urls_new', templateVars);
  } else {
    // console.log("if checkCookie returned true, userInfo = ", userInfo)
    // res.status(401);     // send("Must log in to create URL.");
    // res.statusMessage = "Must log in to create URL.";
    return res.redirect("/login");

  }


});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.userID;

  if (!userID) {
    return res.redirect("/login");  // if cookie isn't registered for user
  }

  const shortURL = req.params.shortURL;
  // console.log("shortURL is: ", shortURL);
  const longURL = urlDatabase[shortURL].longURL;
  const user = users[userID];

  let userDB = urlsForUser(userID, urlDatabase);
  if (!userDB[shortURL]) {
    return res.redirect('/error');  // if use doens't have proper access
  }



  const templateVars = {
    user,
    shortURL,
    longURL
  };
  return res.render("urls_show", templateVars);

});

app.post("/urls/:shortURL", (req, res) => {
  
  const shortURL = req.params.shortURL;

  if (urlDatabase[shortURL].userID === req.session.userID) {
    let longURL = req.body.longURL;
    urlDatabase[shortURL].longURL = longURL;
    return res.redirect("/urls");
  }

  return res.status(401).send("401: Bad Request: You don't have permission to edit this URL.");

});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.userID;  //check credentials
  if (!userID) {
    return res.redirect('/login');
  }

  const shortURL = req.params.shortURL;
  const userDB = urlsForUser(userID, urlDatabase);
  if (!userDB[shortURL]) {
    return res.redirect("/urls");
  }
  delete urlDatabase[shortURL];
  return res.redirect("/urls");

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


app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let user = getUserByEmail(email); //id or null. ull is falsey
  console.log("login user ", user);

  if (user) {
    // console.log(userID);
    // console.log(password);
    // const testPassword = bcrypt.compareSync(password, user.password);
    // console.log(users[userID].password);
    // console.log(testPassword);
    // if (bcrypt.compareSync(password, users[userID].password)) {
    if (bcrypt.compareSync(password, user.password)) {
      // console.log("Before: ", req.session.userID);
      req.session.userID = user.id;
      // console.log("After: ", req.session.userID);
      return res.redirect("/urls");
    } else {
      return res.status(403).send("403: Bad Request: Incorrect password.");
    }
  } else {
    return res.status(403).send("403: Bad Request: You cannot create login since you are not registered yet.");
  }
});


app.post("/logout", (req, res) => {
  req.session = null;
  return res.redirect("/urls");
});


// Create a POST /register endpoint that handles the registration form data. This endpoint should add a new user object to the global users object. The user object should include the user's id, email and password, similar to the example above. To generate a random user ID, use the same function you use to generate random IDs for URLs.
app.post("/register", (req, res) => {

  // If the e-mail or password are empty strings, send back a response with the 400 status code.
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("400: Bad Request: This field must not be empty.");
    res.redirect("/register");
  }

  // If someone tries to register with an email that is already in the users object, send back a response with the 400 status code
  else if (getUserByEmail(req.body.email)) {
    res.status(400).send("400: Bad Request: This email has already been registered.");
  } else {
    // now get the password and encrypt it/hash it, then create an id, and put the hashed password in our database

  let newUserID = generateRandomString(6);
  // console.log("the newUserID is: ", newUserID);
  users[newUserID] = {
    id: newUserID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
  };
  // const defaultURLS = {
  //   "defaultShortURL": {
  //     "userID": newUserID,
  //     "longURL": "www.google.com"
  //   }
  // };

  // const urlDatabaseCopy = {...urlDatabase, ...defaultURLS};   // "spread" syntax
  // console.log("what is urlDatabaseCoy? ", urlDatabaseCopy);
  // urlDatabase = urlDatabaseCopy;
  req.session.userID = newUserID;
  return res.redirect("/urls");     // Redirect the user to the /urls page.

  }

  
});








app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});