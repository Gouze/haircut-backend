const express = require("express");
const { check } = require("express-validator");

const notesControllers = require("../controllers/notes-controllers");

const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/:nid", notesControllers.getNoteById);

router.get("/user/:uid", notesControllers.getNotesByUserId);
router.get("/latest/user/:uid", notesControllers.getLatestNotesByUserId);

router.use(checkAuth);

router.post(
  "/",
  [
    check("title").not().isEmpty(),
    check("subtitle").isLength({ min: 5 }),
    check("content").not().isEmpty(),
  ],
  notesControllers.createNote
);

router.patch(
  "/:nid",
  [
    check("title").not().isEmpty(),
    check("subtitle").isLength({ min: 5 }),
    check("content").not().isEmpty(),
  ],
  notesControllers.updateNote
);

router.delete("/:nid", notesControllers.deleteNote);

module.exports = router;
