const { findUserByToken } = require("../db");

const auth = async (req, res, next) => {
  const token = req.cookies["token"];

  if (!token) {
    return next();
  }

  try {
    const user = await findUserByToken(token);

    if (!user) {
      res.clearCookie("token").redirect("/");
      return next();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (e) {
    console.error(e);
    next();
  }
};

module.exports = auth;
