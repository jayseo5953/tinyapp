const bcrypt = require('bcrypt');

// checks email
let checkEmail = (input_email, database) => {
  let result = false;
  for (let ele in database) {
    if (database[ele].email === input_email) {
      result = true;
    }
  } return result;
}

// checks password
let checkPassword = (input_id,input_password, database) => {
  for (let ele in database) {
    if (ele === input_id) {
      return bcrypt.compareSync(input_password, database[ele].password);
    };
  }; 
};

// find id
let findId = (input_email,database) => {
  let id;
  for (let ele in database) {
    if (database[ele].email === input_email) {
      id = ele
    }
  } return id;
}

// get urls for a particular user
const urlsForUser = (id, database) => {
  let user_Urls = {}
  for (let ele in database) {
    if (database[ele].userID === id) {
      user_Urls[ele]= {};
      user_Urls[ele].longURL = database[ele].longURL;
    }
  };
  return user_Urls;
};

// check if url arleady exists
const urlCheck = (url, userUrl) => {
  let result = false;
  for (let ele in userUrl) {
    if (userUrl[ele].longURL === url) {
      result = true;
    } 
  } 
  return result;
}

// check access
const accessCheck = (url,id,database) => {
  let result = false;
  if (database[url].userID === id) {
    result = true;
  }
  return result;
}

module.exports = { 
  checkEmail,
  checkPassword,
  findId,
  urlsForUser,
  urlCheck,
  accessCheck
 }