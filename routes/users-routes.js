const express = require("express");
const { check } = require("express-validator");

const usersControllers = require("../controllers/users-controllers");

const router = express.Router();

router.get("/", usersControllers.getUsers);
router.get("/profile/:uid", usersControllers.getUserById);

router.post(
  "/signup",
  [
    check("firstname").not().isEmpty(),
    check("lastname").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersControllers.signup
);

router.post(
  "/login",
  [check("email").notEmpty(), check("password").notEmpty()],
  usersControllers.login
);
router.post(
  "/confirm-email",
  [check("userId").notEmpty(), check("token").notEmpty()],
  usersControllers.confirmEmail
);

module.exports = router;
