var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls.json", (req, res) => {res.json(urlDatabase);});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
  urls: urlDatabase };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  let templateVars = {urls: urlDatabase};
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

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World!!!!!!!</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});