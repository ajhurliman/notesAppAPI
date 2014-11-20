'use strict';

var User = require('../models/user');
var checkAdmin = require('../lib/checkAdmin')();
var checkExpired = require('../lib/checkExpired')();

module.exports = function(app, passport) {
  //user login
  app.get('/api/users', passport.authenticate('basic', {session: false}), function(req, res) {
    res.json({'jwt': req.user.generateToken(app.get('jwtSecret'))});
  });

  //admin login
  app.get('/api/users/admin', passport.authenticate('basic', {session: false}), checkAdmin, function(req, res) {

    res.json({'jwt': req.user.generateToken(app.get('jwtSecret'))});
  });

  //create a new user
  app.post('/api/users', function(req, res) {
    User.findOne({'basic.email': req.body.email}, function(err, user) {
      if (err) return res.status(500).send('server error');
      if (user) return res.status(500).send('cannot create that user');
      if (!req.body.password) return res.status(500).send('password is required');
      if (req.body.password !== req.body.passwordConfirm) return res.status(500).send('passwords must match');

      var newUser = new User();
      newUser.basic.email = req.body.email;
      newUser.basic.password = newUser.generateHash(req.body.password);
      newUser.save(function(err, data) {
        if (err) return res.status(500).send('server error');
        res.json({'jwt': newUser.generateToken(app.get('jwtSecret'))});
      });
    });
  });

  //create a new admin
  app.post('/api/users/admin', function(req, res) {
    User.findOne({'basic.email': req.body.email}, function(err, user) {
      if (err) return res.status(500).send('server error');
      if (user) return res.status(500).send('cannot create that user');
      if (!req.body.password) return res.status(500).send('password is required');
      if (req.body.password !== req.body.passwordConfirm) return res.status(500).send('passwords must match');

      var newUser = new User();
      newUser.basic.email = req.body.email;
      newUser.basic.password = newUser.generateHash(req.body.password);
      newUser.basic.adm = true;
      newUser.save(function(err, data) {
        if (err) return res.status(500).send('server error');
        res.json({'jwt': newUser.generateToken(app.get('jwtSecret'), true)});
      });
    });
  });

};
