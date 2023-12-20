require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const port = 2023;
const app = express();

const secureRoutes = require("./src/routes/secure/index");
const publicRoutes = require("./src/routes/public/index");
const commonRoutes = require("./src/routes/common/index");
const privateRoutes = require("./src/routes/private/index");

const { notFound, errorHandler } = require("./src/middleware/errorMiddleware");
const runPackageROI = require("./src/utils/runPackageROI");
const runColorPrediction = require("./src/utils/runColorPrediction");



// corsOptions


app.use((req, res, next) => {
  res.header({ "Access-Control-Allow-Origin": "*" });
  next();
});
const corsOptions = {
  origin: ["http://localhost:3000", "https://growmore.today"],
  optionsSuccessStatus: 200,
};

const middleware = [
  cors(corsOptions),
  express.json(),
  express.urlencoded({ extended: true }),
];
app.use(middleware);
connectDB();

// Run Function
runPackageROI();
//Run Color Prediction
runColorPrediction()
// Here will be custom routes

app.use("/api/v1/public", publicRoutes);
app.use("/api/v1/common", commonRoutes);
app.use("/api/v1/private", privateRoutes);
app.use("/api/v1/secure", secureRoutes);
// app.get("/api/v1/test", rankIncome)

app.get("/", (req, res) => {
  return res.send("Grow More Today Production !");
});

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log("Server is running at port ", port);
});
