
/**
 * Returns a CSS gradient class based on mentor category
 */
export const getCategoryGradient = (category: string): string => {
  switch (category) {
    case 'technology': return 'from-violet-500 to-purple-700';
    case 'business': return 'from-emerald-500 to-teal-700';
    case 'creative': return 'from-pink-500 to-rose-700';
    case 'language': return 'from-blue-500 to-indigo-700';
    case 'education': return 'from-amber-500 to-orange-700';
    case 'custom': return 'from-lime-500 to-lime-700';
    default: return 'from-gray-500 to-gray-700';
  }
};

/**
 * Generate sample learning paths based on category
 */
export const generateLearningPath = (category: string): Array<{name: string}> => {
  const paths: Record<string, Array<{name: string}>> = {
    'technology': [
      { name: 'Programming Basics' },
      { name: 'Data Structures' },
      { name: 'Algorithms' },
      { name: 'Object-Oriented Programming' },
      { name: 'File Handling' },
      { name: 'Error Handling' },
      { name: 'Modules & Packages' },
      { name: 'Project Development' },
    ],
    'business': [
      { name: 'Goal Setting' },
      { name: 'Time Management' },
      { name: 'Habit Formation' },
      { name: 'Task Prioritization' },
      { name: 'Focus Techniques' },
      { name: 'Progress Tracking' },
      { name: 'Accountability Systems' },
      { name: 'Continuous Improvement' },
    ],
    'creative': [
      { name: 'Creative Foundations' },
      { name: 'Story Structure' },
      { name: 'Character Development' },
      { name: 'Scene Building' },
      { name: 'Dialog Techniques' },
      { name: 'Plot Development' },
      { name: 'Editing Skills' },
      { name: 'Publishing Guidance' },
    ],
    'language': [
      { name: 'Basic Vocabulary' },
      { name: 'Common Phrases' },
      { name: 'Grammar Fundamentals' },
      { name: 'Conversation Practice' },
      { name: 'Listening Skills' },
      { name: 'Reading Comprehension' },
      { name: 'Cultural Context' },
      { name: 'Advanced Expression' },
    ],
    'education': [
      { name: 'Key Events & Figures' },
      { name: 'Historical Context' },
      { name: 'Cultural Developments' },
      { name: 'Political Systems' },
      { name: 'Economic Factors' },
      { name: 'Social Movements' },
      { name: 'Technological Advances' },
      { name: 'Historical Analysis' },
    ],
  };
  
  return paths[category] || paths['technology'];
};
