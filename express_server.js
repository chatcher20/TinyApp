// Constants, middleware
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const { users, urlDatabase, getUserByEmail, urlsForUser, generateRandomString, checkCookie } = require('./helpers.js');


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
  if (userID) {
    res.redirect("/urls");
  }
  const userObject = users[userID];
  const templateVars = {
    user: userObject
  };
  res.render("urls_register", templateVars);   //passing templateVars object into urls_register
});


app.get("_header", function(req, res) {
  const templateVars = {
    users: users,
    user_id: req.cookies.user_id
  };
  res.render("_header.ejs", templateVars);  //passing templateVars object into header
});


app.get("/urls", (req, res) => {
  const userID = req.session.userID;
  const userURLs = urlsForUser(userID, urlDatabase);
  if (!userID) {
    return res.redirect("/login");
  };
  const templateVars = {
    urls: userURLs,
    user: users[userID]
  };
  return res.render("urls_index", templateVars); //passing templateVars object into urls_index
});

app.post("/urls", (req, res) => {
  const userID = req.session.userID;
  const shortURL = generateRandomString(6);
  if (userID) {
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: userID
    };
    res.redirect("/urls");
  } else {
    res.status(401).send("401: Bad Request: You cannot create a URL if not logged-in.");
  }
});


app.get('/urls/new', (req, res) => {  
  if (req.session.userID) {
    const templateVars = {
      user: users[req.session.userID],
    };
    return res.render('urls_new', templateVars);
  } else {
    return res.redirect("/login");
  }
});


app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.userID;
  if (!userID) {
    return res.redirect("/login");  // if cookie isn't registered for user
  }
  const shortURL = req.params.shortURL;
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
  if (user) {
    if (bcrypt.compareSync(password, user.password)) {
      req.session.userID = user.id;
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
  } 
  
  else {
      let newUserID = generateRandomString(6);
      users[newUserID] = {
        id: newUserID,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
      };
      req.session.userID = newUserID;
      return res.redirect("/urls");     // Redirect the user to the /urls page.
    }

});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});