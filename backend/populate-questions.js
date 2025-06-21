const dotenv = require("dotenv");
dotenv.config();
const mongoose = require('mongoose');
const Question = require('./models/questionModel');
const ollamaService = require('./services/ollamaService');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Configuration for question generation
const CONFIG = {
    questionsPerCategory: 100, // Generate 100 questions per category (increased from 50)
    categories: ['General', 'Science', 'History', 'Geography', 'Sports', 'Entertainment', 'Technology', 'Literature'],
    difficulties: ['easy', 'medium', 'hard'],
    batchSize: 20, // Generate 20 questions at a time (increased from 5)
    delayBetweenBatches: 500, // 0.5 seconds delay between batches (reduced from 2000ms)
    maxConcurrentBatches: 3, // Allow 3 batches to run concurrently
};

async function generateQuestionBatch(category, difficulty, count) {
    console.log(`🤖 Generating ${count} ${difficulty} questions for ${category}...`);
    
    const questions = [];
    const promises = [];
    
    for (let i = 0; i < count; i++) {
        const promise = ollamaService.generateQuestion(category, difficulty)
            .then(question => {
                if (question) {
                    console.log(`✅ Generated: ${question.text.substring(0, 50)}...`);
                    return question;
                }
                return null;
            })
            .catch(error => {
                console.error(`❌ Failed to generate question ${i + 1}:`, error.message);
                return null;
            });
        
        promises.push(promise);
    }
    
    const results = await Promise.all(promises);
    return results.filter(q => q !== null);
}

async function saveQuestionsToDatabase(questions) {
    console.log(`💾 Saving ${questions.length} questions to database...`);
    
    const savedQuestions = [];
    for (const question of questions) {
        try {
            const newQuestion = new Question({
                text: question.text,
                options: question.options,
                correct: question.correct,
                category: question.category,
                difficulty: question.difficulty,
                timeLimit: question.timeLimit || 7,
                isActive: true,
                source: question.source || 'ollama-mistral',
                createdAt: new Date()
            });
            
            const saved = await newQuestion.save();
            savedQuestions.push(saved);
            console.log(`💾 Saved question: ${saved._id}`);
        } catch (error) {
            console.error(`❌ Failed to save question:`, error.message);
        }
    }
    
    return savedQuestions;
}

async function populateQuestions() {
  try {
        console.log('🚀 Starting question population...');
        console.log('Configuration:', CONFIG);
        
        // Check if we already have enough questions
        const existingCount = await Question.countDocuments({ source: 'ollama-mistral', isActive: true });
        const targetCount = CONFIG.categories.length * CONFIG.difficulties.length * CONFIG.questionsPerCategory;
        
        console.log(`📊 Existing questions: ${existingCount}`);
        console.log(`🎯 Target questions: ${targetCount}`);
        
        if (existingCount >= targetCount) {
            console.log('✅ Already have enough questions!');
      return;
    }
    
        let totalGenerated = 0;
        
        for (const category of CONFIG.categories) {
            for (const difficulty of CONFIG.difficulties) {
                console.log(`\n📚 Processing ${category} - ${difficulty}`);
                
                // Check how many questions we already have for this category/difficulty
                const existingForCategory = await Question.countDocuments({
                    category: category,
                    difficulty: difficulty,
                    source: 'ollama-mistral',
        isActive: true
                });
                
                const needed = CONFIG.questionsPerCategory - existingForCategory;
                
                if (needed <= 0) {
                    console.log(`✅ Already have enough ${difficulty} questions for ${category}`);
                    continue;
                }
                
                console.log(`📝 Need ${needed} more ${difficulty} questions for ${category}`);
                
                // Generate questions in batches
                const batches = Math.ceil(needed / CONFIG.batchSize);
                
                // Process batches with concurrency control
                const batchPromises = [];
                
                for (let batch = 0; batch < batches; batch++) {
                    const batchSize = Math.min(CONFIG.batchSize, needed - (batch * CONFIG.batchSize));
                    
                    const batchPromise = (async () => {
                        console.log(`\n🔄 Batch ${batch + 1}/${batches} (${batchSize} questions)`);
                        
                        const questions = await generateQuestionBatch(category, difficulty, batchSize);
                        
                        if (questions.length > 0) {
                            const saved = await saveQuestionsToDatabase(questions);
                            console.log(`✅ Batch ${batch + 1} completed: ${saved.length} questions saved`);
                            return saved.length;
                        }
                        return 0;
                    })();
                    
                    batchPromises.push(batchPromise);
                    
                    // Control concurrency - wait if we have too many running
                    if (batchPromises.length >= CONFIG.maxConcurrentBatches) {
                        const completedCount = await Promise.race(batchPromises);
                        totalGenerated += completedCount;
                        // Remove completed promise
                        const index = batchPromises.findIndex(p => p.isFulfilled);
                        if (index > -1) batchPromises.splice(index, 1);
                    }
                    
                    // Small delay between starting batches
                    if (batch < batches - 1) {
                        await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenBatches));
                    }
                }
                
                // Wait for remaining batches
                const remainingResults = await Promise.all(batchPromises);
                totalGenerated += remainingResults.reduce((sum, count) => sum + count, 0);
            }
        }
        
        console.log(`\n🎉 Question population completed!`);
        console.log(`📊 Total questions generated: ${totalGenerated}`);
        
        // Final count
        const finalCount = await Question.countDocuments({ source: 'ollama-mistral', isActive: true });
        console.log(`📊 Total questions in database: ${finalCount}`);
    
  } catch (error) {
        console.error('❌ Error during question population:', error);
  } finally {
    await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the population script
if (require.main === module) {
populateQuestions(); 
}

module.exports = { populateQuestions }; 