const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");

const { v4: uuidv4 } = require("uuid");
const HttpError = require("../models/http-error");
const User = require("../models/user");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    const error = new HttpError(
      "Fetching users failed, please try again later",
      500
    );
    return next(error);
  }

  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const getUserById = async (req, res, next) => {
  let user;
  const userId = req.params.uid;

  try {
    user = await User.findById(userId)
      .populate({
        path: "appointments",
        populate: [
          {
            path: "shop",
          },
          {
            path: "service",
          },
        ],
      })
      .populate("notes");
  } catch (err) {
    const error = new HttpError(
      "Fetching user failed, please try again later",
      500
    );
    return next(error);
  }
  if (!user) {
    const error = new HttpError(
      "Could not find a user for the provided id.",
      404
    );
    return next(error);
  }

  res.json({ user: user.toObject({ getters: true }) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Invalid inputs passed, please check your data",
      422
    );
    return next(error);
  }

  const {
    firstname,
    lastname,
    email,
    password,
    phone,
    notificationBySMS,
    notificationByEmail,
  } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Signing up failed, please try again", 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "User exists already please login instead",
      422
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError("Could not create user, please try again", 500);
    return next(error);
  }
  let uuid = uuidv4();
  const createdUser = new User({
    firstname,
    lastname,
    email,
    password: hashedPassword,
    phone,
    notes: [],
    isAdmin: false,
    isManager: false,
    managedShops: [],
    isSoftDeleted: false,
    isBanned: false,
    notificationByEmail,
    notificationBySMS,
    emailValidationToken: uuid,
    lastConnection: new Date(),
  });
  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Signing up failed, please try again", 500);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      {
        userId: createdUser.id,
        email: createdUser.email,
        isAdmin: createdUser.isAdmin,
        isManager: createdUser.isManager,
        managedShops: createdUser.managedShops,
      },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Signing up failed, please try again", 500);
    return next(error);
  }

  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // const msg = {
  //   to: createdUser.email, // Change to your recipient
  //   from: "gouze@me.com", // Change to your verified sender
  //   subject: "Confirmation adresse email",

  //   html: `<p>Link: http://localhost:3000/confirmEmail/user/${createdUser.id}/token/${createdUser.emailValidationToken}</p>`,
  // };
  // sgMail
  //   .send(msg)
  //   .then(() => {
  //     console.log("Email sent");
  //   })
  //   .catch((error) => {
  //     console.error(error);
  //   });

  res.status(201).json({
    userId: createdUser.id,
    email: createdUser.email,
    token: token,
    user: createdUser,
  });
};

//
// LOGIN
//

const login = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }

  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Logging in failed, please try again", 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      401
    );
    return next(error);
  }

  let isValidPassword = false;

  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError("Logging in failed, please try again", 500);
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      401
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Logging in failed, please try again", 500);
    return next(error);
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
    isEmailValid: existingUser.isEmailValid,
  });
};

const confirmEmail = async (req, res, next) => {
  const { userId, token } = req.body;

  let existingUser;

  try {
    existingUser = await User.findById(userId);
  } catch (err) {
    const error = new HttpError("User does not exist", 500);
    return next(error);
  }
  if (!existingUser) {
    const error = new HttpError("User does not exist", 401);
    return next(error);
  }
  if (existingUser.emailValidationToken !== token) {
    const error = new HttpError("Wrong token", 401);
    return next(error);
  }

  existingUser.isEmailValid = true;

  try {
    await existingUser.save();
  } catch (err) {
    const error = new HttpError("Confirmation failed, please try again", 500);
    return next(error);
  }

  res.json({ isEmailValid: existingUser.isEmailValid });
};

const updateMyInfos = async (req, res, next) => {
  const { firstname, lastname, email, phone } = req.body;
  const userId = req.userData.userId;
  let existingUser;
  try {
    existingUser = await User.findOne({ _id: userId });
  } catch (err) {
    const error = new HttpError("Logging in failed, please try again", 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      401
    );
    return next(error);
  }

  existingUser.firstname = firstname;
  existingUser.lastname = lastname;
  existingUser.email = email;
  existingUser.phone = phone;
  try {
    await existingUser.save();
  } catch (err) {
    const error = new HttpError("Update profile failed, please try again", 500);
    return next(error);
  }
  res.status(200).json({ user: existingUser });
};

const updateMyPassword = async (req, res, next) => {
  const { password } = req.body;
  let userId = req.userData.userId;
  let existingUser;
  try {
    existingUser = await User.findOne({ _id: userId });
  } catch (err) {
    const error = new HttpError("Logging in failed, please try again", 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      401
    );
    return next(error);
  }
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError("Could not create user, please try again", 500);
    return next(error);
  }

  existingUser.password = hashedPassword;
  try {
    await existingUser.save();
  } catch (err) {
    const error = new HttpError(
      "Update password failed, please try again",
      500
    );
    return next(error);
  }
  res.status(200).json({ user: existingUser.toObject({ getters: true }) });
};

const adminLogin = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }

  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Logging in failed, please try again", 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      401
    );
    return next(error);
  }

  if (!(existingUser.isAdmin || existingUser.isManager)) {
    const error = new HttpError("Vous n'avez pas les droits", 401);
    return next(error);
  }

  let isValidPassword = false;

  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError("Logging in failed, please try again", 500);
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      401
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      {
        userId: existingUser.id,
        email: existingUser.email,
        isAdmin: existingUser.isAdmin,
        managedShops: existingUser.managedShops,
      },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Logging in failed, please try again", 500);
    return next(error);
  }

  existingUser.lastConnection = new Date();
  try {
    existingUser.save();
  } catch (err) {
    const error = new HttpError("Logging in failed, please try again", 500);
    return next(error);
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
    isEmailValid: existingUser.isEmailValid,
    isAdmin: existingUser.isAdmin,
    managedShops: existingUser.managedShops,
  });
};

const adminDisableUser = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }

  const userId = req.body.userId;

  let existingUser;

  if (userId == req.adminData.userId) {
    const error = new HttpError("Can't disable yourself", 500);
    return next(error);
  }

  try {
    existingUser = await User.findById(userId);
  } catch (err) {
    const error = new HttpError("Logging in failed, please try again", 500);
    return next(error);
  }

  console.log(existingUser.isAdmin);

  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      401
    );
    return next(error);
  }
  existingUser.isSoftDeleted = true;

  try {
    await existingUser.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update note",
      500
    );
    return next(error);
  }

  res.status(200).json({ user: existingUser.toObject({ getters: true }) });
};

const adminUpdateUserInfos = async (req, res, next) => {
  const { userId, firstname, lastname, email, phone } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ _id: userId });
  } catch (err) {
    const error = new HttpError("Logging in failed, please try again", 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      401
    );
    return next(error);
  }

  existingUser.firstname = firstname;
  existingUser.lastname = lastname;
  existingUser.email = email;
  existingUser.phone = phone;
  try {
    await existingUser.save();
  } catch (err) {
    const error = new HttpError("Update profile failed, please try again", 500);
    return next(error);
  }
  res.status(200).json({ user: existingUser.toObject({ getters: true }) });
};

const adminUpdateUserPassword = async (req, res, next) => {
  const { userId, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ _id: userId });
  } catch (err) {
    const error = new HttpError("Logging in failed, please try again", 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      401
    );
    return next(error);
  }
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError("Could not create user, please try again", 500);
    return next(error);
  }

  existingUser.password = hashedPassword;
  try {
    await existingUser.save();
  } catch (err) {
    const error = new HttpError(
      "Update password failed, please try again",
      500
    );
    return next(error);
  }
  res.status(200).json({ user: existingUser.toObject({ getters: true }) });
};
const adminUpdateUserRole = async (req, res, next) => {
  const { userId, managedShops } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ _id: userId });
  } catch (err) {
    const error = new HttpError("Logging in failed, please try again", 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      401
    );
    return next(error);
  }
  if (managedShops.length > 0) {
    existingUser.isManager = true;
  } else {
    existingUser.isManager = false;
  }

  existingUser.managedShops = managedShops;
  try {
    await existingUser.save();
  } catch (err) {
    const error = new HttpError(
      "Update password failed, please try again",
      500
    );
    return next(error);
  }
  res.status(200).json({ user: existingUser.toObject({ getters: true }) });
};

exports.confirmEmail = confirmEmail;
exports.getUsers = getUsers;
exports.getUserById = getUserById;
exports.signup = signup;
exports.login = login;
exports.adminLogin = adminLogin;
exports.adminDisableUser = adminDisableUser;
exports.adminUpdateUserInfos = adminUpdateUserInfos;
exports.adminUpdateUserPassword = adminUpdateUserPassword;
exports.adminUpdateUserRole = adminUpdateUserRole;
exports.updateMyInfos = updateMyInfos;
exports.updateMyPassword = updateMyPassword;
