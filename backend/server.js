require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const connectDB = require("./config/db");

const conversationRoutes = require("./routes/conversationRoutes");
const fileRoutes = require("./routes/fileRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } }));

app.use((req, res, next) => {
  res.setHeader('X-Accel-Buffering', 'no');
  next();
});

app.use("/api/conversations", conversationRoutes);
app.use("/api/files", fileRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
