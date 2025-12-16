// backend/test-models.js
// Run this to find which Gemini models work with your API key
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const modelsToTest = [
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash-002',
  'gemini-1.5-flash',
  'gemini-1.5-pro-latest',
  'gemini-1.5-pro-002',
  'gemini-pro',
  'gemini-2.5-flash-lite',
  'gemini-flash-1.5',
  'gemini-1.0-pro'
];

console.log('🧪 Testing Gemini Models...\n');
console.log('API Key:', process.env.GEMINI_API_KEY ? 
  '✅ Set (' + process.env.GEMINI_API_KEY.substring(0, 10) + '...)' : 
  '❌ NOT SET');
console.log('');

const results = {
  working: [],
  failed: []
};

async function testModel(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const result = await model.generateContent('Reply with: OK');
    const text = result.response.text();
    
    console.log(`✅ ${modelName.padEnd(30)} - WORKS! Response: ${text.substring(0, 20)}`);
    results.working.push(modelName);
    return true;
  } catch (error) {
    if (error.message.includes('429') || error.message.includes('quota')) {
      console.log(`⚠️  ${modelName.padEnd(30)} - RATE LIMITED (might work later)`);
      results.working.push(modelName + ' (rate limited)');
    } else if (error.message.includes('404') || error.message.includes('not found')) {
      console.log(`❌ ${modelName.padEnd(30)} - NOT FOUND (doesn't exist)`);
      results.failed.push(modelName);
    } else {
      console.log(`❌ ${modelName.padEnd(30)} - ERROR: ${error.message.substring(0, 50)}`);
      results.failed.push(modelName);
    }
    return false;
  }
}

console.log('Testing models (this may take 30-60 seconds)...\n');

for (const modelName of modelsToTest) {
  await testModel(modelName);
  // Wait 1 second between tests to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, 1000));
}

console.log('\n═══════════════════════════════════════');
console.log('📊 RESULTS:');
console.log('═══════════════════════════════════════\n');

console.log('✅ WORKING MODELS:');
if (results.working.length > 0) {
  results.working.forEach(model => {
    console.log(`   - ${model}`);
  });
  console.log('\n✨ RECOMMENDED: Use the first working model in your code!');
} else {
  console.log('   None found - check your API key');
}

console.log('\n❌ FAILED MODELS:');
if (results.failed.length > 0) {
  results.failed.forEach(model => {
    console.log(`   - ${model}`);
  });
} else {
  console.log('   None');
}

console.log('\n═══════════════════════════════════════');

if (results.working.length > 0) {
  const bestModel = results.working[0].replace(' (rate limited)', '');
  console.log('\n🎯 UPDATE YOUR CODE:');
  console.log('\nIn backend/services/geminiService.js, change to:');
  console.log('\nthis.model = genAI.getGenerativeModel({');
  console.log(`  model: '${bestModel}'`);
  console.log('});\n');
}