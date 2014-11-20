'use strict';

process.env.MONGO_URL = 'mongodb://localhost/notes_test';

var mongoose = require('mongoose');
var chai = require('chai');
var chaihttp = require('chai-http');
chai.use(chaihttp);
var expect = chai.expect;

require('../../server.js');

var url = 'http://localhost:3000';

mongoose.connection.collections['users'].drop( function(err) {
    console.log('collection dropped');
});

describe('basic notes crud', function() {
  var jwtToken = '';
  var id;

  it('should return a jwt for notes tests', function (done) {
    chai.request(url)
    .post('/api/users')
    .send({email: 'test101@example.com', password: 'asdf', passwordConfirm: 'asdf'})
    .end(function (err, res) {
      expect(res.body.jwt).to.be.ok;
      jwtToken = res.body.jwt;
      done();
    });
  });

  it('should be able to create a note', function(done) {
    console.dir(jwtToken);
    chai.request(url)
    .post('/v1/api/notes')
    .send({noteBody: 'hello world', jwt: jwtToken})
    .end(function(err, res) {
      console.dir(res.body);
      expect(err).to.eql(null);
      expect(res.body.noteBody).to.eql('hello world');
      expect(res.body).to.have.property('_id');
      id = res.body._id;
      done();
    });
  });

  it('should be able to get a single note', function(done) {
    chai.request(url)
    .get('/v1/api/notes/' + id)
    .send({jwt: jwtToken})
    .end(function(err, res) {
      expect(err).to.eql(null);
      expect(res.body.noteBody).to.eql('hello world');
      done();
    });
  });

  it('should be able to update a note', function(done) {
    chai.request(url)
    .put('/v1/api/notes/' + id)
    .send({noteBody: 'new note body', jwt: jwtToken})
    .end(function(err, res) {
      expect(err).to.eql(null);
      expect(res.body.noteBody).to.eql('new note body');
      done();
    });
  });

  it('should be able to destroy a note', function(done) {
    chai.request(url)
    .delete('/v1/api/notes/' + id)
    .send({jwt: jwtToken})
    .end(function(err, res) {
      expect(err).to.eql(null);
      expect(res.body.msg).to.eql('success!');
      done();
    });
  });
});
