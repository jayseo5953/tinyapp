// constants
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// random alphabet function
function generateRandomString() {
  const result = [];
  const char = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let i = 1; i <= 6; i++) {
    result.push(char[Math.floor(Math.random()*char.length)])
  }
  return result.join("")
}

// engine setup
app.set("view engine","ejs")

// routes
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });

app.get('/hello',(req,res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get('/urls.json', (req,res) => {
  res.json(urlDatabase);
});

app.get("/urls",(req,res) => {
  let templateVars = {urls: urlDatabase}
  res.render('urls_index', templateVars)
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL
  res.redirect(`/urls/${shortURL}`);
  app.get("/urls/:shortURL",(req,res) => {
    let templateVars = {
      shortURL: req.params.shortURL, 
      longURL: urlDatabase[req.params.shortURL]
    };
    res.render('urls_show',templateVars)
  })
});

app.get("/urls/:shortURL",(req,res) => {
  let templateVars = {
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render('urls_show',templateVars)
})

app.get("/u/:shortURL",(req,res) => {
  const shortURL = req.params.shortURL;
  let longURL;
  for (let key in urlDatabase) {
  if (key === shortURL) {
    longURL = urlDatabase[shortURL];
    }
  }
  res.redirect(longURL);
})






app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});