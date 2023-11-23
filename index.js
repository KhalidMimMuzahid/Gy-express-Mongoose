const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const port = 2223;

const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const publicRoutes = require("./routes/publicRoutes/index");
const commonRoutes = require("./routes/commonRoutes/index");
const privateRoutes = require("./routes/privateRoutes/index");
const secureRoutes = require("./routes/secureRoutes/index");
const { stakeRoiIncome } = require("./utils/stakeRoi");

const app = express();

require("dotenv").config();


const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = ["http://localhost:3000", "http://localhost:3001", "https://hashpro.network"];
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
connectDB();

// Run schedule function
stakeRoiIncome()


app.use("/public/api", publicRoutes);
app.use("/api", commonRoutes);
app.use("/private/api", privateRoutes);
app.use("/secure/api", secureRoutes);


// base API
app.get("/", (req, res) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.send("Hello Hash Pro Production!");
});

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log("Server is running at port ", port);
});
