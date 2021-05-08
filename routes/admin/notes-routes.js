const express = require("express");
const { check } = require("express-validator");

const notesControllers = require("../../controllers/notes-controllers");

const checkAdmin = require("../../middleware/check-admin");

const router = express.Router();

router.use(checkAdmin);
router.get("/user/:uid", notesControllers.getNotesByUserId);
router.get("/:nid", notesControllers.getNoteById);
router.post("/create", notesControllers.createNote);
router.patch("/update/:nid", notesControllers.updateNote);

module.exports = router;
