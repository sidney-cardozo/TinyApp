// #######################    MODULE Declaration          ##############################################################
// ##########################################################################################

var express = require("express");
var cookieSession = require('cookie-session');
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(cookieSession({
  name: 'session',
  keys: ["key1"]

  // Cookie Options
  // maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.use(bodyParser.urlencoded({extended: true}));

const bcrypt = require("bcrypt");


// ####################################        DATABASES                 ######################################################
// ##########################################################################################

const urlDatabase = {
  "userRandomID": {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com",
    "qqw3ss": "http://www.facebook.com"
  },
 "user2RandomID": {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  }
}


const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
}

// ##################################    FUNCTION DECLARATIONS    ##############################
// ##########################################################################################


function generateRandomString(numberOfCharacters){
  const alphaNumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  let randomString = "";
  let i = 0;
  while(i<numberOfCharacters){
    randomString += alphaNumeric[Math.floor(Math.random() * 63)];
    i++;
  }

  return randomString;
}

function emailExistsInDB(email){
  for(let user in users){
    if(users[user].email == email) return true;
  }
  return false;
}

function userForAnExistingEmail(email){
  for(let user in users){
    if(users[user].email == email) return users[user];
  }
  return false;
}

function urlsForUser(id){
  return urlDatabase[id];
}

// ##################################   SERVER FUNCTIONS   ##############################
// ##########################################################################################


app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls", (req, res) => {
  // console.log(res.cookes);
  let templateVars = {urls: urlsForUser(req.session.user_id),
  user: users[req.session.user_id]};

  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let randomString = generateRandomString(6);
  let longURL = req.body.longURL;  // debug statement to see POST parameters
  // res.send("Ok");
  if(!urlDatabase[req.session.user_id]){
    urlDatabase[req.session.user_id] ={};
  }
  urlDatabase[req.session.user_id][randomString] = longURL;
  res.redirect(`/urls/${randomString}`);       // Respond with 'Ok' (we will replace this)
});

app.get("/login", (req, res) => {
  if(req.session.user_id){
    res.redirect("/urls")
  }else{
    res.render("login");
  }
});

app.post("/login", (req, res) => {

  let password = req.body.password;
  let passwordInDatabase = userForAnExistingEmail(req.body.email)["password"];
  let passwordMatch = bcrypt.compareSync(password, passwordInDatabase);

  if(!emailExistsInDB(req.body.email)){
    let templateVars = { shortURL: req.params.id,
  urls: urlsForUser(req.session.user_id),
  user: users[req.session.user_id]};
  res.render("urls_show", templateVars);
    res.status(403).send("Email not in database");
  }else if(!passwordMatch){
    res.status(403).send("Password incorrect");
  } else {
    req.session.user_id = userForAnExistingEmail(req.body.email).id;
    res.redirect("/urls");
  }
})

app.post("/logout", (req,res) =>{
  req.session = null;
  res.redirect("/urls");
})


app.get("/urls/new", (req, res) => {
  if(req.session.user_id){
    let templateVars = { user : users[req.session.user_id]};
    res.render("urls_new", templateVars);
  }else{
    res.redirect("/login");
  }

});

app.get("/urls/:id", (req, res) => {

  let templateVars = { shortURL: req.params.id,
  urls: urlsForUser(req.session.user_id),
  user: users[req.session.user_id]};
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) =>{
  urlDatabase[req.session.user_id][req.params.id] = req.body.newLongURL;
  res.redirect('/urls');
})

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = "";
  for (let userIDKey in urlDatabase) {
    if (urlDatabase[userIDKey][shortURL]) {
      longURL = urlDatabase[userIDKey][shortURL];
    }
  }
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.session.user_id][req.params.id];
  res.redirect('/urls');
})

app.get("/register", (req, res) => {
  res.render("register");
})

app.post("/register", (req, res) => {
  let userID = generateRandomString(9);
  let email = req.body.email;
  let password = req.body.password;
  if(email == "" || password == ""){
    res.status(400).send("Password or email cannot be empty");
  }else if(emailExistsInDB(email)){
    res.status(400).send("Email already exist in database");
  }else{

    password = bcrypt.hashSync(password, 10);
    users[userID] = {
      "id" : userID,
      "email" : email,
      "password": password
    }
    req.session.user_id = userID;
    res.redirect('/urls');
  }
 });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

