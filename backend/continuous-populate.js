async function refreshExistingTexts() {
    // Get ALL questions (both used and unused) for duplicate checking
    const existingQuestions = await Question.find({}, 'text');
    existingTexts = existingQuestions.map(q => q.text);
    console.log(`📊 Loaded ${existingTexts.length} total questions (including used ones) for duplicate checking`);
} 