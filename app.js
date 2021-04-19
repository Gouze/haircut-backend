const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const notesRoutes = require("./routes/notes-routes");
const usersRoutes = require("./routes/users-routes");
const timeslotsRoutes = require("./routes/timeslots-routes");
const shopsRoutes = require("./routes/shops-routes");
const calendarsRoutes = require("./routes/calendars-routes");
const categoriesRoutes = require("./routes/categories-routes");
const appointmentsRoutes = require("./routes/appointments-routes");
const servicesRoutes = require("./routes/services-routes");
const HttpError = require("./models/http-error");

const app = express();
//
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/api/notes", notesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/timeslots", timeslotsRoutes);
app.use("/api/shops", shopsRoutes);
app.use("/api/calendars", calendarsRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/appointments", appointmentsRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured!" });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.o5qzv.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    { useNewUrlParser: true }
  )
  .then(() => {
    app.listen(process.env.PORT || 5000);
  })
  .catch((err) => {
    console.log(err);
  });
