const urlsForUser = function(id, urlDatabase) {
  const results = {};
  for (const i in urlDatabase) {
    if (urlDatabase[i].userID === id) {
      results[i] = urlDatabase[i];
    }
  }
  return results;
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


const getUserByEmail = (email) => {
  console.log("here we are get userbyemail");
  for (const userID in users) {
    if(users[userID].email === email) {
      console.log("get user ", users[userID]);
      return users[userID];
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
  checkCookie,
  users,
  urlDatabase
};