const jwt = require("jsonwebtoken");
const User = require("../models/user");

const HttpError = require("../models/http-error");

module.exports = async (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  let user;

  try {
    const userId = req.userData.userId;
    if (!userId) {
      throw new Error("not allowed ");
    }

    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError("not allowed ", 500);
    return next(error);
  }

  if (!user.isAdmin) {
    const error = new HttpError("not allowed", 500);
    return next(error);
  }
  next();
};
