const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1]; // Auhtorization : 'Bearer TOKEN'
    if (!token) {
      throw new Error("authentication failed");
    }

    const decodedToken = jwt.verify(token, process.env.JWT_KEY);

    if (!(decodedToken.isAdmin || decodedToken.managedShops.length >= 0)) {
      throw new Error("access denied");
    }
    req.adminData = {
      userId: decodedToken.userId,
      isAdmin: decodedToken.isAdmin,
      managedShops: decodedToken.managedShops,
    };
    next();
  } catch (err) {
    const error = new HttpError("Authentication failed", 401);
    return next(error);
  }
};
