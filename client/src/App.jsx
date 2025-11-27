import { useEffect, useMemo, useState } from 'react';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:4000/api';
const defaultIdentity = { values: [], strengths: [], goals: [] };
const NAV_ITEMS = ['Home', 'Journal', 'Scenarios', 'Mentors', 'Profile'];

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
        const [summaryData, checkInData, reflectionData, identityData, mentorData, simulatorData] = await Promise.all([
          fetchJSON('/summary'),
          fetchJSON('/checkins'),
          fetchJSON('/reflections'),
          fetchJSON('/identity'),
          fetchJSON('/mentors'),
          fetchJSON('/simulator'),
        ]);

        setSummary(summaryData);
        setCheckIns(checkInData);
        setReflections(reflectionData);
        setIdentity(identityData);
        setMentors(mentorData);
        setSelectedScenario(simulatorData[0]);
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
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('invincible-onboarded');
    if (stored === 'true') {
      setHasOnboarded(true);
    }
  }, []);

  const latestReflections = useMemo(() => reflections.slice(0, 3), [reflections]);
  const filteredMentors = useMemo(
    () =>
      mentors.filter((mentor) => mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) || mentor.focus.toLowerCase().includes(searchTerm.toLowerCase())),
    [mentors, searchTerm],
  );

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
    <section className="screen">
      <div className="card-grid">
        <div className="home-card large">
          <p className="micro">Daily mood & identity check-in</p>
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
              placeholder="Optional short note"
            />
            <button className="primary" type="submit" disabled={saving === 'mood'}>
              {saving === 'mood' ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>

        <div className="home-card">
          <p className="micro">Reflection journal</p>
          <h4>Keep a quick note</h4>
          <button type="button" onClick={() => setActiveScreen('Journal')}>
            Go to journal
          </button>
        </div>

        <div className="home-card">
          <p className="micro">Peer-pressure scenarios</p>
          <h4>Practice tough choices</h4>
          <button type="button" onClick={() => setActiveScreen('Scenarios')}>
            Open simulator
          </button>
        </div>

        <div className="home-card">
          <p className="micro">Mentorship marketplace</p>
          <h4>Work with upper-years</h4>
          <button type="button" onClick={() => setActiveScreen('Mentors')}>
            See mentors
          </button>
        </div>

        <div className="home-card">
          <p className="micro">Progress & trends</p>
          <h4>{summary?.totalCheckIns ?? 0} check-ins · {summary?.negativeInfluence ?? 0} pressure flags</h4>
          <button type="button" onClick={() => setActiveScreen('Premium')}>
            View premium insights
          </button>
        </div>
      </div>
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
