const express = require("express");
const { check } = require("express-validator");

const appointmentsControllers = require("../../controllers/appointments-controllers");

const checkAuth = require("../../middleware/check-auth");
const checkAdmin = require("../../middleware/check-admin");

const router = express.Router();

router.use(checkAdmin);
router.get("/shop/:shopId", appointmentsControllers.adminGetMyAppointments);
router.post("/cancel", appointmentsControllers.adminCancelAppointment);

module.exports = router;
