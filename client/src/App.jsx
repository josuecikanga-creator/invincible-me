import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:4000/api';
const defaultIdentity = { values: [], strengths: [], goals: [] };
const NAV_ITEMS = ['Home', 'Journal', 'Scenarios', 'Mentors', 'Connect', 'Profile'];

const reminderOptions = [
  { id: 'grounding', label: 'Grounding nudges' },
  { id: 'checkin', label: 'Daily check-in' },
  { id: 'scenario', label: 'Scenario practice' },
];

const moodPalette = [
  { id: 'uplifted', icon: '😊', label: 'Uplifted' },
  { id: 'steady', icon: '🙂', label: 'Steady' },
  { id: 'mixed', icon: '😐', label: 'Mixed' },
  { id: 'stressed', icon: '😣', label: 'Stressed' },
];

const personaConfigs = {
  anchored: {
    title: 'Rooted Builders',
    subtitle: 'You already know your core. Keep living it louder.',
    gradients: ['gradient-peach', 'gradient-nebula'],
    rituals: ['Re-anchor rituals', 'Micro-celebrations', 'Mentor cadence'],
  },
  explorer: {
    title: 'Curious Explorers',
    subtitle: 'You are still naming the pieces. Let curiosity guide you.',
    gradients: ['gradient-ink', 'gradient-sage'],
    rituals: ['Low-stakes experiments', 'Observation walks', 'Creative dumps'],
  },
};

const anchoredPrompts = [
  {
    title: 'Alignment trace',
    prompt: 'Where did you feel most aligned with your values today?',
    reflection: 'What part of your core values was affirmed?',
    followUp: 'Name one micro-action that keeps that feeling alive tomorrow.',
  },
  {
    title: 'Boundary keeper',
    prompt: 'Who witnessed your authenticity this week?',
    reflection: 'How did their presence support your identity?',
    followUp: 'Send them a note or plan to recreate the moment.',
  },
  {
    title: 'Peace protector',
    prompt: 'What boundary protected your peace recently?',
    reflection: 'What signal told you it was time to hold it?',
    followUp: 'Write a reminder to future-you for the next pressure moment.',
  },
];

const explorerPrompts = [
  {
    title: 'Curiosity sparks',
    prompt: 'What sparked your curiosity today?',
    reflection: 'What did that reveal about what matters to you?',
    followUp: 'Design a tiny experiment that follows the spark tomorrow.',
  },
  {
    title: 'True-moment scan',
    prompt: 'Which micro-moment felt most like you this week?',
    reflection: 'Why did it feel that way? Who were you with?',
    followUp: 'Capture three words that describe the feeling.',
  },
  {
    title: 'Value cameo',
    prompt: 'What value showed up unexpectedly this week?',
    reflection: 'Where else would you like to see it?',
    followUp: 'List one place you can invite it in the next 48 hours.',
  },
];

const collaborationFocus = ['Creative expression', 'Faith & values', 'Academic flow', 'Wellbeing rituals', 'Leadership sparks'];

const pickPrompt = (mode) => {
  const source = mode === 'anchored' ? anchoredPrompts : explorerPrompts;
  return source[Math.floor(Math.random() * source.length)];
};

const trueSelfOptions = ['Yes', 'Somewhat', 'No'];
const accountOptions = ['Email', 'Phone', 'University email'];

const csvToArray = (value = '') =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const fetchJSON = async (path, options) => {
  const response = await fetch(`${API_BASE}${path}`, options);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }
  return response.json();
};

function App() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [saving, setSaving] = useState('');

  const [summary, setSummary] = useState(null);
  const [checkIns, setCheckIns] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [identity, setIdentity] = useState(defaultIdentity);
  const [identityForm, setIdentityForm] = useState({ values: '', strengths: '', goals: '' });
  const [mentors, setMentors] = useState([]);
  const [communities, setCommunities] = useState([]);

  const [personaMode, setPersonaMode] = useState('anchored');
  const [spotlightPrompt, setSpotlightPrompt] = useState(() => pickPrompt('anchored'));
  const [matchingForm, setMatchingForm] = useState({
    interests: '',
    values: '',
    highlight: '',
    preferAnonymous: true,
  });
  const [matchStatus, setMatchStatus] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const [journalTitle, setJournalTitle] = useState('');
  const [journalBody, setJournalBody] = useState('');

  const [selectedScenario, setSelectedScenario] = useState(null);
  const [scenarioChoice, setScenarioChoice] = useState('');
  const [scenarioResult, setScenarioResult] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMentor, setSelectedMentor] = useState(null);

  const [moodSelection, setMoodSelection] = useState('');
  const [trueSelf, setTrueSelf] = useState('');
  const [moodNote, setMoodNote] = useState('');

  const [activeScreen, setActiveScreen] = useState('Home');

  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [accountOption, setAccountOption] = useState('Email');
  const [onboardingForm, setOnboardingForm] = useState({
    values: '',
    goals: '',
    concerns: '',
    reminders: [],
  });

  const refreshSummary = async () => {
    const data = await fetchJSON('/summary');
    setSummary(data);
  };

  useEffect(() => {
    const boot = async () => {
      try {
        const [summaryData, checkInData, reflectionData, identityData, mentorData, simulatorData, communityData] = await Promise.all([
          fetchJSON('/summary'),
          fetchJSON('/checkins'),
          fetchJSON('/reflections'),
          fetchJSON('/identity'),
          fetchJSON('/mentors'),
          fetchJSON('/simulator'),
          fetchJSON('/communities'),
        ]);

        setSummary(summaryData);
        setCheckIns(checkInData);
        setReflections(reflectionData);
        setIdentity(identityData);
        setMentors(mentorData);
        setSelectedScenario(simulatorData[0]);
        setCommunities(communityData);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    boot();
  }, []);

  useEffect(() => {
    if (identity) {
      setIdentityForm({
        values: identity.values?.join(', ') || '',
        strengths: identity.strengths?.join(', ') || '',
        goals: identity.goals?.join(', ') || '',
      });
    }
  }, [identity]);

  useEffect(() => {
    setMatchingForm((prev) => {
      if (prev.values) {
        return prev;
      }
      const nextValues = identity?.values?.slice(0, 2).join(', ') || '';
      const highlight = identity?.goals?.[0] ?? prev.highlight;
      if (!nextValues && !highlight) {
        return prev;
      }
      return {
        ...prev,
        values: nextValues || prev.values,
        highlight,
      };
    });
  }, [identity]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('invincible-onboarded');
    if (stored === 'true') {
      setHasOnboarded(true);
    }
  }, []);

  const refreshSpotlightPrompt = useCallback(
    async (intention = '', recordMessage = false) => {
      const fallback = pickPrompt(personaMode);
      if (!recordMessage) {
        setSpotlightPrompt(fallback);
      }

      try {
        if (recordMessage) {
          setChatLoading(true);
        }
        const { prompt } = await fetchJSON('/ai/prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            persona: personaMode,
            intention,
            values: identity?.values || [],
          }),
        });
        setSpotlightPrompt(prompt);
        if (recordMessage) {
          setChatMessages((prev) => [
            ...prev,
            {
              id: `${Date.now()}-assistant`,
              role: 'assistant',
              text: prompt.prompt,
              detail: prompt,
            },
          ]);
        }
      } catch (error) {
        setSpotlightPrompt(fallback);
        if (recordMessage) {
          setChatMessages((prev) => [
            ...prev,
            {
              id: `${Date.now()}-fallback`,
              role: 'assistant',
              text: fallback.prompt,
              detail: fallback,
            },
          ]);
          setErrorMessage(error.message);
        }
      } finally {
        if (recordMessage) {
          setChatLoading(false);
        }
      }
    },
    [personaMode, identity],
  );

  useEffect(() => {
    if (!loading) {
      refreshSpotlightPrompt();
    }
  }, [loading, refreshSpotlightPrompt]);

  useEffect(() => {
    if (!chatMessages.length && spotlightPrompt) {
      setChatMessages([
        {
          id: 'seed',
          role: 'assistant',
          text: spotlightPrompt.prompt,
          detail: spotlightPrompt,
        },
      ]);
    }
  }, [chatMessages.length, spotlightPrompt]);

  const handleChatSubmit = async (event) => {
    event.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed) {
      await refreshSpotlightPrompt('Give me a gentle prompt', true);
      return;
    }

    setChatMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-user`,
        role: 'user',
        text: trimmed,
      },
    ]);
    setChatInput('');
    await refreshSpotlightPrompt(trimmed, true);
  };

  const latestReflections = useMemo(() => reflections.slice(0, 3), [reflections]);
  const filteredMentors = useMemo(
    () =>
      mentors.filter((mentor) => mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) || mentor.focus.toLowerCase().includes(searchTerm.toLowerCase())),
    [mentors, searchTerm],
  );
  const personaAccent = useMemo(() => personaConfigs[personaMode], [personaMode]);
  const studioTracks = useMemo(() => {
    const ritualSet = personaAccent.rituals;
    return [
      {
        title: personaMode === 'anchored' ? 'Integrity Studio' : 'Discovery Studio',
        description:
          personaMode === 'anchored'
            ? 'Protect the rituals that keep you rooted. Document what worked.'
            : 'Name the sparks that feel like you. Trace the pattern.',
        focus: ritualSet[0],
        micro: personaMode === 'anchored' ? 'Celebrate one aligned decision' : 'Capture one curiosity trail',
      },
      {
        title: personaMode === 'anchored' ? 'Alignment Field Notes' : 'Exploration Field Notes',
        description:
          personaMode === 'anchored'
            ? 'Log campus moments where you stayed true to yourself.'
            : 'Experiment with low-stakes identity try-ons.',
        focus: ritualSet[1],
        micro: personaMode === 'anchored' ? 'Share the win with future-self' : 'What did you notice?',
      },
    ];
  }, [personaAccent, personaMode]);

  const communityMatches = useMemo(() => {
    if (!communities.length) return [];
    const valueTokens = (matchingForm.values || '')
      .split(',')
      .map((token) => token.trim().toLowerCase())
      .filter(Boolean);

    return communities
      .map((community) => {
        const theme = `${community.theme} ${community.description}`.toLowerCase();
        const score = valueTokens.reduce((total, token) => (theme.includes(token) ? total + 1 : total), 0);
        return {
          ...community,
          score: personaMode === 'anchored' ? score + 1 : score,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [communities, matchingForm.values, personaMode]);

  const handleMoodSubmit = async (event) => {
    event.preventDefault();
    if (!moodSelection || !trueSelf) {
      setErrorMessage('Select a mood and reflect on authenticity.');
      return;
    }
    setSaving('mood');
    setErrorMessage('');

    try {
      const pressureLevel = trueSelf === 'Yes' ? 1 : trueSelf === 'Somewhat' ? 2 : 4;
      const payload = {
        emotions: [moodSelection],
        thoughts: moodNote || 'Quick check-in',
        triggers: ['Daily pulse'],
        pressureLevel,
      };

      const result = await fetchJSON('/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setCheckIns((prev) => [result.checkIn, ...prev]);
      setMoodSelection('');
      setTrueSelf('');
      setMoodNote('');
      await refreshSummary();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSaving('');
    }
  };

  const handleJournalSubmit = async (event) => {
    event.preventDefault();
    setSaving('journal');
    setErrorMessage('');

    try {
      const reflection = await fetchJSON('/reflections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entry: `${journalTitle || 'Untitled'} — ${journalBody}`,
          tags: ['journal'],
        }),
      });

      setReflections((prev) => [reflection, ...prev]);
      setJournalTitle('');
      setJournalBody('');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSaving('');
    }
  };

  const handleIdentitySave = async (event) => {
    event.preventDefault();
    setSaving('identity');
    setErrorMessage('');

    try {
      const updated = await fetchJSON('/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          values: csvToArray(identityForm.values),
          strengths: csvToArray(identityForm.strengths),
          goals: csvToArray(identityForm.goals),
        }),
      });
      setIdentity(updated);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSaving('');
    }
  };

  const handleScenarioChoice = (choice, index) => {
    setScenarioChoice(choice);
    if (index > 0) {
      setScenarioResult('Limited Access · Upgrade to unlock this scenario outcome.');
    } else {
      setScenarioResult(`You chose: ${choice}. Notice how this keeps you aligned with your values.`);
    }
  };

  const handleMatchingSubmit = (event) => {
    event.preventDefault();
    if (!matchingForm.interests.trim() || !matchingForm.values.trim()) {
      setMatchStatus('Share at least one interest and value to request a match.');
      return;
    }
    const topCommunity = communityMatches[0];
    setMatchStatus(
      topCommunity
        ? `Signal sent. Watch for intros from ${topCommunity.name}.`
        : 'Signal sent. We will notify you when peers are available.',
    );
  };

  const handleOnboardingIdentity = async (event) => {
    event.preventDefault();
    setSaving('onboarding');
    setErrorMessage('');

    try {
      await fetchJSON('/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          values: csvToArray(onboardingForm.values),
          goals: csvToArray(onboardingForm.goals),
          strengths: identity.strengths,
        }),
      });
      setOnboardingStep(3);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSaving('');
    }
  };

  const completeOnboarding = () => {
    setHasOnboarded(true);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('invincible-onboarded', 'true');
    }
  };

  const growthScore = Math.min(95, (summary?.totalCheckIns || 0) * 7 + 35);
  const streak = checkIns.length;

  const personaAffirmations = useMemo(() => {
    const anchorScore = Math.min(100, (identity?.values?.length || 1) * 15 + streak * 3);
    const explorationScore = Math.min(12, reflections.length + checkIns.length);
    return personaMode === 'anchored'
      ? [
          { label: 'Alignment score', value: `${anchorScore}%` },
          { label: 'Values repeated this week', value: `${(summary?.identityAnchors?.length ?? 0) || 3}` },
        ]
      : [
          { label: 'Discovery sparks', value: `${explorationScore} clues` },
          { label: 'New values logged', value: `${identity?.values?.length ?? 0}` },
        ];
  }, [personaMode, identity, streak, reflections.length, checkIns.length, summary]);

  const journeyCopy = useMemo(
    () =>
      personaMode === 'anchored'
        ? {
            heroTitle: 'Let everyone meet the real you.',
            description: 'Ground yourself in rituals, boundary check-ins, and reflective prompts that keep your values loud.',
            cta: 'Protect your rituals',
          }
        : {
            heroTitle: 'Discover the threads that make you, you.',
            description: 'Collect micro-moments, ask better questions, and let guided prompts help you name emerging values.',
            cta: 'Explore your identity',
          },
    [personaMode],
  );

  const highlightedValues = identity?.values?.slice(0, 2).join(' · ') || 'Add your values';

  const onboardingScreens = () => {
    if (onboardingStep === 1) {
      return (
        <div className="onboarding-card">
          <p className="logo-placeholder">IME</p>
          <h2>Welcome to Invincible Me</h2>
          <p>Track your identity, mood, and mentorship journey with calm clarity.</p>
          <button className="primary" type="button" onClick={() => setOnboardingStep(2)}>
            Get started
          </button>
        </div>
      );
    }

    if (onboardingStep === 2) {
      return (
        <form className="onboarding-card" onSubmit={handleOnboardingIdentity}>
          <div className="onboarding-progress">2 / 3 · Personalize</div>
          <label>
            Values you live by
            <input
              value={onboardingForm.values}
              onChange={(event) => setOnboardingForm({ ...onboardingForm, values: event.target.value })}
              placeholder="Authenticity, Courage"
              required
            />
          </label>
          <label>
            Identity goals
            <input
              value={onboardingForm.goals}
              onChange={(event) => setOnboardingForm({ ...onboardingForm, goals: event.target.value })}
              placeholder="Stay true in new friends, speak up more"
            />
          </label>
          <label>
            Current concerns
            <textarea
              value={onboardingForm.concerns}
              onChange={(event) => setOnboardingForm({ ...onboardingForm, concerns: event.target.value })}
              placeholder="Competition, comparison, burnout..."
            />
          </label>
          <div>
            <p>Preferred reminders</p>
            <div className="checkbox-grid">
              {reminderOptions.map((option) => (
                <label key={option.id} className="checkbox">
                  <input
                    type="checkbox"
                    checked={onboardingForm.reminders.includes(option.id)}
                    onChange={() => {
                      setOnboardingForm((prev) => {
                        const exists = prev.reminders.includes(option.id);
                        return {
                          ...prev,
                          reminders: exists
                            ? prev.reminders.filter((id) => id !== option.id)
                            : [...prev.reminders, option.id],
                        };
                      });
                    }}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
          <button className="primary" type="submit" disabled={saving === 'onboarding'}>
            {saving === 'onboarding' ? 'Saving...' : 'Continue'}
          </button>
        </form>
      );
    }

    return (
      <div className="onboarding-card">
        <div className="onboarding-progress">3 / 3 · Account</div>
        <p>Select how you want to sign in.</p>
        <div className="account-options">
          {accountOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={accountOption === option ? 'active' : ''}
              onClick={() => setAccountOption(option)}
            >
              {option}
            </button>
          ))}
        </div>
        <button className="primary" type="button" onClick={completeOnboarding}>
          Continue to dashboard
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <main className="app-shell">
        <p>Loading Invincible Me...</p>
      </main>
    );
  }

  const renderHome = () => (
    <section className="screen home-screen">
      <div className="hero-layout glass">
        <div className="hero-copy-block">
          <p className="pill">Identity OS</p>
          <h1>{journeyCopy.heroTitle}</h1>
          <p className="lede">{journeyCopy.description}</p>
          <div className="hero-actions">
            <button className="primary" type="button" onClick={() => setActiveScreen('Journal')}>
              Start a reflection
            </button>
            <button className="ghost" type="button" onClick={() => refreshSpotlightPrompt()}>
              New prompt
            </button>
          </div>
          <div className="hero-meta">
            <div>
              <p className="micro">Identity streak</p>
              <strong>{streak} days</strong>
            </div>
            <div>
              <p className="micro">Anchors today</p>
              <strong>{highlightedValues}</strong>
            </div>
          </div>
        </div>
        <div className="hero-panel glass">
          <p className="micro">Grounding overview</p>
          <h2>{summary?.totalCheckIns ?? 0} guided check-ins</h2>
          <p>
            {summary?.negativeInfluence ?? 0} pressure flags · {summary?.stressSignals ?? 0} stress signals
          </p>
          <div className="hero-panel-grid">
            {personaAffirmations.map((item) => (
              <div key={item.label} className="affirmation-chip">
                <p className="micro">{item.label}</p>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="section-block identity-mode-section">
        <div className="section-heading">
          <p className="micro">Personalized focus</p>
          <h3>Choose the journey that mirrors where you are.</h3>
        </div>
        <div className="identity-mode-grid compact">
          {Object.entries(personaConfigs).map(([mode, config]) => (
            <button
              key={mode}
              type="button"
              className={`identity-mode-card ${config.gradients[0]} ${personaMode === mode ? 'active' : ''}`}
              onClick={() => setPersonaMode(mode)}
            >
              <div>
                <p className="micro">{mode === 'anchored' ? 'Identity builders' : 'Identity explorers'}</p>
                <h3>{config.title}</h3>
                <p>{config.subtitle}</p>
              </div>
              <span>{personaMode === mode ? 'Selected' : 'Tap to focus'}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading section-heading--inline">
          <div>
            <p className="micro">Daily grounding</p>
            <h3>Stay rooted with prompts, check-ins, and coaching.</h3>
          </div>
          <button type="button" className="ghost" onClick={() => setActiveScreen('Journal')}>
            Open journal
          </button>
        </div>
        <div className="focus-grid">
          <article className="canvas-card glass prompt-card">
            <p className="micro">{spotlightPrompt.title || 'Identity prompt'}</p>
            <h3>{spotlightPrompt.prompt}</h3>
            <p>{spotlightPrompt.reflection}</p>
            <p className="note">{spotlightPrompt.followUp}</p>
            <div className="prompt-actions">
              <button className="secondary" type="button" onClick={() => refreshSpotlightPrompt()}>
                Shuffle prompt
              </button>
              <button className="link" type="button" onClick={() => setActiveScreen('Journal')}>
                Journal now →
              </button>
            </div>
          </article>

          <article className="canvas-card glass checkin-card">
            <p className="micro">Daily grounding check-in</p>
            <form className="stack" onSubmit={handleMoodSubmit}>
              <div className="mood-picker">
                {moodPalette.map((mood) => (
                  <button
                    key={mood.id}
                    type="button"
                    className={moodSelection === mood.id ? 'active' : ''}
                    onClick={() => setMoodSelection(mood.id)}
                  >
                    <span>{mood.icon}</span>
                    <small>{mood.label}</small>
                  </button>
                ))}
              </div>
              <div className="true-self-options">
                <p>Did you feel true to yourself today?</p>
                <div>
                  {trueSelfOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={trueSelf === option ? 'active' : ''}
                      onClick={() => setTrueSelf(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={moodNote}
                onChange={(event) => setMoodNote(event.target.value)}
                placeholder={personaMode === 'anchored' ? 'Where did you hold your ground?' : 'What did you learn about yourself?'}
              />
              <button className="primary" type="submit" disabled={saving === 'mood'}>
                {saving === 'mood' ? 'Submitting...' : 'Share pulse'}
              </button>
            </form>
          </article>

          <article className="canvas-card glass ai-card">
            <div className="section-heading">
              <p className="micro">AI prompt companion</p>
              <h4>Describe what you need support with.</h4>
            </div>
            <div className="companion-feed">
              {chatMessages.length ? (
                <ul>
                  {chatMessages.slice(-4).map((message) => (
                    <li key={message.id} className={`chat-message ${message.role}`}>
                      <p>{message.text}</p>
                      {message.detail && <small>{message.detail.followUp}</small>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="note">Tell the companion what kind of prompt you need (e.g. “I’m doubting my abilities”).</p>
              )}
            </div>
            <form className="chat-form" onSubmit={handleChatSubmit}>
              <input
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Ask for a prompt about..."
              />
              <button className="primary" type="submit" disabled={chatLoading}>
                {chatLoading ? 'Shaping...' : 'Generate'}
              </button>
            </form>
          </article>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <p className="micro">Identity studios</p>
          <h3>Build rhythms that keep you centered.</h3>
        </div>
        <div className="studio-strip">
          {studioTracks.map((track) => (
            <article key={track.title} className="studio-card glass">
              <div>
                <p className="micro">{track.focus}</p>
                <h4>{track.title}</h4>
                <p>{track.description}</p>
              </div>
              <p className="tag">{track.micro}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <p className="micro">Navigate with intention</p>
          <h3>Choose what you need next.</h3>
        </div>
        <div className="secondary-grid">
          <button type="button" className="secondary-card glass" onClick={() => setActiveScreen('Journal')}>
            <p className="micro">Reflection journal</p>
            <h4>Keep a note that locks your values in.</h4>
          </button>
          <button type="button" className="secondary-card glass" onClick={() => setActiveScreen('Scenarios')}>
            <p className="micro">Scenario studio</p>
            <h4>Rehearse peer-pressure moments in calm mode.</h4>
          </button>
          <button type="button" className="secondary-card glass" onClick={() => setActiveScreen('Connect')}>
            <p className="micro">Identity collaborations</p>
            <h4>Find students who mirror your values.</h4>
            <div className="chip-row">
              {collaborationFocus.slice(0, 3).map((focus) => (
                <span key={focus} className="chip">
                  {focus}
                </span>
              ))}
            </div>
          </button>
          <button type="button" className="secondary-card glass" onClick={() => setActiveScreen('Mentors')}>
            <p className="micro">Mentor marketplace</p>
            <h4>Book upper-years who keep you accountable.</h4>
          </button>
        </div>
      </section>
    </section>
  );

  const renderJournal = () => (
    <section className="screen journal-screen">
      <div className="panel glass">
        <div className="section-heading">
          <p className="micro">Reflection Journal</p>
          <h3>Capture what shifted</h3>
        </div>
        <form className="stack" onSubmit={handleJournalSubmit}>
          <input
            value={journalTitle}
            onChange={(event) => setJournalTitle(event.target.value)}
            placeholder="Entry title"
            required
          />
          <textarea
            value={journalBody}
            onChange={(event) => setJournalBody(event.target.value)}
            placeholder="What happened? What did it pull away from?"
            required
          />
            <button className="primary" type="submit" disabled={saving === 'journal'}>
              {saving === 'journal' ? 'Saving...' : 'Save entry'}
            </button>
        </form>
      </div>
      <div className="panel glass">
        <div className="section-heading">
          <p className="micro">Recent entries</p>
        </div>
        <ul className="list reflections">
          {latestReflections.map((reflection) => (
            <li key={reflection.id}>
              <p>{reflection.entry}</p>
              <p className="tag">{new Date(reflection.createdAt).toLocaleDateString()}</p>
            </li>
          ))}
          {!latestReflections.length && <li>No entries yet. Start writing to see them here.</li>}
        </ul>
      </div>
    </section>
  );

  const renderScenarios = () => (
    <section className="screen">
      <div className="panel glass scenario-card">
        <div className="section-heading">
          <p className="micro">Peer-pressure scenario</p>
          <h3>{selectedScenario?.title || 'Pick a card'}</h3>
        </div>
        <p>{selectedScenario?.prompt}</p>
        <div className="scenario-actions">
          {selectedScenario?.choices?.map((choice, index) => (
            <button
              key={choice}
              type="button"
              className={scenarioChoice === choice ? 'active' : ''}
              onClick={() => handleScenarioChoice(choice, index)}
            >
              Choice {String.fromCharCode(65 + index)}
            </button>
          ))}
        </div>
        {scenarioResult && <p className="result-card">{scenarioResult}</p>}
        <p className="limited-badge">Limited Access · Premium unlocks unlimited outcomes</p>
      </div>
    </section>
  );

  const renderMentors = () => {
    if (selectedMentor) {
      return (
        <section className="screen mentor-profile">
          <button type="button" className="link" onClick={() => setSelectedMentor(null)}>
            ← Back to mentors
          </button>
          <div className="panel glass">
            <div className="profile-banner">
              <div className="photo-placeholder">...</div>
              <div>
                <p className="micro">{selectedMentor.focus}</p>
                <h3>{selectedMentor.name}</h3>
                <p>{selectedMentor.bio}</p>
              </div>
            </div>
            <div className="mentor-meta">
              <p className="micro">Topics</p>
              <p>{selectedMentor.focus}</p>
              <p className="micro">Availability</p>
              <p>{selectedMentor.availability.join(', ')}</p>
              <p className="micro">Pricing</p>
              <p>${selectedMentor.rate} · 30 min · ₵{selectedMentor.rate * 15} GHS</p>
            </div>
            <button className="primary" type="button">
              Book session (Premium)
            </button>
          </div>
        </section>
      );
    }

    return (
      <section className="screen">
        <div className="panel glass">
          <div className="section-heading">
            <p className="micro">Mentorship marketplace</p>
            <h3>Connect with a guide</h3>
          </div>
          <input
            className="search-bar"
            placeholder="Search by name, focus, year..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <p className="limited-badge">Premium required for booking</p>
          <ul className="mentor-list">
            {filteredMentors.map((mentor) => (
              <li key={mentor.id}>
                <div>
                  <p className="micro">{mentor.focus}</p>
                  <h4>{mentor.name}</h4>
                  <p>{mentor.bio}</p>
                </div>
                <button type="button" onClick={() => setSelectedMentor(mentor)}>
                  View profile
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  };

  const renderConnect = () => (
    <section className="screen connect-screen">
      <div className="panel glass connect-card">
        <div className="section-heading">
          <p className="micro">Signal your vibe</p>
          <h3>We’ll match you with students who share your values.</h3>
        </div>
        <form className="stack" onSubmit={handleMatchingSubmit}>
          <label>
            Values you want mirrored
            <input
              value={matchingForm.values}
              onChange={(event) => setMatchingForm((prev) => ({ ...prev, values: event.target.value }))}
              placeholder="Authenticity, community care..."
              required
            />
          </label>
          <label>
            Interests or focus areas
            <input
              value={matchingForm.interests}
              onChange={(event) => setMatchingForm((prev) => ({ ...prev, interests: event.target.value }))}
              placeholder="Mindful tech, journaling walks..."
              required
            />
          </label>
          <label>
            What should peers know?
            <textarea
              value={matchingForm.highlight}
              onChange={(event) => setMatchingForm((prev) => ({ ...prev, highlight: event.target.value }))}
              placeholder="I’m building a ritual club for early-morning focus."
            />
          </label>
          <label className="switch">
            <input
              type="checkbox"
              checked={matchingForm.preferAnonymous}
              onChange={() => setMatchingForm((prev) => ({ ...prev, preferAnonymous: !prev.preferAnonymous }))}
            />
            Prefer anonymous intros first
          </label>
          <button className="primary" type="submit">
            Send collaboration signal
          </button>
          {matchStatus && <p className="note">{matchStatus}</p>}
        </form>
      </div>

      <div className="panel glass community-panel">
        <div className="section-heading">
          <p className="micro">Suggested communities</p>
          <h3>Spots where students like you gather</h3>
        </div>
        <ul className="community-list">
          {communityMatches.map((community) => (
            <li key={community.id}>
              <div>
                <p className="micro">{community.theme}</p>
                <h4>{community.name}</h4>
                <p>{community.description}</p>
              </div>
              <span className="chip">{community.anonymousSupported ? 'Anonymous friendly' : 'Live circles'}</span>
            </li>
          ))}
          {!communityMatches.length && <li>No communities yet. They'll appear after your first signal.</li>}
        </ul>
      </div>
    </section>
  );

  const renderProfile = () => (
    <section className="screen profile-screen">
      <div className="panel glass">
        <div className="profile-banner">
          <div className="photo-placeholder large"></div>
          <div>
            <p className="micro">Hi Julianne!</p>
            <h3>Identity growth</h3>
            <div className="identity-bar">
              <span style={{ width: `${growthScore}%` }} />
            </div>
            <p>{growthScore}% · Keep leaning into authenticity.</p>
          </div>
        </div>
        <div className="streak">
          <p className="micro">Check-in streak</p>
          <strong>{streak} days</strong>
        </div>
        <button className="secondary" type="button" onClick={() => setActiveScreen('Premium')}>
          Upgrade to Premium
        </button>
      </div>

      <div className="panel glass">
        <div className="section-heading">
          <p className="micro">Identity anchors</p>
          <h3>Edit your statements</h3>
        </div>
        <form className="stack" onSubmit={handleIdentitySave}>
          <label>
            Values
            <input
              value={identityForm.values}
              onChange={(event) => setIdentityForm({ ...identityForm, values: event.target.value })}
            />
          </label>
          <label>
            Strengths
            <input
              value={identityForm.strengths}
              onChange={(event) => setIdentityForm({ ...identityForm, strengths: event.target.value })}
            />
          </label>
          <label>
            Goals
            <textarea
              value={identityForm.goals}
              onChange={(event) => setIdentityForm({ ...identityForm, goals: event.target.value })}
            />
          </label>
          <button className="primary" type="submit" disabled={saving === 'identity'}>
            {saving === 'identity' ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </section>
  );

  const renderPremium = () => (
    <section className="screen premium-screen">
      <div className="panel glass">
        <div className="section-heading">
          <p className="micro">Premium plan</p>
          <h3>More guidance, deeper insight</h3>
        </div>
        <table className="premium-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>Free</th>
              <th>Premium</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Peer-pressure scenarios</td>
              <td>2 / week</td>
              <td>Unlimited</td>
            </tr>
            <tr>
              <td>Identity insights</td>
              <td>Basic trends</td>
              <td>Advanced insights</td>
            </tr>
            <tr>
              <td>Mentorship booking</td>
              <td>View only</td>
              <td>Book sessions</td>
            </tr>
            <tr>
              <td>Cloud backup</td>
              <td>Local only</td>
              <td>Secure archive</td>
            </tr>
          </tbody>
        </table>
        <div className="premium-cta">
          <button className="primary" type="button">
            Subscribe monthly (USD)
          </button>
          <button className="primary ghost" type="button">
            Subscribe monthly (GHS)
          </button>
        </div>
      </div>
    </section>
  );

  const renderUniversity = () => (
    <section className="screen">
      <div className="panel glass university-card">
        <div className="section-heading">
          <p className="micro">University access</p>
          <h3>Use your school email</h3>
        </div>
        <input placeholder="student@university.edu" />
        <p className="micro">Access all features with your institution’s subscription.</p>
        <button className="primary" type="button">
          Request access
        </button>
        <p className="note">We’ll notify you when your campus is onboard.</p>
      </div>
    </section>
  );

  const renderScreen = () => {
    switch (activeScreen) {
      case 'Home':
        return renderHome();
      case 'Journal':
        return renderJournal();
      case 'Scenarios':
        return renderScenarios();
      case 'Mentors':
        return renderMentors();
      case 'Connect':
        return renderConnect();
      case 'Profile':
        return renderProfile();
      case 'Premium':
        return renderPremium();
      case 'University':
        return renderUniversity();
      default:
        return renderHome();
    }
  };

  return (
    <main className="app-shell">
      {!hasOnboarded && <div className="onboarding-overlay">{onboardingScreens()}</div>}
      <header className="hero wire">
        <div className="hero-copy">
          <p className="pill">Hi Julianne!</p>
          <h1>Stay rooted in who you are, even when campus feels loud.</h1>
          <p className="lede">
            Track your emotions, rehearse peer-pressure moments, and connect to mentors who keep you grounded.
          </p>
        </div>
        <div className="hero-card wire">
          <p className="micro">Snapshot</p>
          <h2>{summary?.totalCheckIns ?? 0} check-ins</h2>
          <p>{summary?.negativeInfluence ?? 0} pressure flags · {summary?.stressSignals ?? 0} stress signals</p>
          <button type="button" className="outline" onClick={() => setActiveScreen('Premium')}>
            See premium insights
          </button>
        </div>
      </header>

      {errorMessage && <p className="error-banner">{errorMessage}</p>}

      {renderScreen()}

      <footer className="panel glass footer-card">
        <p>University member? <button type="button" className="link" onClick={() => setActiveScreen('University')}>Use institutional login</button></p>
        <small>© {new Date().getFullYear()} Invincible Me</small>
      </footer>

      <nav className="bottom-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item}
            type="button"
            className={activeScreen === item ? 'active' : ''}
            onClick={() => setActiveScreen(item)}
          >
            {item}
          </button>
        ))}
      </nav>
    </main>
  );
}

export default App;
