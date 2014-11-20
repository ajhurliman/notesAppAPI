'use strict';

module.exports = function() {
  return function(req, res, next) {
    //checks if the user is an admin or not
    if (!req.user.basic.adm) return res.status(500).send('admin priveleges required');
    next();
  };
};
