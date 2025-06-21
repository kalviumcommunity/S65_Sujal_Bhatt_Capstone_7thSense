const dotenv = require("dotenv");
dotenv.config();
const mongoose = require('mongoose');
const Question = require('./models/questionModel');
const ollamaService = require('./services/ollamaService');
const stringSimilarity = require('string-similarity');
const questionService = require('./services/questionService');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

// Fast generation configuration
const FAST_CONFIG = {
    categories: Object.keys(questionService.categoryMap),
    difficulties: ['easy', 'medium', 'hard'],
    batchSize: 3, // Reduced to 3 parallel requests to minimize timeouts
    maxRetries: 3,
    retryDelay: 2000, // 2 seconds between retries
    delayBetweenBatches: 500 // Increased delay between batches
};

// Fetch all existing question texts once at the start (for performance)
let existingTexts = [];

async function refreshExistingTexts() {
    // Get ALL questions (both used and unused) for duplicate checking
    const existingQuestions = await Question.find({}, 'text');
    existingTexts = existingQuestions.map(q => q.text);
    console.log(`📊 Loaded ${existingTexts.length} total questions (including used ones) for duplicate checking`);
}

async function isDuplicateOrSimilar(newText) {
    if (existingTexts.includes(newText)) return true;
    if (existingTexts.length > 0) {
        const { bestMatch } = stringSimilarity.findBestMatch(newText, existingTexts);
        if (bestMatch.rating > 0.85) return true;
    }
    return false;
}

async function generateQuestionWithRetry(category, difficulty, retryCount = 0) {
    try {
        return await ollamaService.generateQuestion(category, difficulty);
    } catch (error) {
        if (retryCount < FAST_CONFIG.maxRetries) {
            console.log(`🔄 Retry ${retryCount + 1}/${FAST_CONFIG.maxRetries} for ${category}, ${difficulty}...`);
            await new Promise(resolve => setTimeout(resolve, FAST_CONFIG.retryDelay));
            return generateQuestionWithRetry(category, difficulty, retryCount + 1);
        }
        console.error(`❌ Failed to generate question after ${FAST_CONFIG.maxRetries} retries:`, error.message);
        return null;
    }
}

async function generateBatch() {
    const categories = FAST_CONFIG.categories;
    const difficulties = FAST_CONFIG.difficulties;

    // Generate questions in parallel with retry logic
    const promises = Array(FAST_CONFIG.batchSize).fill().map(async () => {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
        return generateQuestionWithRetry(category, difficulty);
    });

    const results = await Promise.all(promises);
    return results.filter(q => q !== null);
}

async function generateQuestionsFast() {
    console.log('🚀 Starting continuous question generation...');
    
    console.log('🤖 Initializing Ollama service...');
    await ollamaService.initialize();
    console.log('✅ Ollama service initialized successfully');
    
    await refreshExistingTexts();
    
    let saved = 0;
    let consecutiveErrors = 0;
    
    console.log(`📊 Will generate questions randomly from ${FAST_CONFIG.categories.length} categories and ${FAST_CONFIG.difficulties.length} difficulties`);
    
    while (true) {
        try {
            // Generate a batch of questions
            const questions = await generateBatch();
            
            if (questions.length === 0) {
                consecutiveErrors++;
                if (consecutiveErrors >= 5) {
                    console.log('⚠️ Too many consecutive errors, waiting for 10 seconds...');
                    await new Promise(resolve => setTimeout(resolve, 10000));
                    consecutiveErrors = 0;
                }
                continue;
            }
            
            consecutiveErrors = 0; // Reset error counter on success
            
            // Process each question in the batch
            for (const question of questions) {
                if (!question) continue;
                
                console.log(`✅ Generated: ${question.text.substring(0, 40)}... (${question.category}, ${question.difficulty})`);
                
                if (await isDuplicateOrSimilar(question.text)) {
                    console.log('🔄 Duplicate question detected, skipping...');
                    continue;
                }
                
                try {
                    const newQuestion = new Question({
                        text: question.text,
                        options: question.options,
                        correct: question.correct,
                        category: question.category,
                        difficulty: question.difficulty,
                        timeLimit: 7, // Always 7 seconds
                        isActive: true,
                        source: 'ollama-mistral',
                        createdAt: new Date(),
                        isUsed: false,
                        usageCount: 0,
                        successRate: 0
                    });
                    
                    const savedQuestion = await newQuestion.save();
                    saved++;
                    existingTexts.push(question.text);
                    console.log(`💾 [${saved}] Saved: ${savedQuestion._id}`);
                } catch (saveError) {
                    console.error(`❌ Failed to save question:`, saveError.message);
                }
            }
        } catch (error) {
            console.error('❌ Batch generation failed:', error.message);
            consecutiveErrors++;
        }
        
        // Delay between batches
        await new Promise(resolve => setTimeout(resolve, FAST_CONFIG.delayBetweenBatches));
    }
}

// Run the fast generation
if (require.main === module) {
    generateQuestionsFast()
        .catch(error => {
            console.error('❌ Fast generation failed:', error);
            process.exit(1);
        });
}

module.exports = { generateQuestionsFast }; 