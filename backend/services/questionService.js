const axios = require('axios');
const Question = require('../models/questionModel');
const ollamaService = require('./ollamaService');
const stringSimilarity = require('string-similarity');

class QuestionService {
  constructor() {
    // Open Trivia Database
    this.opentdbUrl = 'https://opentdb.com/api.php';
    this.categoryMap = {
      'General': 9,
      'Science': 17,
      'History': 23,
      'Geography': 22,
      'Sports': 21,
      'Entertainment': 10,
      'Literature': 11,
      'Art': 25,
      'Technology': 30,
      'Politics': 24,
      'Business': 31,
      'Economics': 32,
      'Philosophy': 33,
      'Religion': 20,
      'Mythology': 20,
      'Language': 34,
      'Food & Drink': 12,
      'Nature': 35,
      'Animals': 27,
      'Space': 36,
      'Medicine': 37,
      'Health': 38,
      'Fashion': 39,
      'Music': 12,
      'Movies': 11,
      'TV': 14,
      'Pop Culture': 40,
      'Inventions': 41,
      'Engineering': 42,
      'Law': 43,
      'Education': 44,
      'Psychology': 45,
      'Sociology': 46,
      'Current Events': 47,
      'General Knowledge': 9
    };
    this.difficultyMap = {
      'easy': 'easy',
      'medium': 'medium',
      'hard': 'hard'
    };
    
    // JService API (Jeopardy questions - 156,800+ questions)
    this.jserviceUrl = 'http://jservice.io/api/random';
    
    // Rate limiting configuration
    this.rateLimit = {
      maxRequests: 5, // Max requests per window
      windowMs: 60000, // 1 minute window
      requests: [],
      lastReset: Date.now()
    };
    
    // Retry configuration
    this.retryConfig = {
      maxRetries: 3,
      retryDelay: 2000, // 2 seconds
      backoffMultiplier: 2
    };

    this.lastApiCall = 0;
    this.rateLimitDelay = 60000; // 1 minute between API calls
    this.rateLimitResetTime = 0;
    this.preloadedQuestions = [];
    this.ollamaEnabled = true;
  }

  // Fetch questions from JService API (Jeopardy questions)
  async fetchJServiceQuestions(count = 1) {
    try {
      const questions = [];
      
      for (let i = 0; i < count; i++) {
        const response = await axios.get(`${this.jserviceUrl}?count=1`);
        
        if (response.data && response.data[0]) {
          const jeopardyQ = response.data[0];
          
          // Convert Jeopardy format to multiple choice
          const question = {
            text: jeopardyQ.question,
            options: [
              jeopardyQ.answer,
              this.generateWrongAnswer(jeopardyQ.answer),
              this.generateWrongAnswer(jeopardyQ.answer),
              this.generateWrongAnswer(jeopardyQ.answer)
            ],
            correct: jeopardyQ.answer,
            category: this.mapJServiceCategory(jeopardyQ.category?.title || 'General'),
            difficulty: this.getDifficultyFromValue(jeopardyQ.value || 200),
            timeLimit: this.getTimeLimitByDifficulty(this.getDifficultyFromValue(jeopardyQ.value || 200)),
            points: this.getPointsByDifficulty(this.getDifficultyFromValue(jeopardyQ.value || 200)),
            tags: [jeopardyQ.category?.title?.toLowerCase() || 'general', 'jeopardy'],
            isActive: true
          };
          
          // Shuffle options
          for (let j = question.options.length - 1; j > 0; j--) {
            const k = Math.floor(Math.random() * (j + 1));
            [question.options[j], question.options[k]] = [question.options[k], question.options[j]];
          }
          
          questions.push(question);
        }
      }
      
      return questions;
    } catch (error) {
      console.log('JService API failed:', error.message);
      return [];
    }
  }

  // Generate wrong answers for Jeopardy questions
  generateWrongAnswer(correctAnswer) {
    const wrongAnswers = [
      'None of the above',
      'All of the above',
      'Cannot be determined',
      'More than one answer',
      'Less than one answer'
    ];
    return wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
  }

  // Map JService category to our categories
  mapJServiceCategory(category) {
    const mapping = {
      'science': 'Science',
      'history': 'History',
      'geography': 'Geography',
      'sports': 'Sports',
      'entertainment': 'Entertainment'
    };
    
    const lowerCategory = category.toLowerCase();
    for (const [key, value] of Object.entries(mapping)) {
      if (lowerCategory.includes(key)) {
        return value;
      }
    }
    
    return 'General';
  }

  // Get difficulty from Jeopardy value
  getDifficultyFromValue(value) {
    if (value <= 200) return 'easy';
    if (value <= 400) return 'medium';
    return 'hard';
  }

  // Check if we're within rate limits
  isRateLimited() {
    const now = Date.now();
    
    // Reset window if needed
    if (now - this.rateLimit.lastReset > this.rateLimit.windowMs) {
      this.rateLimit.requests = [];
      this.rateLimit.lastReset = now;
    }
    
    // Remove old requests outside the window
    this.rateLimit.requests = this.rateLimit.requests.filter(
      time => now - time < this.rateLimit.windowMs
    );
    
    return this.rateLimit.requests.length >= this.rateLimit.maxRequests;
  }

  // Add request to rate limit tracking
  trackRequest() {
    this.rateLimit.requests.push(Date.now());
  }

  // Sleep function for delays
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Fetch questions from Open Trivia Database with rate limiting and retries
  async fetchQuestionsFromAPI(count = 10, category = null, difficulty = null) {
    let lastError;
    
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        // Check rate limit
        if (this.isRateLimited()) {
          const waitTime = this.rateLimit.windowMs - (Date.now() - this.rateLimit.lastReset);
          console.log(`Rate limited. Waiting ${waitTime}ms before retry...`);
          await this.sleep(waitTime);
        }
        
        const params = {
          amount: count,
          type: 'multiple' // Multiple choice questions
        };

        if (category && this.categoryMap[category]) {
          params.category = this.categoryMap[category];
        }

        if (difficulty && this.difficultyMap[difficulty]) {
          params.difficulty = this.difficultyMap[difficulty];
        }

        // Track this request
        this.trackRequest();
        
        console.log(`Fetching questions from API (attempt ${attempt + 1}):`, params);
        
        const response = await axios.get(this.opentdbUrl, { 
          params,
          timeout: 10000 // 10 second timeout
        });
        
        if (response.data.response_code !== 0) {
          throw new Error(`API Error: Response code ${response.data.response_code}`);
        }

        console.log(`Successfully fetched ${response.data.results.length} questions from API`);
        return this.transformAPIQuestions(response.data.results);
        
      } catch (error) {
        lastError = error;
        console.error(`API attempt ${attempt + 1} failed:`, error.message);
        
        // Handle specific error types
        if (error.response?.status === 429) {
          console.log('Rate limit exceeded, will retry with delay...');
          const retryDelay = this.retryConfig.retryDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt);
          await this.sleep(retryDelay);
          continue;
        }
        
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          console.log('Request timeout, will retry...');
          const retryDelay = this.retryConfig.retryDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt);
          await this.sleep(retryDelay);
          continue;
        }
        
        // For other errors, don't retry
        break;
      }
    }
    
    throw new Error(`Failed to fetch questions after ${this.retryConfig.maxRetries + 1} attempts: ${lastError.message}`);
  }

  // Transform API questions to match our schema
  transformAPIQuestions(apiQuestions) {
    return apiQuestions.map(apiQ => {
      // Decode HTML entities
      const decodeHTML = (text) => {
        const entities = {
          '&amp;': '&',
          '&lt;': '<',
          '&gt;': '>',
          '&quot;': '"',
          '&#039;': "'",
          '&ldquo;': '"',
          '&rdquo;': '"',
          '&lsquo;': "'",
          '&rsquo;': "'"
        };
        return text.replace(/&amp;|&lt;|&gt;|&quot;|&#039;|&ldquo;|&rdquo;|&lsquo;|&rsquo;/g, match => entities[match]);
      };

      // Shuffle options to randomize correct answer position
      const options = [...apiQ.incorrect_answers, apiQ.correct_answer];
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }

      return {
        text: decodeHTML(apiQ.question),
        options: options.map(opt => decodeHTML(opt)),
        correct: decodeHTML(apiQ.correct_answer),
        category: this.mapAPICategory(apiQ.category),
        difficulty: apiQ.difficulty,
        timeLimit: this.getTimeLimitByDifficulty(apiQ.difficulty),
        points: this.getPointsByDifficulty(apiQ.difficulty),
        tags: [apiQ.category.toLowerCase()],
        isActive: true
      };
    });
  }

  // Map API category to our category enum
  mapAPICategory(apiCategory) {
    const categoryMapping = {
      'General Knowledge': 'General',
      'Science & Nature': 'Science',
      'Science: Computers': 'Science',
      'Science: Mathematics': 'Science',
      'Science: Gadgets': 'Science',
      'History': 'History',
      'Geography': 'Geography',
      'Sports': 'Sports',
      'Entertainment: Books': 'Entertainment',
      'Entertainment: Film': 'Entertainment',
      'Entertainment: Music': 'Entertainment',
      'Entertainment: Television': 'Entertainment',
      'Entertainment: Video Games': 'Entertainment',
      'Entertainment: Board Games': 'Entertainment',
      'Entertainment: Comics': 'Entertainment',
      'Entertainment: Japanese Anime & Manga': 'Entertainment',
      'Entertainment: Cartoon & Animations': 'Entertainment',
      'Mythology': 'History',
      'Politics': 'History',
      'Art': 'Entertainment',
      'Celebrities': 'Entertainment',
      'Animals': 'Science',
      'Vehicles': 'Science'
    };

    return categoryMapping[apiCategory] || 'General';
  }

  // Get time limit based on difficulty
  getTimeLimitByDifficulty(difficulty) {
    switch (difficulty) {
      case 'easy': return 10;
      case 'medium': return 15;
      case 'hard': return 20;
      default: return 10;
    }
  }

  // Get points based on difficulty
  getPointsByDifficulty(difficulty) {
    switch (difficulty) {
      case 'easy': return 10;
      case 'medium': return 20;
      case 'hard': return 30;
      default: return 10;
    }
  }

  // Utility to check for unresolved placeholders in a question
  hasUnresolvedPlaceholders(question) {
    const placeholderRegex = /{[^}]+}/;
    if (placeholderRegex.test(question.text)) return true;
    if (placeholderRegex.test(question.correct)) return true;
    if (question.options && question.options.some(opt => placeholderRegex.test(opt))) return true;
    return false;
  }

  // New function to mark questions as used
  async markQuestionsAsUsed(questions) {
    if (!Array.isArray(questions)) {
      questions = [questions];
    }
    const questionIds = questions.map(q => q._id);
    await Question.updateMany(
      { _id: { $in: questionIds } },
      { $set: { isUsed: true } }
    );
  }

  // Get questions for a match (with enhanced fallback)
  async getQuestionsForMatch(count, category, difficulty) {
    try {
      // First try to get from API
      let apiQuestions = await this.fetchQuestionsFromAPI(count, category, difficulty);
      // Filter out questions with unresolved placeholders and used questions
      apiQuestions = apiQuestions.filter(q => !this.hasUnresolvedPlaceholders(q) && !q.isUsed);
      // Store these questions in database for future use
      const savedQuestions = await Question.insertMany(apiQuestions);
      // Mark these questions as used
      await this.markQuestionsAsUsed(savedQuestions);
      return savedQuestions;
    } catch (error) {
      console.log('API failed, falling back to database questions:', error.message);
      // Enhanced fallback to database questions
      const query = { isActive: true, isUsed: false };
      if (category) query.category = category;
      if (difficulty) query.difficulty = difficulty;
      let questions = await Question.find(query).limit(count);
      // Filter out questions with unresolved placeholders
      questions = questions.filter(q => !this.hasUnresolvedPlaceholders(q));
      // If not enough questions with specific criteria, get any available
      if (questions.length < count) {
        const remainingCount = count - questions.length;
        let additionalQuestions = await Question.find({ 
          isActive: true,
          isUsed: false,
          _id: { $nin: questions.map(q => q._id) }
        }).limit(remainingCount);
        additionalQuestions = additionalQuestions.filter(q => !this.hasUnresolvedPlaceholders(q));
        questions = [...questions, ...additionalQuestions];
      }
      // Mark these questions as used
      if (questions.length > 0) {
        await this.markQuestionsAsUsed(questions);
      }
      return questions;
    }
  }

  // Get a random question (with AI generation as primary source)
  async getRandomQuestion(category, difficulty, excludeIds = []) {
    console.log(`🔍 Getting random question: ${category} ${difficulty}`);
    
    // First, try to get a pre-generated question from the database
    console.log('📚 Looking for pre-generated questions in database...');
    const query = { 
      isActive: true,
      isUsed: false,
      _id: { $nin: excludeIds }
    };
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;

    let question = await Question.findOne(query);
    
    // Filter out unresolved placeholders
    if (question && this.hasUnresolvedPlaceholders(question)) {
      question = null;
    }
    
    // If no question with specific criteria, try without difficulty
    if (!question && difficulty) {
      delete query.difficulty;
      question = await Question.findOne(query);
      if (question && this.hasUnresolvedPlaceholders(question)) {
        question = null;
      }
    }
    
    // If still no question, try without category
    if (!question && category) {
      delete query.category;
      question = await Question.findOne(query);
      if (question && this.hasUnresolvedPlaceholders(question)) {
        question = null;
      }
    }
    
    // Last resort: get any available question
    if (!question) {
      question = await Question.findOne({ 
        isActive: true,
        isUsed: false,
        _id: { $nin: excludeIds }
      });
      if (question && this.hasUnresolvedPlaceholders(question)) {
        question = null;
      }
    }

    if (question) {
      console.log(`📚 Found pre-generated question: ${question.text.substring(0, 50)}...`);
      // Mark the question as used
      await this.markQuestionsAsUsed(question);
      return question;
    }
    
    // If no pre-generated questions available, try on-demand generation
    console.log('📚 No pre-generated questions found, trying on-demand generation...');
    console.log(`🤖 Ollama enabled: ${this.ollamaEnabled}`);
    
    // Try Ollama for on-demand generation
    if (this.ollamaEnabled) {
      try {
        console.log(`🤖 Generating question with Ollama: ${category} ${difficulty}`);
        let question;
        let duplicate = true;
        let attempts = 0;
        while (duplicate && attempts < 5) {
          question = await ollamaService.generateQuestion(category, difficulty);
          // Check for duplicate by text (case-insensitive, trimmed)
          const allQuestions = await Question.find({}, 'text');
          const texts = allQuestions.map(q => q.text.trim().toLowerCase());
          const similarityScores = stringSimilarity.findBestMatch(question.text.trim().toLowerCase(), texts);
          if (similarityScores.bestMatch.rating >= 0.85) {
            console.log('🔄 Fuzzy duplicate detected (score:', similarityScores.bestMatch.rating, '), regenerating...');
            attempts++;
          } else {
            duplicate = false;
          }
        }
        // Filter out unresolved placeholders
        if (question && !this.hasUnresolvedPlaceholders(question)) {
          // Save to database for future use
          try {
            const savedQuestion = await Question.create(question);
            console.log('✅ Question generated and saved to database');
            // Mark the question as used
            await this.markQuestionsAsUsed(savedQuestion);
            return savedQuestion;
          } catch (dbError) {
            console.error('❌ Failed to save Ollama question to database:', dbError.message);
            // Return the question object directly if we can't save it
            console.log('✅ Returning Ollama question without saving to database');
            // Mark the question as used
            await this.markQuestionsAsUsed(question);
            return question;
          }
        }
      } catch (error) {
        console.error('❌ Ollama question generation failed:', error);
        console.error('❌ Error details:', {
          message: error.message,
          stack: error.stack
        });
        // Fall back to pattern questions
      }
    } else {
      console.log('🤖 Ollama is disabled, attempting to re-enable...');
      // Try to re-enable Ollama
      const reEnabled = await this.reEnableOllama();
      if (reEnabled) {
        try {
          console.log(`🤖 Retrying question generation with Ollama: ${category} ${difficulty}`);
          const question = await ollamaService.generateQuestion(category, difficulty);
          
          // Filter out unresolved placeholders
          if (question && !this.hasUnresolvedPlaceholders(question)) {
            // Save to database for caching
            try {
              const savedQuestion = await Question.create(question);
              console.log('✅ Question generated and saved to database after re-enabling');
              // Mark the question as used
              await this.markQuestionsAsUsed(savedQuestion);
              return savedQuestion;
            } catch (dbError) {
              console.error('❌ Failed to save Ollama question to database:', dbError.message);
              console.log('✅ Returning Ollama question without saving to database');
              // Mark the question as used
              await this.markQuestionsAsUsed(question);
              return question;
            }
          }
        } catch (error) {
          console.error('❌ Ollama question generation failed after re-enabling:', error);
          this.ollamaEnabled = false; // Disable again if it fails
        }
      }
    }
    
    // Final fallback: generate pattern questions
    console.log('📚 Using pattern-generated questions as final fallback');
    const patternQuestions = this.generatePatternQuestions(1).filter(q => !this.hasUnresolvedPlaceholders(q));
    if (patternQuestions.length > 0) {
      const question = patternQuestions[0];
      console.log(`📚 Generated pattern question: ${question.text.substring(0, 50)}...`);
      // Mark the question as used
      await this.markQuestionsAsUsed(question);
      return question;
    }
    
    console.log('❌ No questions available from any source');
    return null;
  }

  // Preload questions for better performance (with multiple sources)
  async preloadQuestions(count = 50) {
    try {
      // This function is now deprecated. Fallback questions are created during initialization.
      // AI-generated questions are populated by a separate script.
      console.log('Preloading is handled by the initialization process and population scripts.');
    } catch (error) {
      console.error('Error during deprecated preloadQuestions call:', error);
    }
  }

  // Get question statistics
  async getQuestionStats() {
    const stats = await Question.aggregate([
      {
        $group: {
          _id: null,
          totalQuestions: { $sum: 1 },
          totalUsage: { $sum: '$usageCount' },
          avgSuccessRate: { $avg: '$successRate' },
          categories: { $addToSet: '$category' },
          difficulties: { $addToSet: '$difficulty' }
        }
      }
    ]);

    return stats[0] || {
      totalQuestions: 0,
      totalUsage: 0,
      avgSuccessRate: 0,
      categories: [],
      difficulties: []
    };
  }

  // Get rate limit status
  getRateLimitStatus() {
    const now = Date.now();
    const windowStart = now - this.rateLimit.windowMs;
    const recentRequests = this.rateLimit.requests.filter(time => time > windowStart);
    
    return {
      currentRequests: recentRequests.length,
      maxRequests: this.rateLimit.maxRequests,
      windowMs: this.rateLimit.windowMs,
      isLimited: this.isRateLimited(),
      nextReset: this.rateLimit.lastReset + this.rateLimit.windowMs
    };
  }

  // Create fallback questions to ensure database always has content
  async createFallbackQuestions() {
    try {
      const fallbackQuestions = [
        {
          text: "What is the capital of France?",
          options: ["Paris", "London", "Berlin", "Madrid"],
          correct: "Paris",
          category: "Geography",
          difficulty: "easy",
          timeLimit: 10,
          points: 10,
          tags: ["geography", "capitals"],
          isActive: true
        },
        {
          text: "Who painted the Mona Lisa?",
          options: ["Leonardo da Vinci", "Pablo Picasso", "Vincent van Gogh", "Claude Monet"],
          correct: "Leonardo da Vinci",
          category: "Entertainment",
          difficulty: "easy",
          timeLimit: 10,
          points: 10,
          tags: ["art", "painting"],
          isActive: true
        },
        {
          text: "What is the largest planet in our solar system?",
          options: ["Earth", "Mars", "Jupiter", "Saturn"],
          correct: "Jupiter",
          category: "Science",
          difficulty: "easy",
          timeLimit: 10,
          points: 10,
          tags: ["science", "astronomy"],
          isActive: true
        },
        {
          text: "What is the chemical symbol for water?",
          options: ["H2O", "O2", "CO2", "NaCl"],
          correct: "H2O",
          category: "Science",
          difficulty: "easy",
          timeLimit: 10,
          points: 10,
          tags: ["science", "chemistry"],
          isActive: true
        },
        {
          text: "Who wrote 'Romeo and Juliet'?",
          options: ["William Shakespeare", "Charles Dickens", "Mark Twain", "Jane Austen"],
          correct: "William Shakespeare",
          category: "Entertainment",
          difficulty: "medium",
          timeLimit: 15,
          points: 20,
          tags: ["literature", "drama"],
          isActive: true
        },
        {
          text: "Which programming language is known as the 'language of the web'?",
          options: ["JavaScript", "Python", "Java", "C++"],
          correct: "JavaScript",
          category: "Science",
          difficulty: "medium",
          timeLimit: 15,
          points: 20,
          tags: ["technology", "programming"],
          isActive: true
        },
        {
          text: "What is the largest ocean on Earth?",
          options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
          correct: "Pacific Ocean",
          category: "Geography",
          difficulty: "medium",
          timeLimit: 15,
          points: 20,
          tags: ["geography", "oceans"],
          isActive: true
        },
        {
          text: "Who discovered penicillin?",
          options: ["Alexander Fleming", "Louis Pasteur", "Marie Curie", "Albert Einstein"],
          correct: "Alexander Fleming",
          category: "Science",
          difficulty: "hard",
          timeLimit: 20,
          points: 30,
          tags: ["science", "medicine"],
          isActive: true
        },
        {
          text: "What is the currency of Japan?",
          options: ["Yen", "Won", "Ringgit", "Baht"],
          correct: "Yen",
          category: "Geography",
          difficulty: "medium",
          timeLimit: 15,
          points: 20,
          tags: ["geography", "currency"],
          isActive: true
        },
        {
          text: "Which planet is known as the Red Planet?",
          options: ["Venus", "Mars", "Jupiter", "Saturn"],
          correct: "Mars",
          category: "Science",
          difficulty: "easy",
          timeLimit: 10,
          points: 10,
          tags: ["science", "astronomy"],
          isActive: true
        },
        {
          text: "What is the capital of Australia?",
          options: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
          correct: "Canberra",
          category: "Geography",
          difficulty: "medium",
          timeLimit: 15,
          points: 20,
          tags: ["geography", "capitals"],
          isActive: true
        },
        {
          text: "Who was the first President of the United States?",
          options: ["John Adams", "Thomas Jefferson", "George Washington", "Benjamin Franklin"],
          correct: "George Washington",
          category: "History",
          difficulty: "easy",
          timeLimit: 10,
          points: 10,
          tags: ["history", "presidents"],
          isActive: true
        },
        {
          text: "What is the chemical symbol for gold?",
          options: ["Au", "Ag", "Fe", "Cu"],
          correct: "Au",
          category: "Science",
          difficulty: "easy",
          timeLimit: 10,
          points: 10,
          tags: ["science", "chemistry"],
          isActive: true
        },
        {
          text: "Which country has the largest population in the world?",
          options: ["India", "China", "United States", "Russia"],
          correct: "China",
          category: "Geography",
          difficulty: "medium",
          timeLimit: 15,
          points: 20,
          tags: ["geography", "population"],
          isActive: true
        },
        {
          text: "What is the main component of the sun?",
          options: ["Liquid lava", "Molten iron", "Hot gases", "Solid rock"],
          correct: "Hot gases",
          category: "Science",
          difficulty: "medium",
          timeLimit: 15,
          points: 20,
          tags: ["science", "astronomy"],
          isActive: true
        },
        {
          text: "Who wrote 'The Great Gatsby'?",
          options: ["F. Scott Fitzgerald", "Ernest Hemingway", "John Steinbeck", "William Faulkner"],
          correct: "F. Scott Fitzgerald",
          category: "Entertainment",
          difficulty: "medium",
          timeLimit: 15,
          points: 20,
          tags: ["literature", "novels"],
          isActive: true
        },
        {
          text: "What is the largest desert in the world?",
          options: ["Gobi Desert", "Sahara Desert", "Arabian Desert", "Antarctic Desert"],
          correct: "Antarctic Desert",
          category: "Geography",
          difficulty: "hard",
          timeLimit: 20,
          points: 30,
          tags: ["geography", "deserts"],
          isActive: true
        },
        {
          text: "What year did World War II end?",
          options: ["1943", "1944", "1945", "1946"],
          correct: "1945",
          category: "History",
          difficulty: "easy",
          timeLimit: 10,
          points: 10,
          tags: ["history", "world-war-ii"],
          isActive: true
        },
        {
          text: "What is the speed of sound in air?",
          options: ["343 m/s", "443 m/s", "243 m/s", "543 m/s"],
          correct: "343 m/s",
          category: "Science",
          difficulty: "hard",
          timeLimit: 20,
          points: 30,
          tags: ["science", "physics"],
          isActive: true
        },
        {
          text: "Which element has the chemical symbol 'O'?",
          options: ["Osmium", "Oxygen", "Oganesson", "Osmium"],
          correct: "Oxygen",
          category: "Science",
          difficulty: "easy",
          timeLimit: 10,
          points: 10,
          tags: ["science", "chemistry"],
          isActive: true
        }
      ];

      // Check if fallback questions already exist
      const existingCount = await Question.countDocuments({ tags: { $in: ["geography", "capitals"] } });
      
      if (existingCount === 0) {
        await Question.insertMany(fallbackQuestions);
        console.log('Created fallback questions in database');
      } else {
        console.log('Fallback questions already exist in database');
      }
    } catch (error) {
      console.error('Error creating fallback questions:', error);
    }
  }

  // Initialize the service with fallback questions
  async initialize() {
    console.log('Initializing question service...');
    
    // Initialize Ollama service
    if (this.ollamaEnabled) {
      try {
        await ollamaService.initialize();
        console.log('✅ Ollama service initialized successfully');
        this.ollamaEnabled = true; // Ensure it's enabled after successful init
      } catch (error) {
        console.error('❌ Failed to initialize Ollama service:', error);
        console.error('Will retry Ollama initialization on next question request');
        this.ollamaEnabled = false;
      }
    }
    
    // Create fallback questions if database is empty
    await this.createFallbackQuestions();
    
    // Preload some questions from APIs as backup
    // await this.preloadQuestions(); // This was causing a crash
    
    console.log('Question service initialized with fallback questions.');
  }

  // Re-enable Ollama service
  async reEnableOllama() {
    try {
      console.log('🔄 Attempting to re-enable Ollama service...');
      await ollamaService.initialize();
      this.ollamaEnabled = true;
      console.log('✅ Ollama service re-enabled successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to re-enable Ollama service:', error);
      this.ollamaEnabled = false;
      return false;
    }
  }
}

module.exports = new QuestionService(); 