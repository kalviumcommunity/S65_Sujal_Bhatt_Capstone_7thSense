const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const matchRouter = require("./routes/matchRoutes");
const revenueRouter = require("./routes/revenueRoutes");
const systemRouter = require("./routes/systemRoutes");
const userRouter = require("./routes/userRoutes");
const db = require("./config/db.js");
const multer = require("multer");
const path = require("path");

dotenv.config();
const app = express(); 
const PORT = process.env.PORT || 5000;

app.use(cors()); 
app.use(express.json());


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
});

const upload = multer({ storage });

app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).send("Please upload a file");
    }
    console.log(`File uploaded: ${req.file.filename}`);
    return res.status(200).send("File uploaded successfully!");
});

app.use("/", matchRouter);
app.use("/", revenueRouter);
app.use("/", systemRouter);
app.use("/", userRouter);

app.listen(PORT, async () => {
    try {
        await db();
        console.log(`Server running on port ${PORT}`);
    } catch (error) {
        console.log(error.message);
    }
});
