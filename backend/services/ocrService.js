/**
 * OCR Service Stub for server-side image processing.
 * Note: Handwriting and textbook image OCR is primary processed in the frontend 
 * via Tesseract.js to minimize server load.
 */
export async function performOcr(buffer) {
  // Stub representing server-side OCR entrypoint
  console.log("Server OCR requested (handled via client Tesseract worker)");
  return "Server OCR Stub";
}
