'use strict';

process.env.MONGO_URL = 'mongodb://localhost/notes_test';

var User = require('../../models/user');
var chai = require('chai');
var mongoose = require('mongoose');
var chaihttp = require('chai-http');
chai.use(chaihttp);
var expect = chai.expect;
var user1 = 'user1@example.com';
var user2 = 'user2@example.com';

require('../../server.js');

var url = 'http://localhost:3000';

mongoose.connection.collections['users'].drop( function(err) {
    console.log('collection dropped');
});

describe('a user auth-auth system', function() {
  var jwtToken = '';

  it('should add a user', function(done) {
    //add user1, expect jwt to be ok
    chai.request(url)
    .post('/api/users')
    .send({email: user1, password: "asdf", passwordConfirm: "asdf"})
    .end(function(err, res) {
      expect(err).to.eql(null);
      expect(res.body.jwt).to.be.ok;
      done();
    });
  });


  it('should log a user in', function(done) {
    //login as user1 on app.get('api/users'), expect a jwt token to equal token1
    chai.request(url)
    .get('/api/users')
    .auth(user1, 'asdf')
    .end(function(err, res) {
      expect(err).to.eql(null);
      console.dir(res.body);
      expect(res.body.jwt).to.be.ok;
      done();
    });
  });

  it('should fail to log a user in with an incorrect password', function(done) {
    //submit incorrect password as user1 on app.get('api/users'), expect a response of
    chai.request(url)
    .get('/api/users')
    .auth(user1, 'incorrectPassword')
    .end(function(err, res) {
      expect(err).to.eql(null);
      expect(res.text).to.eql('access error\n');
      done();
    });
  });


  it('should fail to add a user that already exists', function(done) {
    //try to add user1 again, expect response to equal "cannot create that user"
    chai.request(url)
    .post('/api/users')
    .send({email: user1, password: "asdf", "passwordConfirm": "asdf"})
    .end(function(err, res){
      expect(err).to.eql(null);
      expect(res.text).to.eql('cannot create that user');
      done();
    });
  });

  it('should fail to add a user without matching passwords', function(done) {
    //send a req with passwords that don't match, expect res to be 'passwords must match'
    chai.request(url)
    .post('/api/users')
    .send({email: "mismatchedPasswords@example", password: "asdf", "passwordConfirm": "fdsa"})
    .end(function(err, res){
      expect(err).to.eql(null);
      expect(res.text).to.eql('passwords must match');
      done();
    });
  });

  it('should fail to add a user with no password', function(done) {
    //send a req with a password = '' expect res to be 'password is required'
    chai.request(url)
    .post('/api/users/')
    .send({email: "mismatchedPasswords@example", password: "", "passwordConfirm": ""})
    .end(function(err, res){
      expect(err).to.eql(null);
      expect(res.text).to.eql('password is required');
      done();
    });
  });

  it('should fail to log a user in as an admin', function(done) {
    //try to log user1 in as admin, expect res to be 'admin priveleges required'
    chai.request(url)
    .get('/api/users/admin')
    .auth(user1, 'asdf')
    .end(function(err, res) {
      expect(err).to.eql(null);
      expect(res.text).to.eql('admin priveleges required');
      done();
    });
  });

  it('should add an admin', function(done) {
    //add user2 with admin = true
    chai.request(url)
    .post('/api/users/admin')
    .send({email: user2, password: "asdf", "passwordConfirm": "asdf"})
    .end(function(err, res){
      expect(err).to.eql(null);
      expect(res.body.jwt).to.be.ok;
      done();
    });
  });

  it('should log in as admin', function(done) {
    //log in user2 as admin, expect jwt to be ok
    chai.request(url)
    .get('/api/users/admin')
    .auth(user2, 'asdf')
    .end(function(err, res) {
      expect(err).to.eql(null);
      expect(res.body.jwt).to.be.ok;
      done();
    });
  });
  //end it-blocks

  User.collection.remove(function(err){
    if(err) throw(err);
  });
}); //end describe auth-auth
