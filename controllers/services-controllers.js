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
    isSoftDeleted: false,
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

const adminGetServices = async (req, res, next) => {
  let services = null;

  try {
    if (req.adminData.isAdmin) {
      services = await Service.find({ isSoftDeleted: false })
        .populate("shop")
        .populate("category")
        .sort({ createdAt: "desc" });
    } else if (req.adminData.managedShops.length > 0) {
      services = await Service.find({
        shop: { $in: [req.adminData.managedShops] },
        isSoftDeleted: false,
      })
        .populate("shop")
        .populate("category")
        .sort({ createdAt: "desc" });
    }
  } catch (err) {
    const error = new HttpError(
      "Fetching services failed, please try again later",
      500
    );
    return next(error);
  }
  if (services.length == 0) {
    const error = new HttpError(
      "Could not find a service for the provided id.",
      404
    );
    return next(error);
  }
  res.json({ services: services });
};

const adminUpdateService = async (req, res, next) => {
  const {
    serviceId,
    name,
    description,
    duration,
    slotsPattern,
    showPrice,
    shopId,
    categoryId,
    price,
  } = req.body;

  let existingService;

  try {
    existingService = await Service.findById(serviceId);
  } catch (err) {
    const error = new HttpError(
      "Fetching services failed, please try again later",
      500
    );
    return next(error);
  }
  if (!existingService) {
    const error = new HttpError(
      "Could not find a service for the provided id.",
      404
    );
    return next(error);
  }

  existingService.name = name;
  existingService.description = description;
  existingService.duration = duration;
  existingService.slotsPattern = slotsPattern;
  existingService.showPrice = showPrice;
  existingService.shopId = shopId;
  existingService.categoryId = categoryId;
  existingService.price = price;

  console.log(existingService);
  try {
    await existingService.save();
  } catch (err) {
    const error = new HttpError("Update service failed, please try again", 500);
    return next(error);
  }

  res.json({ service: existingService });
};

const getServiceById = async (req, res, next) => {
  let service;
  let serviceId = req.params.serviceId;
  try {
    service = await Service.findById(serviceId)
      .populate("shop")
      .populate("category")
      .sort({ createdAt: "desc" });
  } catch (err) {
    const error = new HttpError(
      "Fetching services failed, please try again later",
      500
    );
    return next(error);
  }
  if (!service) {
    const error = new HttpError(
      "Could not find a service for the provided id.",
      404
    );
    return next(error);
  }
  res.json({ service: service });
};

exports.createService = createService;
exports.adminGetServices = adminGetServices;
exports.adminUpdateService = adminUpdateService;
exports.getServiceById = getServiceById;
