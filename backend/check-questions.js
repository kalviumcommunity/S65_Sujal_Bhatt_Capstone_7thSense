const dotenv = require("dotenv");
dotenv.config();
const mongoose = require('mongoose');
const Question = require('./models/questionModel');

async function checkQuestions() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const totalCount = await Question.countDocuments();
    console.log('Total questions in database:', totalCount);
    
    const ollamaCount = await Question.countDocuments({source: 'ollama-mistral'});
    console.log('Ollama questions:', ollamaCount);
    
    const patternCount = await Question.countDocuments({source: 'pattern'});
    console.log('Pattern questions:', patternCount);
    
    const fallbackCount = await Question.countDocuments({source: {$exists: false}});
    console.log('Fallback questions (no source):', fallbackCount);
    
    // Show some sample questions
    const sampleQuestions = await Question.find().limit(5);
    console.log('\nSample questions:');
    sampleQuestions.forEach((q, i) => {
      console.log(`${i + 1}. ${q.text.substring(0, 50)}... (${q.source || 'no source'})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkQuestions(); 