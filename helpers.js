/*
 * Helpers for various tasks
 *
 */

// Dependencies
var config = require('./config');
var crypto = require('crypto');

// Container for all the helpers
var helpers = {};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function(str){
  try{
    var obj = JSON.parse(str);
    return obj;
  } catch(e){
    return {};
  }
};

// Create a SHA256 hash
helpers.hash = function(str){
  if(typeof(str) == 'string' && str.length > 0){
    var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = function(strLength){
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
  if(strLength){
    // Define all the possible characters that could go into a string
    var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    // Start the final string
    var str = '';
    for(i = 1; i <= strLength; i++) {
        // Get a random charactert from the possibleCharacters string
        var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
        // Append this character to the string
        str+=randomCharacter;
    }
    // Return the final string
    return str;
  } else {
    return false;
  }
};


helpers.isNumeric = function (n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

helpers.isDate = function (d) {
  const r = Date.parse(d);
  return r == r;
}

helpers.areDatesEqual = function(d1, d2) {
  const date1 = new Date(d1);   
  const date2 = new Date(d2);
  const day1 = date1.getDate();
  const day2 = date2.getDate();
  const month1 = date1.getMonth()
  const month2 = date2.getMonth()
  const year1 = date1.getFullYear();
  const year2 = date2.getFullYear();
  return day1 === day2 && month1 === month2 && year1 === year2;
}

helpers.compareNumeric = function (a, b, ordering) {
  switch(true) {
    case ordering === 'lt':
      return a < b;
    case ordering === 'eq':
      return a == b;
    case ordering === 'gt':
      return a > b;
  }
}

helpers.compareDates = function (a, b, ordering) {
  console.log(a, b,dateToNumber(a) == dateToNumber(b),dateToNumber(a), dateToNumber(b))
  switch(true) {
    case ordering === 'lt':
      return dateToNumber(a) < dateToNumber(b);
    case ordering === 'eq':
      return dateToNumber(a) == dateToNumber(b);
    case ordering === 'gt':
      return dateToNumber(a) > dateToNumber(b);
  }
}

helpers.compareStrings = function (a, b, ordering) {
  switch(true) {
    case ordering === 'lt':
      return a.localeCompare(b) < 0;
    case ordering === 'eq':
      return a.indexOf(b) >= 0
    case ordering === 'gt':
      return a.localeCompare(b) > 0;
  }
}

function dateToNumber(d) {
  const date = new Date(d);   
  const day = date.getDate();
  const month = date.getMonth()
  const year = date.getFullYear();
  return day + month*30 + year*365;
}


// Export the module
module.exports = helpers;