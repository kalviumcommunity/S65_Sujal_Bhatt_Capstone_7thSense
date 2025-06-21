import React, { useState, useEffect } from 'react';
import axios from 'axios';

const QuestionAdmin = () => {
  const [stats, setStats] = useState(null);
  const [sourceStats, setSourceStats] = useState(null);
  const [ollamaStats, setOllamaStats] = useState(null);
  const [ollamaStatus, setOllamaStatus] = useState('unknown');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [categories, setCategories] = useState([]);
  const [difficulties, setDifficulties] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [preloadCount, setPreloadCount] = useState(50);
  const [rateLimitStatus, setRateLimitStatus] = useState(null);
  const [generatedQuestion, setGeneratedQuestion] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchUsageStats();
    fetchSourceStats();
    fetchOllamaStats();
    fetchOllamaStatus();
    fetchCategories();
    fetchDifficulties();
    fetchRateLimitStatus();
  }, []);

  const fetchRateLimitStatus = async () => {
    try {
      const response = await axios.get('/api/questions/rate-limit');
      setRateLimitStatus(response.data);
    } catch (error) {
      console.error('Error fetching rate limit status:', error);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/questions/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setMessage('Error fetching statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsageStats = async () => {
    try {
      const response = await axios.get('/api/questions/usage-stats');
      setSourceStats(response.data);
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    }
  };

  const fetchSourceStats = async () => {
    try {
      const response = await axios.get('/api/questions/source-stats');
      setSourceStats(response.data);
    } catch (error) {
      console.error('Error fetching source stats:', error);
    }
  };

  const fetchOllamaStats = async () => {
    try {
      const response = await axios.get('/api/questions/ollama-stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOllamaStats(response.data);
    } catch (error) {
      console.error('Error fetching Ollama stats:', error);
    }
  };

  const fetchOllamaStatus = async () => {
    try {
      const response = await axios.get('/api/questions/test-ollama', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOllamaStatus(response.data.status);
    } catch (error) {
      setOllamaStatus('disconnected');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/questions/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchDifficulties = async () => {
    try {
      const response = await axios.get('/api/questions/difficulties');
      setDifficulties(response.data);
    } catch (error) {
      console.error('Error fetching difficulties:', error);
    }
  };

  const testAPI = async () => {
    try {
      setLoading(true);
      setMessage('');
      const response = await axios.get('/api/questions/test');
      setMessage(`API Test: ${response.data.message}`);
      if (response.data.rateLimit) {
        setRateLimitStatus(response.data.rateLimit);
      }
      if (response.data.sampleQuestion) {
        console.log('Sample question:', response.data.sampleQuestion);
      }
    } catch (error) {
      console.error('Error testing API:', error);
      setMessage(`API Test Failed: ${error.response?.data?.message || error.message}`);
      if (error.response?.data?.rateLimit) {
        setRateLimitStatus(error.response.data.rateLimit);
      }
    } finally {
      setLoading(false);
    }
  };

  const preloadQuestions = async () => {
    try {
      setLoading(true);
      setMessage('');
      const response = await axios.post('/api/questions/preload', { count: preloadCount });
      setMessage(response.data.message);
      fetchStats(); // Refresh stats after preloading
      fetchRateLimitStatus(); // Refresh rate limit status
    } catch (error) {
      console.error('Error preloading questions:', error);
      setMessage(`Preload Failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateQuestion = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await axios.post('/api/questions/generate', {
        category: selectedCategory || 'General',
        difficulty: selectedDifficulty || 'easy'
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setGeneratedQuestion(response.data.question);
      setMessage('Question generated successfully!');
      fetchStats(); // Refresh stats
      fetchOllamaStats(); // Refresh Ollama stats
    } catch (error) {
      setMessage(`Error generating question: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen space-bg p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold space-text mb-8 text-center">
          Question Management Dashboard
        </h1>

        {/* Statistics Section */}
        <div className="space-card mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Question Statistics</h2>
          {stats ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-purple-500/20 rounded-lg p-4">
                <h3 className="text-purple-200 font-semibold">Total Questions</h3>
                <p className="text-3xl font-bold text-white">{stats.totalQuestions}</p>
              </div>
              <div className="bg-blue-500/20 rounded-lg p-4">
                <h3 className="text-blue-200 font-semibold">Total Usage</h3>
                <p className="text-3xl font-bold text-white">{stats.totalUsage}</p>
              </div>
              <div className="bg-green-500/20 rounded-lg p-4">
                <h3 className="text-green-200 font-semibold">Avg Success Rate</h3>
                <p className="text-3xl font-bold text-white">{stats.avgSuccessRate?.toFixed(1) || 0}%</p>
              </div>
              <div className="bg-yellow-500/20 rounded-lg p-4">
                <h3 className="text-yellow-200 font-semibold">Categories</h3>
                <p className="text-3xl font-bold text-white">{stats.categories?.length || 0}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-300">Loading statistics...</p>
          )}
        </div>

        {/* API Test Section */}
        <div className="space-card mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">API Connection Test</h2>
          
          {/* Rate Limit Status */}
          {rateLimitStatus && (
            <div className="mb-4 p-4 rounded-lg bg-white/5">
              <h3 className="text-lg font-semibold text-white mb-2">Rate Limit Status</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-300">Current Requests:</span>
                  <span className={`ml-2 font-bold ${rateLimitStatus.currentRequests >= rateLimitStatus.maxRequests ? 'text-red-400' : 'text-green-400'}`}>
                    {rateLimitStatus.currentRequests}/{rateLimitStatus.maxRequests}
                  </span>
                </div>
                <div>
                  <span className="text-gray-300">Window:</span>
                  <span className="ml-2 font-bold text-white">{rateLimitStatus.windowMs / 1000}s</span>
                </div>
                <div>
                  <span className="text-gray-300">Status:</span>
                  <span className={`ml-2 font-bold ${rateLimitStatus.isLimited ? 'text-red-400' : 'text-green-400'}`}>
                    {rateLimitStatus.isLimited ? 'Limited' : 'Available'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-300">Next Reset:</span>
                  <span className="ml-2 font-bold text-white">
                    {new Date(rateLimitStatus.nextReset).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              {rateLimitStatus.isLimited && (
                <p className="text-yellow-300 text-sm mt-2">
                  ⚠️ API is currently rate limited. New requests will be queued or use database fallback.
                </p>
              )}
            </div>
          )}
          
          <button
            onClick={testAPI}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Testing...' : 'Test API Connection'}
          </button>
        </div>

        {/* Preload Questions Section */}
        <div className="space-card mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Preload Questions</h2>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div>
              <label className="block text-white text-sm font-bold mb-2">
                Number of Questions
              </label>
              <input
                type="number"
                value={preloadCount}
                onChange={(e) => setPreloadCount(parseInt(e.target.value) || 50)}
                min="1"
                max="200"
                className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={preloadQuestions}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Preloading...' : 'Preload Questions'}
            </button>
          </div>
        </div>

        {/* Ollama Section */}
        <div className="space-card mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">🤖 Ollama AI Question Generator</h2>
          
          {/* Status and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-purple-500/20 rounded-lg p-4">
              <h3 className="text-purple-200 font-semibold">Connection Status</h3>
              <p className={`text-2xl font-bold ${ollamaStatus === 'connected' ? 'text-green-400' : 'text-red-400'}`}>
                {ollamaStatus === 'connected' ? '🟢 Connected' : '🔴 Disconnected'}
              </p>
            </div>
            <div className="bg-blue-500/20 rounded-lg p-4">
              <h3 className="text-blue-200 font-semibold">Questions Generated</h3>
              <p className="text-2xl font-bold text-white">{ollamaStats?.questionsGenerated || 0}</p>
            </div>
            <div className="bg-green-500/20 rounded-lg p-4">
              <h3 className="text-green-200 font-semibold">Model</h3>
              <p className="text-2xl font-bold text-white">{ollamaStats?.model || 'mistral'}</p>
            </div>
          </div>

          {/* Generate Question Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-white text-sm font-bold mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
                  <option value="">Any Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white text-sm font-bold mb-2">
                  Difficulty
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
                  <option value="">Any Difficulty</option>
                  {difficulties.map(diff => (
                    <option key={diff} value={diff}>{diff}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={generateQuestion}
                  disabled={loading || ollamaStatus !== 'connected'}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold py-2 px-4 rounded-lg transition-colors w-full"
                >
                  {loading ? '🤖 Generating...' : '🎯 Generate Question'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Question Display */}
        {generatedQuestion && (
          <div className="space-card mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">🎯 Generated Question</h2>
            <div className="bg-white/5 rounded-lg p-4 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Question:</h3>
                <p className="text-white text-lg">{generatedQuestion.text}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Options:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {generatedQuestion.options.map((option, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-2 ${
                        option === generatedQuestion.correct
                          ? 'border-green-500 bg-green-500/20'
                          : 'border-white/30 bg-white/10'
                      }`}
                    >
                      <span className="text-white font-semibold">
                        {String.fromCharCode(65 + index)}. {option}
                      </span>
                      {option === generatedQuestion.correct && (
                        <span className="ml-2 text-green-400">✓ Correct</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-300">Category:</span>
                  <span className="text-white ml-2">{generatedQuestion.category}</span>
                </div>
                <div>
                  <span className="text-gray-300">Difficulty:</span>
                  <span className="text-white ml-2">{generatedQuestion.difficulty}</span>
                </div>
                <div>
                  <span className="text-gray-300">Source:</span>
                  <span className="text-white ml-2">{generatedQuestion.source}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Message Display */}
        {message && (
          <div className="space-card">
            <h2 className="text-2xl font-bold text-white mb-4">Status</h2>
            <p className="text-white">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionAdmin; 