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

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);   //passing templateVars object into urls_index
});

app.get("/urls/:shortURL", (req, res) => {      // The : in front of shortURL indicates that shortURL is a route parameter.
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] /* What goes here? */ };
  res.render("urls_show", templateVars);     // //passing templateVars object into urls_show
});





// <!-- This would display the string "http://www.lighthouselabs.ca" -->
// <h1><%= "b2xVn2" %></h1>



