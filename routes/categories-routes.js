const express = require("express");
const { check } = require("express-validator");

const categoriesControllers = require("../controllers/categories-controllers");

const checkAuth = require("../middleware/check-auth");
const checkSuperAdmin = require("../middleware/check-superAdmin");

const router = express.Router();
router.post("/create", categoriesControllers.createCategory);
router.get("/shop/:shopId", categoriesControllers.getCategoriesByShop);

router.use(checkAuth);
router.use(checkSuperAdmin);

module.exports = router;
