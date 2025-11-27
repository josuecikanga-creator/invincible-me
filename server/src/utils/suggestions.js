const groundingPrompts = [
  'Name three values you lived today, no matter how small.',
  'Breathe in for four counts, out for six, repeat five times.',
  'Text someone you trust one honest sentence about how you feel.',
  'List two boundaries you want to protect this week.',
];

const valueReminders = {
  Authenticity: 'Take an action today that reflects what you believe, not what others expect.',
  Growth: 'Discomfort can be a teacher. Note one lesson from today.',
  Compassion: 'Offer yourself the same kindness you give your closest friend.',
  Resilience: 'Progress is non-linear. Celebrate the restart.',
  Honesty: 'The most stress-free plan is usually the truthful one.',
};

const getRandomItem = (list) => list[Math.floor(Math.random() * list.length)];

const buildSuggestions = ({ emotions = [], pressureLevel = 0, identityProfile }) => {
  const nudges = [];

  if (pressureLevel >= 3) {
    nudges.push('Pause before responding. You decide the pace, not the group chat.');
  }

  if (emotions.includes('anxious') || emotions.includes('overwhelmed')) {
    nudges.push('Drop your shoulders and unclench your jaw. Your nervous system matters.');
  }

  if (identityProfile?.values?.length) {
    const featuredValue = getRandomItem(identityProfile.values);
    nudges.push(valueReminders[featuredValue] || `Revisit why ${featuredValue} sits on your values list.`);
  }

  nudges.push(getRandomItem(groundingPrompts));
  return nudges;
};

module.exports = {
  buildSuggestions,
};

