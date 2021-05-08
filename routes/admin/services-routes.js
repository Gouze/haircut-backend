const express = require("express");
const { check } = require("express-validator");

const servicesControllers = require("../../controllers/services-controllers");

const checkAdmin = require("../../middleware/check-admin");

const router = express.Router();

router.use(checkAdmin);
router.get("/", servicesControllers.adminGetServices);
router.post("/create", servicesControllers.createService);
router.post("/update", servicesControllers.adminUpdateService);

module.exports = router;
