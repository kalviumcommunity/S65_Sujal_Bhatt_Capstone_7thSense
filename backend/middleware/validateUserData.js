const validateUserData = (user) => {
  // Ensure all required fields are present and valid
  const validatedUser = {
    ...user.toObject(),
    matchesPlayed: Math.max(0, Number(user.matchesPlayed) || 0),
    matchesWon: Math.max(0, Number(user.matchesWon) || 0),
    currentStreak: Math.max(0, Number(user.currentStreak) || 0),
    bestStreak: Math.max(0, Number(user.bestStreak) || 0),
    totalEarnings: Math.max(0, Number(user.totalEarnings) || 0),
    // Ensure picture URL is valid
    picture: user.picture || null,
    // Ensure match history is valid
    matchHistory: (user.matchHistory || []).map(match => ({
      ...match,
      score: Math.max(0, Number(match.score) || 0),
      earnings: Math.max(0, Number(match.earnings) || 0),
      date: match.date || new Date()
    }))
  };

  // Calculate win rate
  validatedUser.winRate = validatedUser.matchesPlayed > 0 
    ? Math.min(100, Math.max(0, (validatedUser.matchesWon / validatedUser.matchesPlayed) * 100))
    : 0;

  return validatedUser;
};

module.exports = validateUserData; 