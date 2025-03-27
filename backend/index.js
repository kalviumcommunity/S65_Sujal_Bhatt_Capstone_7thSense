const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const matchRouter = require("./routes/matchRoutes");
const revenueRouter = require("./routes/revenueRoutes");
const systemRouter = require("./routes/systemRoutes");
const userRouter = require("./routes/userRoutes");
const db = require("./config/db.js")

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use("/", matchRouter);
app.use("/", revenueRouter);
app.use("/", systemRouter);
app.use("/", userRouter);

app.listen(PORT, async () => {
  try {
    await db()
    console.log(`Server running on port ${PORT}`);
  }catch(error) {
    console.log(error.message)
  }
});
