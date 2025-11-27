const { v4: uuid } = require('uuid');

const makeTimestamp = () => new Date().toISOString();

const defaultIdentity = {
  values: ['Authenticity', 'Growth', 'Compassion'],
  strengths: ['Curiosity', 'Empathy', 'Resilience'],
  goals: [
    'Discover communities that align with my values',
    'Maintain emotional balance during the first semester',
    'Build relationships that feel supportive'
  ],
};

const communities = [
  {
    id: uuid(),
    name: 'Mindful Makers',
    theme: 'Creative expression & mindfulness',
    description: 'Art-based prompts to explore identity with zero judgement.',
    anonymousSupported: true,
  },
  {
    id: uuid(),
    name: 'Authentic Athletes',
    theme: 'Movement & wellbeing',
    description: 'Weekly micro-challenges that focus on discipline over aesthetics.',
    anonymousSupported: false,
  },
  {
    id: uuid(),
    name: 'Study Sanctuary',
    theme: 'Academic confidence',
    description: 'Slow-paced study pods with peer mentoring for exam anxiety.',
    anonymousSupported: true,
  },
];

const mentors = [
  {
    id: uuid(),
    name: 'Desmond A',
    focus: 'Identity & belonging',
    bio: 'Second-year CS major helping freshmen find their authentic voice.',
    rate: 2.5,
    availability: ['Wed', 'Fri'],
  },
  {
    id: uuid(),
    name: 'Ray K.',
    focus: 'Stress & performance balance',
    bio: 'Peer mentor from the business school specializing in burnout prevention.',
    rate: 5,
    availability: ['Mon', 'Thu'],
  },
  {
    id: uuid(),
    name: 'Dr. Rivera',
    focus: 'Values-based decision making',
    bio: 'Resident advisor and positive-psychology practitioner.',
    rate: 3,
    availability: ['Tue', 'Sat'],
  },
];

const simulatorScenarios = [
  {
    id: uuid(),
    title: 'Party vs. Personal Project',
    pressureType: 'Social status',
    prompt:
      'Everyone in your dorm is hyped about the themed party tonight, but you promised yourself to finish a personal project that represents who you are.',
    choices: [
      'Go to the party anyway to feel included.',
      'Split the evening—finish one milestone, then join briefly.',
      'Stay in, finish the project, and plan a low-key hang tomorrow.',
    ],
  },
  {
    id: uuid(),
    title: 'Study Group Comparison Spiral',
    pressureType: 'Academic image',
    prompt:
      'Your study group keeps flexing about internships. You start to doubt your own path.',
    choices: [
      'Stay quiet and internalize the comparison.',
      'Share your authentic goals and ask for collaborative support.',
      'Excuse yourself, journal the feelings, and reach out to a mentor.',
    ],
  },
];

const store = {
  checkIns: [
    {
      id: uuid(),
      emotions: ['anxious', 'hopeful'],
      thoughts: 'Worried that I am not interesting enough to new friends.',
      triggers: ['Dorm meetup', 'Social media'],
      pressureLevel: 3,
      createdAt: makeTimestamp(),
    },
  ],
  reflections: [
    {
      id: uuid(),
      entry:
        'Noticed I mimic others to avoid conflict. Want to respond instead of react.',
      tags: ['identity', 'values'],
      createdAt: makeTimestamp(),
    },
  ],
  influenceEvents: [
    {
      id: uuid(),
      situation: 'Friends pushed me to skip class for brunch.',
      impact: 'negative',
      emotionAfter: 'guilty',
      createdAt: makeTimestamp(),
    },
  ],
  identityProfile: defaultIdentity,
  mentors,
  communities,
  simulatorScenarios,
};

module.exports = store;

