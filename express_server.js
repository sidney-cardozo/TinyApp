var express = require("express");
var cookieParser = require('cookie-parser');
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

function generateRandomString(){
  const alphaNumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  let randomString = "";
  let i = 0
  while(i<6){
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



app.post("/login", (req, res) => {
  if(!emailExistsInDB(req.body.email)){
    res.status(403).send("Email not in database");
  }else if(userForAnExistingEmail(req.body.email) != req.body.password ){
    res.status(403).send("Password incorrect");
  } else {
    res.cookie('user_id', userForAnExistingEmail(req.body.email).id);
    res.redirect("/urls");
  }
})

app.post("/logout", (req,res) =>{
  res.clearCookie("user_id");
  res.redirect("/urls");
})
app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user : users[req.cookies["user_id"]]};
  res.render("urls_new", templateVars);
});

app.get("/urls.json", (req, res) => {res.json(urlDatabase);});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
  urls: urlDatabase,
  user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  // console.log(res.cookes);
  let templateVars = {urls: urlDatabase,
  user: users[req.cookies["user_id"]]};

  res.render("urls_index", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
})

app.post("/urls/:id", (req, res) =>{
  urlDatabase[req.params.id] = req.body.newLongURL;
  res.redirect('/urls');
})

app.post("/urls", (req, res) => {
  let randomString = generateRandomString();
  let longURL = req.body.longURL;  // debug statement to see POST parameters
  // res.send("Ok");
  urlDatabase[randomString] = longURL;
  res.redirect(`/urls/${randomString}`);       // Respond with 'Ok' (we will replace this)
});

app.get("/register", (req, res) => {
  // if(req.cookies[userID] == undefined){
  //   res.cookie('userID', "Guest");
  //   let templateVars = { userID: req.cookies['userID']};
  //   res.render("register", templateVars);
  // }else res.redirect('/urls');
  res.render("register");
})

app.post("/register", (req, res) => {
  let userID = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  if(email == "" || password == ""){
    res.status(400).send("Password or email cannot be empty");
  }else if(emailExistsInDB(email)){
    res.status(400).send("Email already exist in database");
  }else{users[userID] = {
      "id" : userID,
      "email" : email,
      "password": password
    }
    res.cookie("user_id", userID);
    res.redirect('/urls');
  }
 });

app.get("/login", (req, res) => {
  if(req.cookies["user_id"]){
    res.redirect("/urls")
  }else{
    res.render("login");
  }
});


app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World!!!!!!!</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

