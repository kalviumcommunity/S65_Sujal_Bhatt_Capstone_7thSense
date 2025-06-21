const express = require('express');
const router = express.Router();
const questionService = require('../services/questionService');
const Question = require('../models/questionModel');
const { isAuthenticated } = require('../middleware/auth');
const ollamaService = require('../services/ollamaService');

// GET /api/questions/stats - Get question statistics
router.get('/stats', isAuthenticated, async (req, res) => {
  try {
    const totalQuestions = await Question.countDocuments();
    const easyQuestions = await Question.countDocuments({ difficulty: 'easy' });
    const mediumQuestions = await Question.countDocuments({ difficulty: 'medium' });
    const hardQuestions = await Question.countDocuments({ difficulty: 'hard' });
    const usedQuestions = await Question.countDocuments({ isUsed: true });
    const unusedQuestions = await Question.countDocuments({ isUsed: false });
    
    const ollamaStats = ollamaService.getStats();
    
    res.json({
      totalQuestions,
      easyQuestions,
      mediumQuestions,
      hardQuestions,
      usedQuestions,
      unusedQuestions,
      ollamaStats
    });
  } catch (error) {
    console.error('Error getting question stats:', error);
    res.status(500).json({ message: 'Failed to get question statistics' });
  }
});

// GET /api/questions/preload - Preload questions from API
router.post('/preload', isAuthenticated, async (req, res) => {
  try {
    const { count = 50 } = req.body;
    await questionService.preloadQuestions(count);
    res.json({ message: `Successfully preloaded ${count} questions` });
  } catch (error) {
    console.error('Error preloading questions:', error);
    res.status(500).json({ message: 'Error preloading questions' });
  }
});

// GET /api/questions/test - Test API connection
router.get('/test', isAuthenticated, async (req, res) => {
  try {
    // Check rate limit status first
    const rateLimitStatus = questionService.getRateLimitStatus();
    
    if (rateLimitStatus.isLimited) {
      return res.json({ 
        message: 'API is currently rate limited', 
        rateLimit: rateLimitStatus,
        suggestion: 'Try again later or use database questions'
      });
    }
    
    const testQuestions = await questionService.fetchQuestionsFromAPI(1, 'General', 'easy');
    res.json({ 
      message: 'API connection successful', 
      sampleQuestion: testQuestions[0],
      rateLimit: rateLimitStatus
    });
  } catch (error) {
    console.error('Error testing API:', error);
    res.status(500).json({ 
      message: 'API connection failed', 
      error: error.message,
      rateLimit: questionService.getRateLimitStatus()
    });
  }
});

// GET /api/questions/rate-limit - Get rate limit status
router.get('/rate-limit', async (req, res) => {
  try {
    const rateLimitStatus = questionService.getRateLimitStatus();
    res.json(rateLimitStatus);
  } catch (error) {
    console.error('Error getting rate limit status:', error);
    res.status(500).json({ message: 'Error fetching rate limit status' });
  }
});

// GET /api/questions/categories - Get available categories
router.get('/categories', async (req, res) => {
  try {
    const categories = Object.keys(questionService.categoryMap);
    res.json(categories);
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// GET /api/questions/difficulties - Get available difficulties
router.get('/difficulties', async (req, res) => {
  try {
    const difficulties = Object.keys(questionService.difficultyMap);
    res.json(difficulties);
  } catch (error) {
    console.error('Error getting difficulties:', error);
    res.status(500).json({ message: 'Error fetching difficulties' });
  }
});

// GET /api/questions/search - Search questions in database
router.get('/search', isAuthenticated, async (req, res) => {
  try {
    const { category, difficulty, limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    const query = { isActive: true };
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    
    const questions = await Question.find(query)
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });
    
    const total = await Question.countDocuments(query);
    
    res.json({
      questions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error searching questions:', error);
    res.status(500).json({ message: 'Error searching questions' });
  }
});

// POST /api/questions/generate - Generate a new question with Ollama
router.post('/generate', isAuthenticated, async (req, res) => {
  try {
    const { category = 'General', difficulty = 'easy' } = req.body;
    
    console.log(`🎯 Generating question: ${category} ${difficulty}`);
    
    const question = await ollamaService.generateQuestion(category, difficulty);
    
    // Save to database
    const Question = require('../models/questionModel');
    const savedQuestion = await Question.create(question);
    
    res.json({
      message: 'Question generated successfully',
      question: savedQuestion,
      source: 'ollama-mistral'
    });
  } catch (error) {
    console.error('Error generating question:', error);
    res.status(500).json({ 
      message: 'Failed to generate question',
      error: error.message 
    });
  }
});

// DELETE /api/questions/:id - Deactivate a question
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    res.json({ message: 'Question deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating question:', error);
    res.status(500).json({ message: 'Error deactivating question' });
  }
});

// PUT /api/questions/:id - Update question stats
router.put('/:id/stats', isAuthenticated, async (req, res) => {
  try {
    const { totalAnswers, correctAnswers, totalTime } = req.body;
    
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    question.updateStats(totalAnswers, correctAnswers, totalTime);
    await question.save();
    
    res.json({ message: 'Question stats updated successfully' });
  } catch (error) {
    console.error('Error updating question stats:', error);
    res.status(500).json({ message: 'Error updating question stats' });
  }
});

// GET /api/questions/test-ollama - Test Ollama connection
router.get('/test-ollama', isAuthenticated, async (req, res) => {
  try {
    const isConnected = await ollamaService.testConnection();
    
    if (isConnected) {
      res.json({ 
        message: 'Ollama connection successful',
        status: 'connected',
        model: 'mistral'
      });
    } else {
      res.status(500).json({ 
        message: 'Ollama connection failed',
        status: 'disconnected'
      });
    }
  } catch (error) {
    console.error('Error testing Ollama connection:', error);
    res.status(500).json({ 
      message: 'Failed to test Ollama connection',
      error: error.message 
    });
  }
});

// GET /api/questions/ollama-stats - Get Ollama service statistics
router.get('/ollama-stats', isAuthenticated, async (req, res) => {
  try {
    const stats = ollamaService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting Ollama stats:', error);
    res.status(500).json({ 
      message: 'Failed to get Ollama statistics',
      error: error.message 
    });
  }
});

module.exports = router; 