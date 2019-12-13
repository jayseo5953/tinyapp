// constants
const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");

// functions

const {
  checkEmail,
  checkPassword,
  findId,
  urlsForUser,
  urlCheck,
  accessCheck
} = require("./helpers");

// databases

const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "" }
};

const userDatabase = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  }
};
// engine setup
app.set("view engine", "ejs");

// parsers
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["jolanga"],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  })
);

// random alphabet function
const generateRandomString = () => {
  const result = [];
  const char = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 1; i <= 6; i++) {
    result.push(char[Math.floor(Math.random() * char.length)]);
  }
  return result.join("");
};

//// gets /////

// home page
app.get("/urls", (req, res) => {
  let user = userDatabase[req.session.user_id];
  if (!user) return res.redirect("/login");

  let userUrls = urlsForUser(req.session.user_id, urlDatabase);

  let templateVars = {
    userUrls,
    user
  };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// new urls
app.get("/urls/new", (req, res) => {
  let user = userDatabase[req.session.user_id];
  if (!user) return res.redirect("/login");

  let templateVars = {
    urls: urlDatabase,
    user
  };
  res.render("urls_new", templateVars);
});

// when logged in
app.get("/login", (req, res) => {
  let templateVars = {
    user: userDatabase[req.session.user_id]
  };
  res.render("urls_login", templateVars);
});

// registration
app.get("/signup", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: userDatabase[req.session.user_id]
  };
  res.render("urls_regi", templateVars);
});

//// posts ////

// create new urls
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const user_id = req.session.user_id;
  const userUrls = urlsForUser(user_id, urlDatabase);
  const urlExists = urlCheck(longURL, userUrls);

  if (urlExists) {
    res.statusCode = 403;
    res.send("Url already exists");
  } else {
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = {};
    urlDatabase[shortURL].longURL = longURL;
    urlDatabase[shortURL].userID = user_id;
    res.redirect(`/urls/${shortURL}`);
  }
});

//delete
app.post("/urls/:shortURL/delete", (req, res) => {
  const user_id = req.session.user_id;
  const shortURL = req.params.shortURL;

  const hasAccess = accessCheck(shortURL, user_id, urlDatabase);

  if (!hasAccess) {
    res.statusCode = 403;
    res.send("You do not have the access!");
    return;
  }

  delete urlDatabase[shortURL];
  res.redirect("/");
});

//edit
app.post("/urls/:shortURL", (req, res) => {
  let user_id = req.session.user_id;
  let shortURL = req.params.shortURL;

  const hasAccess = accessCheck(shortURL, user_id, urlDatabase);
  if (!hasAccess) {
    res.statusCode = 403;
    res.send("You do not have the access!");
    return;
  }

  urlDatabase[shortURL].longURL = req.body.edit;

  res.redirect("/");
});

// register
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const pw = req.body.password;
  const pw2 = req.body.re_password;
  const password = bcrypt.hashSync(pw, 10);
  const userExist = checkEmail(email, userDatabase);

  if (!email || !pw || !pw2) {
    res.statusCode = 400;
    res.send("Empty Boxes!");
  } else if (userExist) {
    res.statusCode = 400;
    res.send("User Already Exists!");
  } else if (pw !== pw2) {
    res.statusCode = 400;
    res.send("Passwords do not match!");
  } else {
    userDatabase[id] = { id, email, password };
    req.session.user_id = id;
    res.redirect("/urls");
  }
});

// login
app.post("/login", (req, res) => {
  let usrEmail = req.body.user_email;
  let usrPassword = req.body.user_password;
  let user_id = findId(usrEmail, userDatabase);

  // authentification
  let foundEmail = checkEmail(usrEmail, userDatabase);
  let foundPassword = checkPassword(user_id, usrPassword, userDatabase);

  if (!foundEmail) {
    res.statusCode = 403;
    res.send("Account Not Found!");
  } else if (!foundPassword) {
    res.statusCode = 403;
    res.send("Password does not Macth!");
  } else {
    req.session.user_id = user_id;
    res.redirect("/urls");
  }
});

// logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/");
});

/////// Less specifics

//edit page
app.get("/urls/:shortURL", (req, res) => {
  let user = userDatabase[req.session.user_id];
  if (!user) return res.redirect("/login");

  let shortURL = req.params.shortURL;
  let user_id = req.session.user_id;

  const hasAccess = accessCheck(shortURL, user_id, urlDatabase);
  if (!hasAccess) {
    res.statusCode = 403;
    res.send("You do not have the access!");
    return;
  }

  let templateVars = {
    shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user_id,
    user
  };
  res.render("urls_show", templateVars);
});

app.get("/urls/:shortURL/edit", (req, res) => {
  let user = userDatabase[req.session.user_id];
  if (!user) return res.redirect("/login");

  let shortURL = req.params.shortURL;
  let user_id = req.session.user_id;

  const hasAccess = accessCheck(shortURL, user_id, urlDatabase);

  if (!hasAccess) {
    res.statusCode = 403;
    res.send("You do not have the access!");
    return;
  }

  let templateVars = {
    shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user_id,
    user
  };
  res.render("urls_edit", templateVars);
});

// accessing the website

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let longURL;
  for (let key in urlDatabase) {
    if (key === shortURL) {
      longURL = urlDatabase[shortURL].longURL;
      res.redirect(longURL);
      return;
    }
  }
  res.statusCode = 400;
  res.send("Page not Found");
});

app.listen(PORT, () => {
  console.log(`The Server listening on port ${PORT}!`);
});
