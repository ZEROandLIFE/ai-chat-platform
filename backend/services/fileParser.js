const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

class FileParserService {
  static async parseFile(filePath, fileName) {
    const ext = path.extname(fileName).toLowerCase();

    try {
      if (ext === ".pdf") {
        return await this.parsePdf(filePath);
      } else if (ext === ".docx") {
        return await this.parseWord(filePath);
      } else if (ext === ".txt") {
        return await this.parseText(filePath);
      } else {
        return null;
      }
    } catch (error) {
      console.error("File parsing error:", error);
      return null;
    }
  }

  static async parsePdf(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    const parser = new pdfParse.PDFParse({
      data: dataBuffer,
      verbosity: pdfParse.VerbosityLevel.ERRORS,
    });
    const result = await parser.getText();
    return result && result.text ? result.text : "";
  }

  static async parseWord(filePath) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  static async parseText(filePath) {
    return fs.readFileSync(filePath, "utf-8");
  }

  static async parseAndSummarize(filePath, fileName) {
    const text = await this.parseFile(filePath, fileName);
    if (!text) return null;

    const maxLength = 8000;
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "\n\n【...文件内容过长，已截断】";
    }
    return text;
  }
}

module.exports = FileParserService;
