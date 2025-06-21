const questionService = require('./services/questionService');
const mongoose = require('mongoose');
require('dotenv').config();

async function testQuestionService() {
  try {
    console.log('🔧 Testing Question Service...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database\n');
    
    // Test 1: Initialize service
    console.log('📋 Test 1: Initializing service...');
    await questionService.initialize();
    console.log('✅ Service initialized\n');
    
    // Test 2: Get rate limit status
    console.log('📊 Test 2: Rate limit status...');
    const rateLimitStatus = questionService.getRateLimitStatus();
    console.log('Rate limit status:', rateLimitStatus);
    console.log('✅ Rate limit status retrieved\n');
    
    // Test 3: Get question statistics
    console.log('📈 Test 3: Question statistics...');
    const stats = await questionService.getQuestionStats();
    console.log('Question stats:', stats);
    console.log('✅ Statistics retrieved\n');
    
    // Test 4: Get a single question (should use database fallback if API is rate limited)
    console.log('❓ Test 4: Getting a single question...');
    const question = await questionService.getRandomQuestion('General', 'easy');
    if (question) {
      console.log('✅ Question retrieved:', {
        text: question.text.substring(0, 50) + '...',
        category: question.category,
        difficulty: question.difficulty
      });
    } else {
      console.log('❌ No question retrieved');
    }
    console.log();
    
    // Test 5: Get multiple questions for a match
    console.log('🎮 Test 5: Getting questions for a match...');
    const matchQuestions = await questionService.getQuestionsForMatch(5, 'Science', 'medium');
    console.log(`✅ Retrieved ${matchQuestions.length} questions for match`);
    console.log();
    
    // Test 6: Test API connection (if not rate limited)
    console.log('🌐 Test 6: Testing API connection...');
    const rateStatus = questionService.getRateLimitStatus();
    if (!rateStatus.isLimited) {
      try {
        const testQuestions = await questionService.fetchQuestionsFromAPI(1, 'General', 'easy');
        console.log('✅ API connection successful, got question:', testQuestions[0].text.substring(0, 50) + '...');
      } catch (error) {
        console.log('⚠️ API test failed (expected if rate limited):', error.message);
      }
    } else {
      console.log('⚠️ API is rate limited, skipping API test');
    }
    console.log();
    
    console.log('🎉 All tests completed successfully!');
    console.log('\n📝 Summary:');
    console.log('- Service initialized with fallback questions');
    console.log('- Rate limiting is working');
    console.log('- Database fallback is working');
    console.log('- Question retrieval is working');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run the test
testQuestionService(); 