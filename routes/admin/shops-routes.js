const express = require("express");
const { check } = require("express-validator");

const shopsControllers = require("../../controllers/shops-controllers");

const checkAdmin = require("../../middleware/check-admin");

const router = express.Router();

router.use(checkAdmin);
router.get("/", shopsControllers.adminGetManagedShops);

module.exports = router;
