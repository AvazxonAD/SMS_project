module.exports = function isAuthenticated(req, res, next) {
  if (req.session.islogged) {
      return next();
  }
  req.flash('error', 'Iltimos, tizimga kiring.');
  res.redirect('/');
}

