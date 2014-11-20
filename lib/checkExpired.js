'use strict';
var moment = require('moment');

module.exports = function() {
  return function(req, res, next) {
    //checks if the JWT is expired
    var expiry = moment(req.decoded.exp).format('X');
    var now = Date.now();
    console.log(expiry, now);
    if (expiry*1000 <= now) {
      return res.status(400).send({"expiry":expiry,"rightNow": now});
    }
    next();
  };
};
