// server/routes/voiceClone.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, `voice-sample-${Date.now()}.mp3`)
});
const upload = multer({ storage });

/**
 * POST /api/voice-clone
 * Upload a voice sample and create an ElevenLabs voice clone
 */
router.post('/', upload.single('voiceSample'), async (req, res) => {
  const startTime = Date.now();

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No voice sample file provided' });
    }

    const voiceName = req.body.voiceName || `test-voice-${Date.now()}`;
    console.log(`\n📤 Creating voice clone: "${voiceName}"`);
    console.log(`   File: ${req.file.filename} (${(req.file.size / 1024).toFixed(1)} KB)`);

    // Read the uploaded file
    const audioBuffer = fs.readFileSync(req.file.path);

    // Create form data for ElevenLabs
    const formData = new FormData();
    formData.append('name', voiceName);
    formData.append('description', 'Test voice clone for EchoCare');
    formData.append('files', audioBuffer, {
      filename: 'voice_sample.mp3',
      contentType: 'audio/mpeg'
    });

    // Call ElevenLabs API
    const response = await axios.post(
      'https://api.elevenlabs.io/v1/voices/add',
      formData,
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          ...formData.getHeaders()
        },
        timeout: 120000 // 2 minute timeout
      }
    );

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Voice clone created in ${duration}s`);
    console.log(`   Voice ID: ${response.data.voice_id}`);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      voiceId: response.data.voice_id,
      voiceName,
      duration: `${duration}s`
    });

  } catch (error) {
    console.error('❌ Voice cloning error:', error.response?.data || error.message);

    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error: error.response?.data?.detail || error.message,
      code: error.response?.status
    });
  }
});

/**
 * DELETE /api/voice-clone/:voiceId
 * Delete a voice clone from ElevenLabs
 */
router.delete('/:voiceId', async (req, res) => {
  try {
    await axios.delete(
      `https://api.elevenlabs.io/v1/voices/${req.params.voiceId}`,
      {
        headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY }
      }
    );
    console.log(`🗑️ Deleted voice: ${req.params.voiceId}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
