const { assert } = require('chai');

const { findId } = require('../helpers.js');
const { checkEmail } = require('../helpers.js');
const { urlsForUser } = require('../helpers.js')

const testUsers = {
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
};
const urlDatabase = {
  "b2xVn2": {longURL:"http://www.lighthouselabs.ca", userID:"asdc2a"},
  "9sm5xK": {longURL:"http://www.google.com", userID:"asdasd"}
};

describe('findId', function() {
  it('should return a user with valid email', function() {
    const user = findId("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.equal(user,expectedOutput);
  });
  it('should return undefined if not found', function() {
    const user = findId("user3@example.com", testUsers)
    const expectedOutput = undefined;
    assert.equal(user,expectedOutput);
  });
});

describe('checkEmail', function() {
  it('should return true if found', function() {
    const found = checkEmail("user@example.com", testUsers)
    const expectedOutput = true;
    // Write your assert statement here
    assert.equal(found,expectedOutput);
  });
  it('should return undefined if not found', function() {
    const notFound = checkEmail("user3@example.com", testUsers)
    const expectedOutput = false;
    assert.equal(notFound,expectedOutput);
  });
});

describe('urlsForUser', function() {
  it('should return an object of urls', function() {
    const userUrl = urlsForUser("asdc2a", urlDatabase)
    const expectedOutput = {"b2xVn2": {longURL:"http://www.lighthouselabs.ca"}};
    // Write your assert statement here
    assert.deepEqual(userUrl,expectedOutput);
  });
  it('should return empty object if not found', function() {
    const notFound = urlsForUser("asdc21", urlDatabase)
    const expectedOutput = {};
    assert.deepEqual(notFound,expectedOutput);
  });
});
