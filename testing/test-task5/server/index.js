// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../client')));
app.use('/output', express.static(path.join(__dirname, '../output')));

// Routes
const voiceCloneRoutes = require('./routes/voiceClone');
const textToSpeechRoutes = require('./routes/textToSpeech');
const audioToAudioRoutes = require('./routes/audioToAudio');

app.use('/api/voice-clone', voiceCloneRoutes);
app.use('/api/text-to-speech', textToSpeechRoutes);
app.use('/api/audio-to-audio', audioToAudioRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    elevenlabs: !!process.env.ELEVENLABS_API_KEY,
    google: !!process.env.GOOGLE_APPLICATION_CREDENTIALS
  });
});

// Get available voices
app.get('/api/voices', async (req, res) => {
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      console.log('❌ /api/voices: No API key configured');
      return res.status(500).json({ error: 'ElevenLabs API key not configured' });
    }

    console.log('📡 Fetching voices from ElevenLabs...');
    const axios = require('axios');
    const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY }
    });

    console.log(`✅ Found ${response.data.voices?.length || 0} voices`);
    res.json(response.data.voices || []);
  } catch (error) {
    console.log('❌ /api/voices error:', error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data?.detail?.message || error.message,
      voices: []
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Test server running at http://localhost:${PORT}`);
  console.log(`📁 Open http://localhost:${PORT} in your browser\n`);
  console.log('API Status:');
  console.log(`  - ElevenLabs: ${process.env.ELEVENLABS_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`  - Google APIs: ${process.env.GOOGLE_APPLICATION_CREDENTIALS ? '✅ Configured' : '❌ Not configured'}\n`);
});
