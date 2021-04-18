const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Note = require("../models/note");
const User = require("../models/user");

//
// GET BY ID
//

const getNoteById = async (req, res, next) => {
  const noteId = req.params.nid;
  let note;
  try {
    note = await Note.findById(noteId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a note",
      500
    );
    return next(error);
  }

  if (!note) {
    const error = new HttpError(
      "Could not find a note for the provided id.",
      404
    );
    return next(error);
  }
  res.json({ note: note.toObject({ getters: true }) });
};

//
// GET BY USER ID
//

const getNotesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  // let notes;
  let userWithNotes;
  try {
    userWithNotes = await User.findById(userId).populate("notes");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a note",
      500
    );
    return next(error);
  }

  if (!userWithNotes || userWithNotes.notes.length === 0) {
    return next(
      new HttpError("Could not find a notes for the provided user id.", 404)
    );
  }

  res.json({
    notes: userWithNotes.notes.map((note) => note.toObject({ getters: true })),
  });
};

const getLatestNotesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  // let notes;
  let userWithNotes;
  try {
    userWithNotes = await User.findById(userId).populate("notes");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a note",
      500
    );
    return next(error);
  }

  if (!userWithNotes || userWithNotes.notes.length === 0) {
    return next(
      new HttpError("Could not find a notes for the provided user id.", 404)
    );
  }

  res.json({
    notes: userWithNotes.notes
      .slice(0, 5)
      .map((note) => note.toObject({ getters: true })),
  });
};

const createNote = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }

  const { title, subtitle, content, customer } = req.body;
  const createdNote = new Note({
    title,
    subtitle,
    content,
    customer,
  });

  let user;

  try {
    user = await User.findById(customer);
  } catch (err) {
    const error = new HttpError("Creating place failed, please try again", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for provided id", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdNote.save({ session: sess });
    user.notes.push(createdNote);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Creating note failed, please try again.", 500);
    return next(error);
  }

  res.status(201).json({ note: createdNote });
};

const updateNote = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      HttpError("Invalid inputs passed, please check your data", 422)
    );
  }

  const { title, subtitle, content } = req.body;
  const noteId = req.params.nid;

  let note;
  try {
    note = await Note.findById(noteId);
  } catch (err) {
    const error = new HttpError(
      "Somehting went wrong, could not update note",
      500
    );
    return next(error);
  }

  note.title = title;
  note.subtitle = subtitle;
  note.content = content;

  try {
    await note.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update note",
      500
    );
    return next(error);
  }

  res.status(200).json({ note: note.toObject({ getters: true }) });
};

const deleteNote = async (req, res, next) => {
  const noteId = req.params.nid;

  let note;
  try {
    note = await Note.findById(noteId).populate("customer");
  } catch (err) {
    const error = new HttpError(
      "Somehting went wrong, could not delete note",
      500
    );
    return next(error);
  }

  if (!note) {
    const error = new HttpError("Could not find note for this id", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await note.remove({ session: sess });
    note.customer.notes.pull(note);
    await note.customer.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete note",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Deleted note" });
};

exports.getNoteById = getNoteById;
exports.getNotesByUserId = getNotesByUserId;
exports.getLatestNotesByUserId = getLatestNotesByUserId;
exports.createNote = createNote;
exports.updateNote = updateNote;
exports.deleteNote = deleteNote;
