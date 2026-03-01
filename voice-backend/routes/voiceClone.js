// voice-backend/routes/voiceClone.js - from test-task5_2
const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const ext = (file.originalname || '').endsWith('.webm') ? 'webm' : 'mp3';
    cb(null, `voice-sample-${Date.now()}.${ext}`);
  },
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

    const voiceName = req.body.voiceName || `caregiver-voice-${Date.now()}`;
    console.log(`\n📤 Creating voice clone: "${voiceName}"`);

    const audioBuffer = fs.readFileSync(req.file.path);

    const formData = new FormData();
    formData.append('name', voiceName);
    formData.append('description', 'Caregiver voice clone for Remind Me');
    const ext = req.file.originalname?.endsWith('.webm') ? 'webm' : 'mp3';
    const contentType = ext === 'webm' ? 'audio/webm' : 'audio/mpeg';
    formData.append('files', audioBuffer, {
      filename: `voice_sample.${ext}`,
      contentType,
    });

    const response = await axios.post(
      'https://api.elevenlabs.io/v1/voices/add',
      formData,
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          ...formData.getHeaders(),
        },
        timeout: 120000,
      }
    );

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Voice clone created in ${duration}s, ID: ${response.data.voice_id}`);

    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      voiceId: response.data.voice_id,
      voiceName,
      duration: `${duration}s`,
    });
  } catch (error) {
    console.error('❌ Voice cloning error:', error.response?.data || error.message);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    const detail = error.response?.data?.detail;
    const errMsg =
      typeof detail === 'string' ? detail :
      detail?.message ? detail.message :
      detail ? JSON.stringify(detail) :
      error.message;
    res.status(500).json({
      error: errMsg,
      code: error.response?.status,
    });
  }
});

/**
 * DELETE /api/voice-clone/:voiceId
 */
router.delete('/:voiceId', async (req, res) => {
  try {
    await axios.delete(
      `https://api.elevenlabs.io/v1/voices/${req.params.voiceId}`,
      { headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY } }
    );
    console.log(`🗑️ Deleted voice: ${req.params.voiceId}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
