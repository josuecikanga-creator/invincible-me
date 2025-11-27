const express = require('express');
const { v4: uuid } = require('uuid');
const store = require('../data/store');
const { buildSuggestions } = require('../utils/suggestions');
const { generatePrompt } = require('../utils/prompts');

const router = express.Router();

router.get('/status', (req, res) => {
  res.json({
    name: 'Invincible Me API',
    version: '1.0.0',
    uptime: process.uptime(),
  });
});

router.get('/summary', (req, res) => {
  const stressSignals = store.checkIns.filter((c) => c.pressureLevel >= 3).length;
  const negativeInfluence = store.influenceEvents.filter((i) => i.impact === 'negative').length;

  res.json({
    totalCheckIns: store.checkIns.length,
    reflectionsLogged: store.reflections.length,
    negativeInfluence,
    stressSignals,
    identityAnchors: store.identityProfile.values,
  });
});

router.get('/checkins', (req, res) => {
  res.json(store.checkIns);
});

router.post('/checkins', (req, res) => {
  const { emotions = [], thoughts = '', triggers = [], pressureLevel = 0 } = req.body || {};
  const newCheckIn = {
    id: uuid(),
    emotions,
    thoughts,
    triggers,
    pressureLevel,
    createdAt: new Date().toISOString(),
  };

  store.checkIns.unshift(newCheckIn);
  const suggestions = buildSuggestions({ emotions, pressureLevel, identityProfile: store.identityProfile });

  res.status(201).json({ checkIn: newCheckIn, suggestions });
});

router.get('/reflections', (req, res) => {
  res.json(store.reflections);
});

router.post('/reflections', (req, res) => {
  const { entry = '', tags = [] } = req.body || {};
  const reflection = {
    id: uuid(),
    entry,
    tags,
    createdAt: new Date().toISOString(),
  };

  store.reflections.unshift(reflection);
  res.status(201).json(reflection);
});

router.get('/communities', (req, res) => {
  res.json(store.communities);
});

router.get('/mentors', (req, res) => {
  res.json(store.mentors);
});

router.get('/identity', (req, res) => {
  res.json(store.identityProfile);
});

router.post('/identity', (req, res) => {
  const { values, strengths, goals } = req.body || {};
  store.identityProfile = {
    values: values?.length ? values : store.identityProfile.values,
    strengths: strengths?.length ? strengths : store.identityProfile.strengths,
    goals: goals?.length ? goals : store.identityProfile.goals,
  };

  res.json(store.identityProfile);
});

router.get('/peer-influence', (req, res) => {
  res.json(store.influenceEvents);
});

router.post('/peer-influence', (req, res) => {
  const { situation = '', impact = 'neutral', emotionAfter = '' } = req.body || {};

  const entry = {
    id: uuid(),
    situation,
    impact,
    emotionAfter,
    createdAt: new Date().toISOString(),
  };

  store.influenceEvents.unshift(entry);
  res.status(201).json(entry);
});

router.get('/alerts', (req, res) => {
  const latest = store.checkIns[0];
  const reminders = buildSuggestions({
    emotions: latest?.emotions || [],
    pressureLevel: latest?.pressureLevel || 0,
    identityProfile: store.identityProfile,
  });

  res.json({
    reminders,
    lastUpdated: latest?.createdAt,
  });
});

router.get('/simulator', (req, res) => {
  res.json(store.simulatorScenarios);
});

router.post('/ai/prompts', async (req, res) => {
  const { persona = 'anchored', intention = '', values = [] } = req.body || {};
  try {
    const prompt = await generatePrompt({
      persona,
      intention,
      values: values.length ? values : store.identityProfile.values,
    });

    res.json({ prompt });
  } catch (error) {
    res.status(502).json({ message: error.message || 'Prompt generation failed.' });
  }
});

module.exports = router;

