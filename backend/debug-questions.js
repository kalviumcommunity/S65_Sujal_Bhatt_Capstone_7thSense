const dotenv = require("dotenv");
dotenv.config();
const mongoose = require('mongoose');
const Question = require('./models/questionModel');
const questionService = require('./services/questionService');

async function debugQuestions() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Check total questions
    const totalCount = await Question.countDocuments();
    console.log('Total questions in database:', totalCount);
    
    // Check by source
    const ollamaCount = await Question.countDocuments({source: 'ollama-mistral'});
    console.log('Ollama questions:', ollamaCount);
    
    const patternCount = await Question.countDocuments({source: 'pattern'});
    console.log('Pattern questions:', patternCount);
    
    const fallbackCount = await Question.countDocuments({source: {$exists: false}});
    console.log('Fallback questions (no source):', fallbackCount);
    
    // Check by tags to see what was generated
    const tagCounts = await Question.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\nQuestions by tags:');
    tagCounts.forEach(tag => {
      console.log(`${tag._id}: ${tag.count}`);
    });
    
    // Check recent questions
    const recentQuestions = await Question.find().sort({createdAt: -1}).limit(10);
    console.log('\nMost recent questions:');
    recentQuestions.forEach((q, i) => {
      console.log(`${i + 1}. ${q.text.substring(0, 50)}... (source: ${q.source || 'none'}, tags: ${q.tags?.join(', ') || 'none'})`);
    });
    
    // Test pattern generation
    console.log('\nTesting pattern generation...');
    const testPatterns = questionService.generatePatternQuestions(5);
    console.log(`Generated ${testPatterns.length} pattern questions`);
    testPatterns.forEach((q, i) => {
      console.log(`${i + 1}. ${q.text.substring(0, 50)}... (tags: ${q.tags?.join(', ') || 'none'})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugQuestions(); 