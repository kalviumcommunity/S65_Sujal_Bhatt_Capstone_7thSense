const express = require("express");
const app = express()
const dotenv = require("dotenv");
const matchRouter = require("./routes/matchRoutes")
const revenueRouter = require("./routes/revenueRoutes")
const systemRouter = require("./routes/systemRoutes")
const userRouter = require("./routes/userRoutes")

dotenv.config();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use("/", matchRouter )
app.use("/", revenueRouter)
app.use("/", systemRouter)
app.use("/", userRouter)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
