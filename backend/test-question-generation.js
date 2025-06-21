const questionService = require('./services/questionService');

async function testQuestionGeneration() {
  try {
    console.log('🧪 Testing question generation...');
    
    // Wait a moment for services to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test question generation
    console.log('1. Testing question generation with Ollama...');
    const question = await questionService.getRandomQuestion('Science', 'easy');
    
    if (question) {
      console.log('✅ Question generated successfully:');
      console.log('Question:', question.text);
      console.log('Options:', question.options);
      console.log('Correct:', question.correct);
      console.log('Category:', question.category);
      console.log('Difficulty:', question.difficulty);
      console.log('Source:', question.source || 'database');
    } else {
      console.log('❌ No question generated');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
  }
}

testQuestionGeneration(); 