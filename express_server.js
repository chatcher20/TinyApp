// Constants:
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");


// Middleware
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");


// Global Variables:

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = function(length) {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

// Global object called users which will be used to store and access the users in the app
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  }
};

const findUserByEmail = (email) => {
  for(const userId in users) {
    const user = users[userId];
    if(user.email === email) {
      return user;
    }
  }
  return null;
};




// GET Routes

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  res.redirect("/urls");;
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user_id: req.cookies.user_id
  };
  res.render("urls_new", templateVars);   //passing templateVars object into urls_new
});

app.get("/urls/:shortURL", (req, res) => {
  
  const templateVars = {};
  templateVars["shortURL"] = req.params.shortURL;
  templateVars["longURL"] = urlDatabase[req.params.shortURL];
  templateVars["users"] = users,
  templateVars["user_id"] = req.cookies.user_id
  
  res.render("urls_show", templateVars);     // passing templateVars object into urls_show
});

app.get("/urls", (req, res) => {
  console.log(req.cookies.user_id);
  const templateVars = {
    shortURL: null, 
    longURL: null,
    urls: urlDatabase,
    users: users,
    user_id: req.cookies.user_id
  };
  res.render("urls_index", templateVars);   //passing templateVars object into urls_index
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  console.log(urlDatabase);
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("_header", function(req, res) {
  const templateVars = {
    users: users,
    user_id: req.cookies.user_id
  }
  res.render("_header.ejs", templateVars);  //passing templateVars object into header
});

// GET /register endpoint, which returns a registration page templae
app.get("/register", (req, res) => {
  const templateVars = { 
    users: users,
    user_id: req.cookies.user_id
  }   
  res.render("urls_register", templateVars);   //passing templateVars object into urls_register
});

app.get("/login", (req, res) => {
  const templateVars = {};
  templateVars["users"] = users,
  templateVars["user_id"] = req.cookies.user_id
  console.log("users");
  console.log(templateVars);


  res.render("urls_login", templateVars);
});

// END of GET Routes




// POST Routes

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email);

  if (!user) {
    return res.status(403).send('A user with that email address was not found.')
  }

  if (!email || !password) {
    return res.status(403).send("Email or password cannot be blank.")
  }

  if (user.password !== password) {
    return res.status(403).send("Password doesn't match.")
  }

  res.cookie("user_id", user.id)
  res.redirect("/urls");

});

app.post("/logout", (req, res) => {
  
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const key = req.params.shortURL;
  delete urlDatabase[key];
  res.redirect('/urls');
});

app.post("/urls/:shortURL", (req, res) => {
  
  const shortURL = req.params.shortURL;  
  console.log(req.params.shortURL);     
  console.log(urlDatabase[shortURL]);  
  console.log(urlDatabase);
  urlDatabase[shortURL] = req.body["longURL"];
  res.redirect('/urls');
  
  res.status(401).send("401: Bad Request: You don't have permission to edit this URL.")
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6); 
    console.log(req.body, shortURL); 
  urlDatabase[shortURL] = req.body["longURL"];
    console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`); 
});

// Create a POST /register endpoint that handles the registration form data. This endpoint should add a new user object to the global users object. The user object should include the user's id, email and password, similar to the example above. To generate a random user ID, use the same function you use to generate random IDs for URLs.
app.post("/register", (req, res) => {

  // If the e-mail or password are empty strings, send back a response with the 400 status code.
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("400: Bad Request: This field must not be empty.")
    res.redirect("/register");
  };

  // If someone tries to register with an email that is already in the users object, send back a response with the 400 status code
  for (let user in users) {
    if (req.body.email === users[user].email) {
      res.status(400).send("400: Bad Request: This email has already been registered.")
      res.redirect("/register");
    }
  };

  const newUserID = generateRandomString(6)      
  users[newUserID] = {
    id: newUserID,
    email: req.body.email, 
    password: req.body.password
  };

  res.cookie("user_id", req.body.email);   // After adding the user, set a user_id cookie containing the user's newly generated ID.
  res.redirect("/urls");                  // Redirect the user to the /urls page.

});

// END of POST Routes