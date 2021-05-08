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

  const { name, shopId, gender } = req.body;
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
    gender: gender || null,
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
const getCategoriesByShopAndGender = async (req, res, next) => {
  const shopId = req.params.shopId;
  const gender = req.params.gender;

  let categories = [];

  try {
    categories = await Category.find({ shop: shopId, gender: gender }).populate(
      "services"
    );
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

const adminGetCategories = async (req, res, next) => {
  let categories = null;

  try {
    if (req.adminData.isAdmin) {
      categories = await Category.find()
        .populate("shop")
        .populate("service")
        .sort({ createdAt: "desc" });
    } else if (req.adminData.managedShops.length > 0) {
      categories = await Category.find({
        shop: { $in: [req.adminData.managedShops] },
        isSoftDeleted: false,
      })
        .populate("shop")
        .populate("service");
    }
  } catch (err) {
    const error = new HttpError(
      "Fetching categories failed, please try again later",
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

const adminUpdateCategory = async (req, res, next) => {
  let catId = req.params.catId;
  let { name, shopId, gender } = req.body;
  try {
    category = await Category.findById(catId).populate("shop");
  } catch (err) {
    const error = new HttpError(
      "Fetching category failed, please try again later",
      500
    );
    return next(error);
  }
  if (!category) {
    const error = new HttpError(
      "Could not find a category for the provided id.",
      404
    );
    return next(error);
  }
  let olderShopId = category.shop._id;

  try {
    olderShop = await Shop.findById(olderShopId);
  } catch (err) {
    const error = new HttpError(
      "Fetching shop failed, please try again later",
      500
    );
    return next(error);
  }
  if (!olderShop) {
    const error = new HttpError(
      "Could not find a shop for the provided id.",
      404
    );
    return next(error);
  }
  try {
    shop = await Shop.findById(shopId);
  } catch (err) {
    const error = new HttpError(
      "Fetching shop failed, please try again later",
      500
    );
    return next(error);
  }
  if (!shop) {
    const error = new HttpError(
      "Could not find a shop for the provided id.",
      404
    );
    return next(error);
  }

  category.name = name;
  category.shop = shopId;
  category.gender = gender;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await category.save({ session: sess });
    olderShop.categories.pull(category);
    await olderShop.save({ session: sess });

    shop.categories.push(category);
    await shop.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Creating category failed, please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({ category: category });
};
exports.createCategory = createCategory;
exports.getCategoriesByShop = getCategoriesByShop;
exports.getCategoriesByShopAndGender = getCategoriesByShopAndGender;
exports.adminGetCategories = adminGetCategories;
exports.adminUpdateCategory = adminUpdateCategory;
