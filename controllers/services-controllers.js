const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Service = require("../models/service");
const Shop = require("../models/shop");
const Category = require("../models/category");

const createService = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }

  const {
    name,
    description,
    duration,
    slotsPattern,
    price,
    shopId,
    categoryId,
  } = req.body;

  const createdService = new Service({
    name,
    description,
    duration,
    slotsPattern,
    price,
    shop: shopId,
    category: categoryId,
  });

  let shopObj;

  try {
    shopObj = await Shop.findById(shopId);
  } catch (err) {
    const error = new HttpError(
      "Creating service failed, please try again",
      500
    );
    return next(error);
  }

  if (!shopObj) {
    const error = new HttpError("Could not find shop for provided id", 404);
    return next(error);
  }

  let categoryObj;
  try {
    categoryObj = await Category.findById(categoryId);
  } catch (err) {
    const error = new HttpError(
      "Creating service failed, please try again",
      500
    );
    return next(error);
  }

  if (!categoryObj) {
    const error = new HttpError("Could not find category for provided id", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdService.save({ session: sess });
    shopObj.services.push(createdService);
    await shopObj.save({ session: sess });
    categoryObj.services.push(createdService);
    await categoryObj.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Creating service failed, please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({ note: createdService });
};

exports.createService = createService;
