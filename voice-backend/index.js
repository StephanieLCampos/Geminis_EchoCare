// voice-backend/index.js - ElevenLabs voice cloning API (from test-task5_2)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { startScheduler } = require('./scheduler');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/output', express.static(path.join(__dirname, 'output')));

const voiceCloneRoutes = require('./routes/voiceClone');
const textToSpeechRoutes = require('./routes/textToSpeech');
const convertVideoRoutes = require('./routes/convertVideo');

app.use('/api/voice-clone', voiceCloneRoutes);
app.use('/api/text-to-speech', textToSpeechRoutes);
app.use('/api/convert-video', convertVideoRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    elevenlabs: !!process.env.ELEVENLABS_API_KEY,
    google: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scheduler: true,
    convertVideo: true,
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Voice API server at http://localhost:${PORT}`);
  console.log(`   ElevenLabs: ${process.env.ELEVENLABS_API_KEY ? '✅' : '❌'}`);
  const hasGoogleKey = !!process.env.GOOGLE_TRANSLATE_API_KEY;
  const hasGoogleCreds = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
  console.log(`   Translation: ${hasGoogleKey ? '✅ (Google API key)' : hasGoogleCreds ? '✅ (Google SDK)' : '⚠️ (MyMemory fallback)'}`);
  if (!hasGoogleKey && !hasGoogleCreds) {
    console.log(`   → Add GOOGLE_TRANSLATE_API_KEY to .env for reliable translation`);
  }

  // Start the reminder delivery scheduler
  startScheduler();
});
