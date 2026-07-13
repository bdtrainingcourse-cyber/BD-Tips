const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const KNOWLEDGE_DIR = path.join(__dirname, 'bd-knowledge');
const OUTPUT_FILE = path.join(__dirname, 'api/knowledge.json');

async function extractTextFromPdf(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const parser = new pdfParse.PDFParse({ data: dataBuffer });
    const res = await parser.getText();
    return res.text;
  } catch (error) {
    console.error(`❌ Error parsing PDF ${filePath}:`, error.message);
    return '';
  }
}

async function extractTextFromDocx(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error(`❌ Error parsing DOCX ${filePath}:`, error.message);
    return '';
  }
}

function chunkText(text, sourceName) {
  // Normalize newlines and collapse multiple spaces
  const cleanText = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ');

  // Split into paragraphs/sections
  const paragraphs = cleanText.split('\n\n');
  const chunks = [];

  let currentChunk = '';
  const maxChunkLength = 1000;

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    // If paragraph is very long, split it by sentences
    if (trimmed.length > maxChunkLength) {
      const sentences = trimmed.match(/[^.!?]+[.!?]+(\s|$)/g) || [trimmed];
      for (const sentence of sentences) {
        const cleanedSentence = sentence.trim();
        if (!cleanedSentence) continue;

        if ((currentChunk + ' ' + cleanedSentence).length > maxChunkLength) {
          if (currentChunk.trim().length > 50) {
            chunks.push({
              content: currentChunk.trim(),
              source: sourceName
            });
          }
          currentChunk = cleanedSentence;
        } else {
          currentChunk += (currentChunk ? ' ' : '') + cleanedSentence;
        }
      }
    } else {
      if ((currentChunk + '\n\n' + trimmed).length > maxChunkLength) {
        if (currentChunk.trim().length > 50) {
          chunks.push({
            content: currentChunk.trim(),
            source: sourceName
          });
        }
        currentChunk = trimmed;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + trimmed;
      }
    }
  }

  if (currentChunk.trim().length > 50) {
    chunks.push({
      content: currentChunk.trim(),
      source: sourceName
    });
  }

  return chunks;
}

async function main() {
  console.log(`🔍 Reading knowledge directory: ${KNOWLEDGE_DIR}`);
  if (!fs.existsSync(KNOWLEDGE_DIR)) {
    console.error(`❌ Knowledge directory does not exist!`);
    process.exit(1);
  }

  const files = fs.readdirSync(KNOWLEDGE_DIR);
  let allChunks = [];

  for (const file of files) {
    const filePath = path.join(KNOWLEDGE_DIR, file);
    const ext = path.extname(file).toLowerCase();
    
    console.log(`📄 Processing file: ${file}`);
    let text = '';

    if (ext === '.pdf') {
      text = await extractTextFromPdf(filePath);
    } else if (ext === '.docx') {
      text = await extractTextFromDocx(filePath);
    } else if (ext === '.txt' || ext === '.md') {
      text = fs.readFileSync(filePath, 'utf8');
    } else {
      console.log(`⚠️ Skipping unsupported file extension: ${ext}`);
      continue;
    }

    if (text.trim().length === 0) {
      console.log(`⚠️ No text extracted from ${file}`);
      continue;
    }

    const fileChunks = chunkText(text, file);
    console.log(`✅ Extracted ${fileChunks.length} chunks from ${file}`);
    allChunks = allChunks.concat(fileChunks);
  }

  console.log(`✍️ Saving ${allChunks.length} total chunks to: ${OUTPUT_FILE}`);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allChunks, null, 2), 'utf8');
  console.log('🎉 Done!');
}

main().catch(console.error);
