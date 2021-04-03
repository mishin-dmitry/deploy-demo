const checkUserWithRedirect = () => (req, res, next) => (req.user ? next() : res.redirect("/"));
const checkUserWithSendStatus = () => (req, res, next) => (req.user ? next() : res.sendStatus(401));

module.exports = {
  checkUserWithRedirect,
  checkUserWithSendStatus,
};
