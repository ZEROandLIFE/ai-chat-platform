import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export interface FilePreviewData {
  fileName: string;
  fileType: string;
  fileSize: number;
  content: string | ArrayBuffer | null;
  pages?: string[];
  textContent?: string;
  blobUrl?: string;
}

export class FileReaderService {
  static async readFile(file: File): Promise<FilePreviewData> {
    const fileType = file.type;
    const fileName = file.name;
    const fileSize = file.size;

    if (fileType.startsWith("image/")) {
      return this.readImage(file, fileName, fileSize, fileType);
    } else if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      return this.readPdf(file, fileName, fileSize);
    } else if (
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.endsWith(".docx")
    ) {
      return this.readWord(file, fileName, fileSize);
    } else if (fileType === "text/plain" || fileName.endsWith(".txt")) {
      return this.readText(file, fileName, fileSize);
    }

    return {
      fileName,
      fileType,
      fileSize,
      content: null,
    };
  }

  private static async readImage(
    file: File,
    fileName: string,
    fileSize: number,
    fileType: string,
  ): Promise<FilePreviewData> {
    const blobUrl = URL.createObjectURL(file);
    return {
      fileName,
      fileType,
      fileSize,
      content: null,
      blobUrl,
    };
  }

  private static async readPdf(
    file: File,
    fileName: string,
    fileSize: number,
  ): Promise<FilePreviewData> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages: string[] = [];
    let textContent = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvas,
        canvasContext: context!,
        viewport,
      }).promise;

      pages.push(canvas.toDataURL("image/png"));

      const text = await page.getTextContent();
      textContent += text.items
        .map((item: any) => item.str)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      textContent += "\n\n";
    }

    return {
      fileName,
      fileType: "application/pdf",
      fileSize,
      content: arrayBuffer,
      pages,
      textContent,
    };
  }

  private static async readWord(
    file: File,
    fileName: string,
    fileSize: number,
  ): Promise<FilePreviewData> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return {
      fileName,
      fileType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      fileSize,
      content: arrayBuffer,
      textContent: result.value,
    };
  }

  private static async readText(
    file: File,
    fileName: string,
    fileSize: number,
  ): Promise<FilePreviewData> {
    const text = await file.text();
    return {
      fileName,
      fileType: "text/plain",
      fileSize,
      content: text,
      textContent: text,
    };
  }

  static formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  static getFileIcon(fileName: string): string {
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return "📕";
      case "doc":
      case "docx":
        return "📘";
      case "txt":
        return "📄";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "🖼️";
      default:
        return "📎";
    }
  }
}
