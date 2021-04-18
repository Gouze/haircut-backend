const HttpError = require("../models/http-error");

module.exports = (user) => {
  if (user.isSuperAdmin) {
    return new HttpError("Not allowed", 401);
  }
};
