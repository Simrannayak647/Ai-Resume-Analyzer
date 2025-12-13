// backend/utils/pdfParser.js
import fs from 'fs/promises';
import pdf from 'pdf-parse';

export async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);

    return {
      text: data.text,
      numPages: data.numpages,
      success: true
    };
  } catch (error) {
    console.error('PDF Parsing Error:', error);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}
