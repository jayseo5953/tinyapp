// constants
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const userDatabase = {

};

app.use(cookieParser());

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
  res.redirect('/urls');
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

app.get('/urls',(req,res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  }
  res.render('urls_index', templateVars)
})

app.get('/urls/new', (req, res) => {
  res.render("urls_new");
});

// when logged in
app.get('/login',(req,res) => {
  let templateVars = {
    username: res.cookies["username"]
  };
  res.render("urls_index", templateVars);
})

// submit username
app.post('/login', (req,res) => {
  let usr = req.body.username
  res.cookie("username",usr);
  res.redirect('/urls')
});

// logout
app.post('/logout', (req, res) => {
  res.clearCookie("username")
  res.redirect('/')
});


// create
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL
  res.redirect(`/urls/${shortURL}`);
  app.get("/urls/:shortURL",(req,res) => {
    let templateVars = {
      shortURL: req.params.shortURL, 
      longURL: urlDatabase[req.params.shortURL],
      username: req.cookies["username"]
    };
    res.render('urls_show',templateVars)
  })
});

//delete
app.post('/urls/:shortURL/delete',(req,res) => {
  
  delete urlDatabase[req.params.shortURL]
  res.redirect('/')
});

//edit
app.post('/urls/:shortURL',(req,res) => {

  urlDatabase[req.params.shortURL] = req.body.edit
  res.redirect('/')

});


/////// Less specific

//show the link or edit page
app.get("/urls/:shortURL",(req,res) => {
  let templateVars = {
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render('urls_show',templateVars)
})


// accessing the website

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