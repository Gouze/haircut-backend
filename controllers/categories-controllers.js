const HttpError = require("../models/http-error");
const Category = require("../models/category");
const Shop = require("../models/shop");
const Service = require("../models/service");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const createCategory = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }
  let shop;

  const { name, shopId } = req.body;
  try {
    shop = await Shop.findById(shopId);
  } catch (err) {
    const error = new HttpError(
      "Creating category failed, please try again",
      500
    );
    return next(error);
  }

  if (!shop) {
    const error = new HttpError("Could not find shop for provided id", 404);
    return next(error);
  }
  const createdCategory = new Category({
    name,
    shop,
  });
  console.log(shop);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdCategory.save({ session: sess });
    shop.categories.push(createdCategory);
    await shop.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Creating category failed, please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({ category: createdCategory });
};

const getCategoriesByShop = async (req, res, next) => {
  const shopId = req.params.shopId;

  let categories = [];

  try {
    categories = await Category.find({ shop: shopId }).populate("services");
  } catch (err) {
    const error = new HttpError(
      "Fetching user failed, please try again later",
      500
    );
    return next(error);
  }
  if (categories.length == 0) {
    const error = new HttpError(
      "Could not find a category for the provided id.",
      404
    );
    return next(error);
  }
  res.json({ categories: categories });
};
exports.createCategory = createCategory;
exports.getCategoriesByShop = getCategoriesByShop;
