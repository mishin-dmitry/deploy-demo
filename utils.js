const crypto = require("crypto");

function hash(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

module.exports = {
  hash,
};
