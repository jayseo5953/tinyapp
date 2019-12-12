// constants
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");

// databases

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const userDatabase = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
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
let checkEmail = (input_email,database) => {
  let result = false;
  for (let ele in database) {
    if (database[ele].email === input_email) {
      result = true;
    }
  } return result;
}

// checks password
let checkPassword = (input_id,input_password,database) => {
  let result = false;
  for (let ele in database) {
    if (ele === input_id) {
      if (database[ele].password === input_password) {
        result = true;
      }
    }
  } return result;
}

// find id
let findId = (input_email,database) => {
  let id;
  for (let ele in database) {
    if (database[ele].email === input_email) {
      id = ele
    }
  } return id;
}


//// gets /////

// home page
app.get('/urls',(req,res) => {
  let templateVars = {
    urls: urlDatabase,
    user: userDatabase[req.cookies["user_id"]]
  }
  res.render('urls_index', templateVars)
})
app.get("/", (req, res) => {
  res.redirect('/urls');
});


// new urls
app.get('/urls/new', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: userDatabase[req.cookies["user_id"]]
  }
  res.render("urls_new",templateVars);
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
  urlDatabase[shortURL] = longURL
  res.redirect(`/urls/${shortURL}`);
  app.get("/urls/:shortURL",(req,res) => {
    let templateVars = {
      shortURL: req.params.shortURL, 
      longURL: urlDatabase[req.params.shortURL],
      user: userDatabase[req.cookies["user_id"]]
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

// register
app.post('/register',(req,res) => {
  let id = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  let userExist = checkEmail(email,userDatabase)
  if (!email || !password) {
   res.statusCode = 400;
   res.send("Empty Boxes!");
  } else if(userExist){
    res.statusCode = 400;
    res.send("User Already Exists!");
  } else {
    userDatabase[id] = {id, email, password};
    // res.cookie("user_id",id);
    res.redirect('/urls');
  }
});

// login
app.post('/login', (req,res) => {
  let usrEmail = req.body.user_email;
  let usrPassword = req.body.user_password;
  let user_id = findId(usrEmail,userDatabase);

  // authentification
  let foundEmail = checkEmail(usrEmail, userDatabase);
  let foundPassword = checkPassword(user_id, usrPassword, userDatabase);

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
    user_id: req.cookies["user_id"]
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