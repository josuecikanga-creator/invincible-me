const anchored = [
  {
    prompt: 'Name the moment you felt most like yourself this week. What value was present?',
    reflection: 'How can you create conditions for that value to appear more often tomorrow?',
    followUp: 'Capture one sentence you can read before stressful moments.',
  },
  {
    prompt: 'Recall a time you chose your values over external pressure.',
    reflection: 'What signal told you it was the right move?',
    followUp: 'How will you protect that instinct in the next 48 hours?',
  },
];

const explorer = [
  {
    prompt: 'List three micro-moments that felt like “you” today—even if no one noticed.',
    reflection: 'What patterns can you spot across them?',
    followUp: 'Choose one to amplify tomorrow. How will you remind yourself?',
  },
  {
    prompt: 'Imagine your future self describing you to a friend. What qualities do they highlight?',
    reflection: 'Where do you already see early signs of those qualities?',
    followUp: 'What experiment helps you nurture one of them this week?',
  },
];

const base = { anchored, explorer };
const randomFrom = (items = []) => items[Math.floor(Math.random() * items.length)];

const buildLocalPrompt = ({ persona, intention, values }) => {
  const deck = base[persona] ?? anchored;
  const card = randomFrom(deck);
  const identityValue = values?.[0];

  return {
    ...card,
    anchor: identityValue || 'Authenticity',
    intention: intention || (persona === 'anchored' ? 'Stay aligned' : 'Discover patterns'),
    source: 'local',
  };
};

const ensureFetch = (...args) => {
  if (typeof fetch === 'function') {
    return fetch(...args);
  }
  return import('node-fetch').then(({ default: nodeFetch }) => nodeFetch(...args));
};

const LLM_API_URL = process.env.LLM_API_URL;
const LLM_API_KEY = process.env.LLM_API_KEY;

const callExternalProvider = async ({ persona, intention, values = [] }) => {
  if (!LLM_API_URL || !LLM_API_KEY) {
    return null;
  }

  const response = await ensureFetch(LLM_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LLM_API_KEY}`,
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content:
            'You help students stay rooted in their identities. Respond with JSON containing prompt, reflection, and followUp fields that feel like Apple Journal.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            persona,
            intention: intention || 'Ground me',
            values,
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM provider error: ${response.status}`);
  }

  const payload = await response.json();
  const data = payload?.prompt || payload?.data || payload;

  if (!data?.prompt) {
    throw new Error('LLM provider did not return a prompt field.');
  }

  return {
    prompt: data.prompt,
    reflection: data.reflection ?? 'What does this reveal about who you are?',
    followUp: data.followUp ?? 'Capture one action that keeps you anchored.',
    anchor: data.anchor ?? values?.[0] ?? 'Authenticity',
    intention: data.intention ?? intention,
    source: 'llm',
  };
};

const generatePrompt = async ({ persona = 'anchored', intention = '', values = [] }) => {
  try {
    const llmPrompt = await callExternalProvider({ persona, intention, values });
    if (llmPrompt) {
      return llmPrompt;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('[prompts] Falling back to local prompt deck:', error.message);
  }

  return buildLocalPrompt({ persona, intention, values });
};

module.exports = { generatePrompt };

