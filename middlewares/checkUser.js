const checkUserWithRedirect = () => (req, res, next) =>
  req.user ? next() : res.redirect("/");

module.exports = {
  checkUserWithRedirect,
};
