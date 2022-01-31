// Create a function named urlsForUser(id) which returns the URLs where 
// the userID is equal to the id of the currently logged-in user.
const urlsForUser = function(id) {
  const results = {};

  for (const i in urlDatabase) {
    if (urlDatabase[i].userID === id) {
      results[i] = urlDatabase[i].longURL;
    }
  }
  return results;
};

const getOwnerLinks = (ownerID) => {
  const ownersLinks = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === ownerID) {
      ownersLinks[key] = urlDatabase[key];
    }
    if (urlDatabase[key].userID === "") {
      ownersLinks[key] = urlDatabase[key];
    }
  }
  return ownersLinks;
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

const checkCookie = function(id) {
  if (users[id]) {
    return true;
  }
  return false;
};

const checkURL = (url) => {
  
  url = url.replace(/http:\/\//, "");
  url = url.replace(/https:\/\//, "");

  //  add 'https://www.'
  if (url.match(/\./g).length === 1) {
    url = `https://www.${url}`;
  }

  // if more than one dot, add 'https://' if missing
  if (url.search("https://") !== 0) {
    url = `https://${url}`;
  }

  return url;
};

const getUserByEmail = (email) => {
  for (const userID in users) {
    if(users[userID].email === email) {
      return users[userID].id;
    }
  }
  return null;
};

const getUserID = (id) => {
  for (let userID in users) {
    if (id === userID) {
      return userID;
    }
  }
  return null;
};

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


module.exports = {
  getUserByEmail,
  urlsForUser,
  getOwnerLinks,
  generateRandomString,
  checkURL,
  getUserID,
  checkCookie
};