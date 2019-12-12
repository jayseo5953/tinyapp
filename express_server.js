// constants
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt')

// databases

const urlDatabase = {
  "b2xVn2": {longURL:"http://www.lighthouselabs.ca", userID:""},
  "9sm5xK": {longURL:"http://www.google.com", userID:""}
};

const userDatabase = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  }
};
// engine setup
app.set("view engine","ejs")
// parser
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

// random alphabet function
function generateRandomString() {
  const result = [];
  const char = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let i = 1; i <= 6; i++) {
    result.push(char[Math.floor(Math.random()*char.length)])
  }
  return result.join("")
};
// checks email
let checkEmail = (input_email) => {
  let result = false;
  for (let ele in userDatabase) {
    if (userDatabase[ele].email === input_email) {
      result = true;
    }
  } return result;
}

// checks password
let checkPassword = (input_id,input_password) => {
  for (let ele in userDatabase) {
    if (ele === input_id) {
      return bcrypt.compareSync(input_password, userDatabase[ele].password);
    }
  } 
}

// find id
let findId = (input_email) => {
  let id;
  for (let ele in userDatabase) {
    if (userDatabase[ele].email === input_email) {
      id = ele
    }
  } return id;
}


//// gets /////

// home page
app.get('/urls',(req,res) => {
  let userUrls = {};
  let urlsForUser = (id) => {
    for (let ele in urlDatabase) {
      if (urlDatabase[ele].userID === id) {
        userUrls[ele]= {};
        userUrls[ele].longURL = urlDatabase[ele].longURL;
      }
    };
  };
  urlsForUser(req.cookies["user_id"]);

  let templateVars;
  if (req.cookies["user_id"]) {
    templateVars = {
      userUrls,
      user: userDatabase[req.cookies["user_id"]]
    } 
    } else {
      templateVars = {
      userUrls,
      user: undefined
     }
    }
    res.render('urls_index', templateVars);
  });
app.get("/", (req, res) => {
  res.redirect('/urls');
});


// new urls
app.get('/urls/new', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: userDatabase[req.cookies["user_id"]]
  }
  if (req.cookies.user_id){
    res.render("urls_new",templateVars);
  } else {
    res.redirect("/login")
  }
});

// when logged in
app.get('/login',(req,res) => {
  let templateVars = {
    user: userDatabase[req.cookies["user_id"]]
  };
  res.render("urls_login", templateVars);
})

// registration
app.get('/signup', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: userDatabase[req.cookies["user_id"]]
  }
  res.render("urls_regi",templateVars)
});



//// posts ////


// create new urls
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  let user_id = req.cookies.user_id;
  urlDatabase[shortURL] = {}
  urlDatabase[shortURL].longURL = longURL;
  urlDatabase[shortURL].userID = user_id;
  res.redirect(`/urls/${shortURL}`);
});

//delete
app.post('/urls/:shortURL/delete',(req,res) => {
  let user_id = req.cookies.user_id;
  let shortURL = req.params.shortURL;

  if (urlDatabase[shortURL].userID === user_id){
    delete urlDatabase[shortURL];
  };
  res.redirect('/')
});

//edit
app.post('/urls/:shortURL',(req,res) => {
  let user_id = req.cookies.user_id;
  let shortURL = req.params.shortURL;

  if (urlDatabase[shortURL].userID === user_id){
    urlDatabase[shortURL].longURL = req.body.edit
  };
  
 
  res.redirect('/')

});

// register
app.post('/register',(req,res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const pw = req.body.password;
  const password = bcrypt.hashSync(pw, 10);
  const userExist = checkEmail(email)
  if (!email || !pw) {
   res.statusCode = 400;
   res.send("Empty Boxes!");
  } else if(userExist){
    res.statusCode = 400;
    res.send("User Already Exists!");
  } else {
    userDatabase[id] = {id, email, password};
    res.cookie("user_id",id);
    res.redirect('/urls');
  }
});

// login
app.post('/login', (req,res) => {
  let usrEmail = req.body.user_email;
  let usrPassword = req.body.user_password;
  let user_id = findId(usrEmail);

  // authentification
  let foundEmail = checkEmail(usrEmail);
  let foundPassword = checkPassword(user_id, usrPassword);


  if (!foundEmail) {
    res.statusCode = 403;
    res.send("Account Not Found!");
  } else if(!foundPassword) {
    res.statusCode = 403;
    res.send("Password does not Macth!");
  } else {
    res.cookie("user_id",user_id);
    res.redirect('/urls')
  }
});

// logout
app.post('/logout', (req, res) => {
  res.clearCookie("user_id")
  res.redirect('/')
});

/////// Less specifics

//show the link or edit page
app.get("/urls/:shortURL",(req,res) => {
  let templateVars = {
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user_id: req.cookies["user_id"],
    user: userDatabase[req.cookies.user_id]
  };
  res.render('urls_show',templateVars)
})


// accessing the website

app.get("/u/:shortURL",(req,res) => {
  const shortURL = req.params.shortURL;
  let longURL;
  for (let key in urlDatabase) {
  if (key === shortURL) {
    longURL = urlDatabase[shortURL].longURL;
    }
  }
  res.redirect(longURL);
})





app.listen(PORT, () => {
  console.log(`The Server listening on port ${PORT}!`);
});