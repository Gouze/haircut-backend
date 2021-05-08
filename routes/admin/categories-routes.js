const express = require("express");
const { check } = require("express-validator");

const categoriesControllers = require("../../controllers/categories-controllers");

const checkAdmin = require("../../middleware/check-admin");

const router = express.Router();
router.post("/create", categoriesControllers.createCategory);

router.use(checkAdmin);
router.post("/get", categoriesControllers.adminGetCategories);
router.post("/create", categoriesControllers.createCategory);
router.patch("/update/:catId", categoriesControllers.adminUpdateCategory);

module.exports = router;
