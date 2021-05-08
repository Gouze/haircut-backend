const { request } = require("express");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Shop = require("../models/shop");
const User = require("../models/user");

const getShops = async (req, res, next) => {
  let shop;
  try {
    shop = await Shop.find();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a note",
      500
    );
    return next(error);
  }

  if (!shop) {
    const error = new HttpError(
      "Could not find a note for the provided id.",
      404
    );
    return next(error);
  }
  res.json({ shop: shop });
};

const createShop = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }

  const { name, creator } = req.body;
  const createdShop = new Shop({
    name,
    creator,
  });

  let user;

  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError("Creating place failed, please try again", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for provided id", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdShop.save({ session: sess });
    user.managedShops.push(createdShop);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Creating shop failed, please try again.", 500);
    return next(error);
  }

  res.status(201).json({ shop: createdShop });
};

const adminGetManagedShops = async (req, res, next) => {
  let shops = null;
  try {
    if (req.adminData.isAdmin) {
      shops = await Shop.find();
    } else if (req.adminData.managedShops.length > 0) {
      shops = await Shop.find({
        _id: { $in: [req.adminData.managedShops] },
        isSoftDeleted: false,
      });
    }
  } catch (err) {
    const error = new HttpError(
      "Fetching user failed, please try again later",
      500
    );
    return next(error);
  }
  if (shops.length == 0) {
    const error = new HttpError(
      "Could not find a shop for the provided id.",
      404
    );
    return next(error);
  }
  res.json({ shops: shops });
};
exports.createShop = createShop;
exports.getShops = getShops;
exports.adminGetManagedShops = adminGetManagedShops;
