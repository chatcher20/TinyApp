// Since we modified the server file (express_server.js), restart the Express 
// server (we can shut it down with Ctrl + C in the Terminal, then start it up again 
//   with the command node express_server.js)
// It's only necessary to restart the server when we make changes to server files. 
// Changes to front-end files (i.e. anything in our views directory) can be seen by 
// refreshing the browser.

// Note: Any changes to your express_server.js file require you to restart the server.
// Meaning, re-run node express_server.js in server terminal window.


const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


// res.render("urls_index", templateVars);

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());


app.set("view engine", "ejs");


// Routes

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    shortURL: null, 
    longURL: null,
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  // templateVars["urls"] = urlDatabase;
  res.render("urls_index", templateVars);   //passing templateVars object into urls_index
});

app.get("/urls/:shortURL", (req, res) => {      // The : in front of shortURL indicates that shortURL is a route parameter.
  
    templateVars["shortURL"] = req.params.shortURL;
    templateVars["longURL"] = urlDatabase[req.params.shortURL];
  
  res.render("urls_show", templateVars);     // //passing templateVars object into urls_show
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL", (req, res) => {
  
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body["longURL"];
  res.redirect('/urls');
  //access shortURL the same way as 57
  // long uRL, access same was as line 77. Extract those 2 things, pdate database object, then redirect back to main page.
});

function generateRandomString(length) {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6); 
  console.log(req.body, shortURL);  // Log the POST request body to the console
  urlDatabase[shortURL] = req.body["longURL"];
  console.log(urlDatabase);
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/${shortURL}`); 
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const key = req.params.shortURL;
  // console.log(req.body);
  delete urlDatabase[key];
  res.redirect('/urls');
});

app.get("_header", function(req, res) {
  res.render("_header.ejs", {
      username: username
  });
});

app.post("/login", (req, res) => {
  console.log(req.body.username);
  res.cookie("username", req.body.username);
  res.redirect("/urls");
  console.log(req.body.username);
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});







// Ask mentor why username is not being defined
// Plug in printer and print out notes 


