const express = require("express");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const UploadedFile = require("../models/UploadedFile");
const FileParserService = require("../services/fileParser");

const router = express.Router();

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

router.post("/upload", async (req, res) => {
  try {
    const { conversationId } = req.body;

    if (!conversationId) {
      return res.status(400).json({ error: "Conversation ID is required" });
    }

    const files = req.files;
    const results = [];

    if (files && files.file) {
      const fileList = Array.isArray(files.file) ? files.file : [files.file];

      for (const file of fileList) {
        const ext = path.extname(file.name);
        const storedFileName = `${uuidv4()}${ext}`;
        const filePath = path.join(uploadDir, storedFileName);

        await new Promise((resolve, reject) => {
          file.mv(filePath, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        const content = await FileParserService.parseAndSummarize(
          filePath,
          file.name,
        );

        const newFile = new UploadedFile({
          id: uuidv4(),
          name: file.name,
          size: file.size,
          type: file.mimetype,
          uploadTime: new Date(),
          conversationId: conversationId,
          filePath: filePath,
          content: content,
        });

        await newFile.save();
        results.push(newFile);
      }
    } else {
      const { fileName, fileType, fileSize } = req.body;
      if (fileName && fileType) {
        const newFile = new UploadedFile({
          id: uuidv4(),
          name: fileName,
          size: fileSize || 0,
          type: fileType,
          uploadTime: new Date(),
          conversationId: conversationId,
        });
        await newFile.save();
        results.push(newFile);
      }
    }

    res.json(results.length > 1 ? results : results[0]);
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/conversation/:conversationId", async (req, res) => {
  try {
    const files = await UploadedFile.find({
      conversationId: req.params.conversationId,
    });
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const file = await UploadedFile.findOneAndDelete({ id: req.params.id });
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    if (file.filePath && fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }

    res.json({ message: "File deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/content", async (req, res) => {
  try {
    const file = await UploadedFile.findOne({ id: req.params.id });
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    if (file.content) {
      res.json({ content: file.content, name: file.name, type: file.type });
    } else if (file.filePath && fs.existsSync(file.filePath)) {
      const content = await FileParserService.parseAndSummarize(
        file.filePath,
        file.name,
      );
      res.json({ content: content, name: file.name, type: file.type });
    } else {
      res.status(404).json({ error: "File content not available" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/raw", async (req, res) => {
  try {
    const file = await UploadedFile.findOne({ id: req.params.id });
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    if (file.filePath && fs.existsSync(file.filePath)) {
      res.setHeader("Content-Type", file.type || "application/octet-stream");
      res.setHeader("Content-Disposition", "inline");
      const fileStream = fs.createReadStream(file.filePath);
      fileStream.pipe(res);
    } else {
      res.status(404).json({ error: "File not available" });
    }
  } catch (error) {
    console.error("Raw file error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
