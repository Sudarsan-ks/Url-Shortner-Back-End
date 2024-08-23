const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const userRouter = require("./routers/userRouter");
const urlRouter = require("./routers/urlRouter");

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

const corsOptions = {
  origin: [process.env.CLIENT_URL, process.env.CLIENT_URL_NETLIFY],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("Welcome to URL SHORTNER");
});

app.use("/user", userRouter);
app.use("/url", urlRouter);

mongoose
  .connect(process.env.MONGO_URL,)
  .then(() => {
    console.log("MongoDB is successfully connected");
    app.listen(PORT, () => {
      console.log(`server is started on port number ${PORT}`);
    });
  });
