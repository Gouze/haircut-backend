const express = require("express");
const { check } = require("express-validator");

const servicesControllers = require("../controllers/services-controllers");

const checkAuth = require("../middleware/check-auth");
const checkSuperAdmin = require("../middleware/check-superAdmin");

const router = express.Router();
router.get("/get/:serviceId", servicesControllers.getServiceById);

router.use(checkAuth);
router.use(checkSuperAdmin);
router.post("/", servicesControllers.createService);

module.exports = router;
