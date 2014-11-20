'use strict';

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var moment = require('moment');
var jwt = require('jwt-simple');

var userSchema = mongoose.Schema({
  basic: {
    email: String,
    password: String,
    passwordConfirm: String,
    adm: false
  }
});

userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.basic.password);
};

userSchema.methods.generateToken = function(secret) {
  var self = this;
  var expires = moment().add(5, 'days').valueOf();
  var token = jwt.encode({
    iss: self._id,
    exp: expires
  }, secret);
  return token;
};

module.exports = mongoose.model('User', userSchema);
