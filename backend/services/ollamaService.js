const { Ollama } = require('ollama');

class OllamaService {
  constructor() {
    this.ollamaPool = Array(5).fill(null).map(() => new Ollama()); // Create a pool of 5 Ollama instances
    this.currentOllamaIndex = 0;
    this.model = 'mistral';
    this.isInitialized = false;
    this.usedQuestionHashes = new Set();
  }

  // Get next available Ollama instance in a round-robin fashion
  getNextOllama() {
    const ollama = this.ollamaPool[this.currentOllamaIndex];
    this.currentOllamaIndex = (this.currentOllamaIndex + 1) % this.ollamaPool.length;
    return ollama;
  }

  async initialize() {
    try {
      console.log('🤖 Initializing Ollama service...');
      
      // Initialize all Ollama instances in parallel
      await Promise.all(this.ollamaPool.map(async (ollama) => {
        // Check if Mistral model is available
        const models = await ollama.list();
        const mistralModel = models.models.find(m => m.name === this.model);
        
        if (!mistralModel) {
          console.log('📥 Mistral model not found. Pulling from Ollama...');
          await ollama.pull({ model: this.model });
          console.log('✅ Mistral model downloaded successfully');
        } else {
          console.log('✅ Mistral model already available');
        }
      }));
      
      this.isInitialized = true;
      console.log('🎯 Ollama service initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Ollama service:', error);
      throw error;
    }
  }

  async generateQuestion(category = 'General', difficulty = 'easy') {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const prompt = this.createPrompt(category, difficulty);
    
    try {
      console.log(`🤖 Generating ${difficulty} ${category} question...`);
      
      // Get next available Ollama instance
      const ollama = this.getNextOllama();
      
      const response = await ollama.chat({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a trivia question generator. Generate unique, engaging multiple-choice questions with exactly 4 options and 1 correct answer. Always respond in valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        options: {
          temperature: 0.8,
          top_p: 0.9,
          max_tokens: 300,
          num_predict: 300,
          top_k: 40,
          repeat_penalty: 1.1
        }
      });

      const questionData = this.parseResponse(response.message.content);
      
      if (questionData && this.isValidQuestion(questionData)) {
        // Generate hash to avoid duplicates
        const questionHash = this.generateHash(questionData.text);
        
        if (this.usedQuestionHashes.has(questionHash)) {
          console.log('🔄 Duplicate question detected, regenerating...');
          return await this.generateQuestion(category, difficulty);
        }
        
        this.usedQuestionHashes.add(questionHash);
        
        return {
          text: questionData.text,
          options: questionData.options,
          correct: questionData.correct,
          category: category,
          difficulty: difficulty,
          timeLimit: this.getTimeLimit(difficulty),
          points: this.getPoints(difficulty),
          tags: [category.toLowerCase(), difficulty],
          isActive: true,
          source: 'ollama-mistral'
        };
      } else {
        throw new Error('Invalid question format generated');
      }
    } catch (error) {
      console.error('❌ Error generating question with Ollama:', error);
      throw error;
    }
  }

  createPrompt(category, difficulty) {
    const difficultyDescriptions = {
      easy: 'simple and straightforward',
      medium: 'moderately challenging',
      hard: 'difficult and complex'
    };

    return `Generate a ${difficultyDescriptions[difficulty]} trivia question in the "${category}" category.

CRITICAL REQUIREMENTS:
- Question must be engaging and educational
- Provide exactly 4 multiple-choice options as a JSON array
- Only 1 option should be correct
- Make incorrect options plausible but clearly wrong
- Question must be factually accurate
- Keep option text concise (max 50 characters per option)
- The correct answer must be an EXACT copy of one of the options
- Do NOT use trailing commas in JSON
- Do NOT use option letters (A, B, C, D) anywhere

JSON FORMAT REQUIREMENTS:
- "options" must be an array of 4 strings: ["Option 1", "Option 2", "Option 3", "Option 4"]
- "correct" must be an exact copy of one of the options
- No trailing commas allowed
- Valid JSON only

Example format:
{
  "text": "What is the capital of France?",
  "options": ["Paris", "London", "Berlin", "Madrid"],
  "correct": "Paris"
}

Category: ${category}
Difficulty: ${difficulty}

Generate your response in the exact format above:`;
  }

  parseResponse(content) {
    try {
      // Pre-parse: Remove trailing commas and fix common JSON issues
      let jsonText = content.match(/\{[\s\S]*\}/)?.[0] || '';
      jsonText = jsonText.replace(/,\s*([}\]])/g, '$1'); // Remove trailing commas
      jsonText = jsonText.replace(/\s+/g, ' '); // Collapse whitespace
      
      const parsed = JSON.parse(jsonText);
      
      // Validate required fields
      if (!parsed.text || !parsed.options || !parsed.correct) {
        throw new Error('Missing required fields');
      }
      
      // Handle case where options is a single string instead of array
      if (typeof parsed.options === 'string') {
        console.log('✅ Converting options string to array');
        // Split by comma and clean up each option
        parsed.options = parsed.options.split(',').map(opt => opt.trim().replace(/^["']|["']$/g, ''));
      }
      
      // Ensure options is an array
      if (!Array.isArray(parsed.options)) {
        throw new Error('Options must be an array');
      }
      
      // Ensure we have exactly 4 options
      if (parsed.options.length !== 4) {
        throw new Error(`Expected 4 options, got ${parsed.options.length}`);
      }
      
      // Clean up options (remove quotes, extra spaces)
      parsed.options = parsed.options.map(opt => opt.trim().replace(/^["']|["']$/g, ''));
      
      // Handle case where correct answer is an option letter (A, B, C, D)
      let correctAnswer = parsed.correct.trim().replace(/^["']|["']$/g, '');
      if (correctAnswer.match(/^Option [A-D]$/i)) {
        const optionIndex = correctAnswer.charCodeAt(6) - 65; // Convert A=0, B=1, C=2, D=3
        if (optionIndex >= 0 && optionIndex < parsed.options.length) {
          correctAnswer = parsed.options[optionIndex];
          console.log(`✅ Fixed option letter reference: ${parsed.correct} -> ${correctAnswer}`);
        }
      }
      
      // Check if correct answer is in options (exact match)
      const foundOption = parsed.options.find(option => {
        const cleanOption = option.trim();
        return cleanOption === correctAnswer;
      });
      
      if (!foundOption) {
        console.log('Correct answer not found in options, attempting to fix...');
        // Try case-insensitive match
        const caseInsensitiveMatch = parsed.options.find(option => {
          const cleanOption = option.trim();
          return cleanOption.toLowerCase() === correctAnswer.toLowerCase();
        });
        
        if (caseInsensitiveMatch) {
          correctAnswer = caseInsensitiveMatch;
          console.log(`✅ Fixed case-insensitive match: ${correctAnswer}`);
        } else {
          // Try substring match
          const substringMatch = parsed.options.find(option => {
            const cleanOption = option.trim();
            return cleanOption.includes(correctAnswer) || correctAnswer.includes(cleanOption);
          });
          
          if (substringMatch) {
            correctAnswer = substringMatch;
            console.log(`✅ Fixed substring match: ${correctAnswer}`);
          } else {
            throw new Error('Correct answer not found in options even after fixing');
          }
        }
      }
      
      // Update the correct answer to the actual option text
      parsed.correct = correctAnswer;
      
      return parsed;
    } catch (error) {
      console.error('❌ Error parsing Ollama response:', error);
      console.log('Raw response:', content);
      return null;
    }
  }

  isValidQuestion(questionData) {
    return (
      questionData.text &&
      questionData.text.length > 10 &&
      questionData.options &&
      questionData.options.length === 4 &&
      questionData.correct &&
      questionData.options.includes(questionData.correct)
    );
  }

  generateHash(text) {
    // Simple hash function to detect duplicates
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  getTimeLimit(difficulty) {
    return 7; // Always return 7 seconds
  }

  getPoints(difficulty) {
    const points = {
      easy: 10,
      medium: 20,
      hard: 30
    };
    return points[difficulty] || 10;
  }

  async testConnection() {
    try {
      const testQuestion = await this.generateQuestion('Science', 'easy');
      console.log('✅ Ollama connection test successful');
      console.log('Sample question:', testQuestion.text);
      return true;
    } catch (error) {
      console.error('❌ Ollama connection test failed:', error);
      return false;
    }
  }

  getStats() {
    return {
      model: this.model,
      isInitialized: this.isInitialized,
      questionsGenerated: this.usedQuestionHashes.size,
      source: 'ollama-mistral'
    };
  }
}

module.exports = new OllamaService(); 