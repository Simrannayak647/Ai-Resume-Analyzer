// test-pdf.js
const fs = require('fs');
const pdfParse = require('pdf-parse');

console.log("Testing pdf-parse...");

// Create a test buffer
const testBuffer = Buffer.from("Test PDF content");
console.log("Buffer created:", testBuffer.length, "bytes");

// Test pdf-parse
pdfParse(testBuffer).then(data => {
  console.log("✅ pdf-parse works!");
  console.log("Text:", data.text);
  console.log("Number of pages:", data.numpages);
}).catch(err => {
  console.error("❌ Error:", err.message);
});