const express = require("express");
const { check } = require("express-validator");

const shopsControllers = require("../controllers/shops-controllers");

const checkAuth = require("../middleware/check-auth");
const checkSuperAdmin = require("../middleware/check-superAdmin");

const router = express.Router();

router.get("/", shopsControllers.getShops);

router.use(checkAuth);
router.use(checkSuperAdmin);

router.post("/create", shopsControllers.createShop);

module.exports = router;
