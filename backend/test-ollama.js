const ollamaService = require('./services/ollamaService');

async function testOllama() {
  try {
    console.log('🧪 Testing Ollama service...');
    
    // Test initialization
    console.log('1. Testing initialization...');
    await ollamaService.initialize();
    console.log('✅ Initialization successful');
    
    // Test question generation
    console.log('2. Testing question generation...');
    const question = await ollamaService.generateQuestion('Science', 'easy');
    console.log('✅ Question generated successfully:');
    console.log('Question:', question.text);
    console.log('Options:', question.options);
    console.log('Correct:', question.correct);
    console.log('Category:', question.category);
    console.log('Difficulty:', question.difficulty);
    
    // Test stats
    console.log('3. Testing stats...');
    const stats = ollamaService.getStats();
    console.log('✅ Stats:', stats);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
  }
}

testOllama(); 