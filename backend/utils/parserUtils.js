import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

/**
 * Parses raw text from a PDF file buffer using pdfjs-dist.
 */
export async function parsePdfBuffer(buffer) {
  try {
    if (!buffer || buffer.length === 0) {
      throw new Error("Empty PDF buffer provided.");
    }

    // Convert buffer to Uint8Array for PDF.js
    const uint8Array = new Uint8Array(buffer);

    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      disableWorker: true,
      useSystemFonts: true,
    });

    const pdfDocument = await loadingTask.promise;
    let extractedText = "";

    // Loop through each page of the document
    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      
      // Combine all text items in the page
      const pageText = textContent.items
        .map((item) => item.str)
        .join(" ");

      extractedText += pageText + "\n";
    }

    const cleanText = extractedText.trim();
    if (!cleanText) {
      throw new Error("No readable text content extracted from the PDF pages.");
    }

    return cleanText;
  } catch (error) {
    console.error("PDF Parsing Utility Error:", error);
    throw new Error(`Failed to extract text from PDF document: ${error.message}`);
  }
}
