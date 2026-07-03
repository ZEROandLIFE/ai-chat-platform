const mongoose = require("mongoose");

const uploadedFileSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  size: { type: Number, required: true },
  type: { type: String, required: true },
  uploadTime: { type: Date, default: Date.now },
  conversationId: { type: String, required: true },
  filePath: { type: String },
  content: { type: String },
});

module.exports = mongoose.model("UploadedFile", uploadedFileSchema);
