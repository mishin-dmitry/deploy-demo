const { findUserBySessionId } = require("../db");

const auth = async (req, res, next) => {
  const sessionId = req.cookies["sessionId"];

  if (!sessionId) {
    return next();
  }

  try {
    const user = await findUserBySessionId(sessionId);

    if (!user) {
      res.clearCookie("sessionId").redirect("/");
      return next();
    }

    req.user = user;
    req.sessionId = sessionId;
    next();
  } catch (e) {
    console.error(e);
    next();
  }
};

module.exports = auth;
