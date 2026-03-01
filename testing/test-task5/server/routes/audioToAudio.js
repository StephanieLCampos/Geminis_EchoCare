// server/routes/audioToAudio.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, `input-audio-${Date.now()}.mp3`)
});
const upload = multer({ storage });

// Google clients (only initialize if credentials exist)
let speechClient = null;
let translateClient = null;

if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  try {
    const { SpeechClient } = require('@google-cloud/speech');
    const { TranslationServiceClient } = require('@google-cloud/translate');
    speechClient = new SpeechClient();
    translateClient = new TranslationServiceClient();
    console.log('✅ Google Speech-to-Text client initialized');
  } catch (e) {
    console.log('⚠️ Google clients failed to initialize:', e.message);
  }
}

/**
 * POST /api/audio-to-audio
 * Full pipeline: Audio → Speech-to-Text → Translation → ElevenLabs TTS
 *
 * Form data:
 * - audioFile: file (required)
 * - voiceId: string (required)
 * - sourceLanguage: string (default: 'en')
 * - targetLanguage: string (optional)
 * - useTranslation: boolean (default: true)
 */
router.post('/', upload.single('audioFile'), async (req, res) => {
  const startTime = Date.now();
  const steps = [];

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const {
      voiceId,
      sourceLanguage = 'en',
      targetLanguage,
      useTranslation = 'true'
    } = req.body;

    if (!voiceId) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'voiceId is required' });
    }

    const shouldTranslate = useTranslation === 'true' || useTranslation === true;

    console.log(`\n🎤 Audio-to-Audio Request`);
    console.log(`   File: ${req.file.filename} (${(req.file.size / 1024).toFixed(1)} KB)`);
    console.log(`   Voice ID: ${voiceId}`);
    console.log(`   Source: ${sourceLanguage}, Target: ${targetLanguage || sourceLanguage}`);
    console.log(`   Use Translation: ${shouldTranslate}`);

    // Check if Google credentials are available
    if (!speechClient) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        error: 'Google Speech-to-Text is not configured. Set GOOGLE_APPLICATION_CREDENTIALS in .env'
      });
    }

    // STEP 1: Transcribe audio with Google Speech-to-Text
    const sttStart = Date.now();
    console.log(`\n📝 Transcribing audio with Google Speech-to-Text...`);

    const audioBuffer = fs.readFileSync(req.file.path);
    const audioContent = audioBuffer.toString('base64');

    const languageCode = getLanguageCode(sourceLanguage);

    const [sttResponse] = await speechClient.recognize({
      audio: { content: audioContent },
      config: {
        encoding: 'MP3',
        sampleRateHertz: 16000,
        languageCode: languageCode,
        enableAutomaticPunctuation: true,
      },
    });

    const transcribedText = sttResponse.results
      ?.map(result => result.alternatives?.[0]?.transcript)
      .join(' ') || '';

    if (!transcribedText || transcribedText.trim().length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        error: 'Could not transcribe audio. Ensure clear audio quality.'
      });
    }

    const sttDuration = ((Date.now() - sttStart) / 1000).toFixed(2);
    steps.push({ step: 'speech-to-text', duration: `${sttDuration}s` });
    console.log(`   ✅ Transcribed in ${sttDuration}s: "${transcribedText.substring(0, 50)}..."`);

    // STEP 2: Translate if needed
    let finalText = transcribedText;
    let translatedText = null;

    if (shouldTranslate && targetLanguage && targetLanguage !== sourceLanguage && translateClient) {
      const translateStart = Date.now();
      console.log(`\n🌐 Translating: ${sourceLanguage} → ${targetLanguage}`);

      const projectId = process.env.GCLOUD_PROJECT;
      const [translateResponse] = await translateClient.translateText({
        parent: `projects/${projectId}/locations/global`,
        contents: [transcribedText],
        sourceLanguageCode: sourceLanguage,
        targetLanguageCode: targetLanguage,
      });

      translatedText = translateResponse.translations[0].translatedText;
      finalText = translatedText;

      const translateDuration = ((Date.now() - translateStart) / 1000).toFixed(2);
      steps.push({ step: 'translation', duration: `${translateDuration}s` });
      console.log(`   ✅ Translated in ${translateDuration}s: "${translatedText.substring(0, 50)}..."`);
    }

    // STEP 3: Generate speech with ElevenLabs
    const ttsStart = Date.now();
    console.log(`\n🔊 Generating speech with ElevenLabs...`);

    const audioResponse = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: finalText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      },
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        responseType: 'arraybuffer',
        timeout: 60000
      }
    );

    const ttsDuration = ((Date.now() - ttsStart) / 1000).toFixed(2);
    steps.push({ step: 'text-to-speech', duration: `${ttsDuration}s` });
    console.log(`   ✅ Audio generated in ${ttsDuration}s (${(audioResponse.data.byteLength / 1024).toFixed(1)} KB)`);

    // STEP 4: Save output audio
    const fileName = `output-${uuidv4()}.mp3`;
    const filePath = path.join(__dirname, '../../output', fileName);
    fs.writeFileSync(filePath, Buffer.from(audioResponse.data));

    // Clean up input file
    fs.unlinkSync(req.file.path);

    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Complete! Total time: ${totalDuration}s`);

    res.json({
      success: true,
      audioUrl: `/output/${fileName}`,
      transcribedText,
      translatedText,
      finalText,
      sourceLanguage,
      targetLanguage: targetLanguage || sourceLanguage,
      steps,
      totalDuration: `${totalDuration}s`
    });

  } catch (error) {
    console.error('❌ Audio-to-Audio error:', error.response?.data || error.message);

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

// Helper function
function getLanguageCode(lang) {
  const codes = {
    'en': 'en-US',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'de': 'de-DE',
    'it': 'it-IT',
    'pt': 'pt-BR',
    'zh': 'zh-CN',
    'ja': 'ja-JP',
    'ko': 'ko-KR',
    'hi': 'hi-IN',
  };
  return codes[lang] || `${lang}-${lang.toUpperCase()}`;
}

module.exports = router;
