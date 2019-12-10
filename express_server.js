// constants
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// engine setup
app.set("view engine","ejs")

// routes
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls",(req,res) => {
  let templateVars = {urls: urlDatabase}
  res.render('urls_index', templateVars)
})

app.get("/urls/:shortURL",(req,res) => {
  let templateVars = {
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render('urls_show',templateVars)
})

app.get('/urls.json', (req,res) => {
  res.json(urlDatabase);
});

app.get('/hello',(req,res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});