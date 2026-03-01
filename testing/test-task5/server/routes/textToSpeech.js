// server/routes/textToSpeech.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Google Translate client (only initialize if credentials exist)
let translateClient = null;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  try {
    const { TranslationServiceClient } = require('@google-cloud/translate');
    translateClient = new TranslationServiceClient();
    console.log('✅ Google Translate client initialized');
  } catch (e) {
    console.log('⚠️ Google Translate client failed to initialize:', e.message);
  }
}

/**
 * POST /api/text-to-speech
 * Convert text to speech using ElevenLabs (with optional translation)
 *
 * Body:
 * - text: string (required)
 * - voiceId: string (required)
 * - sourceLanguage: string (default: 'en')
 * - targetLanguage: string (optional - if different, translation occurs)
 * - useTranslation: boolean (default: true)
 */
router.post('/', async (req, res) => {
  const startTime = Date.now();
  const steps = [];

  try {
    const {
      text,
      voiceId,
      sourceLanguage = 'en',
      targetLanguage,
      useTranslation = true
    } = req.body;

    if (!text || !voiceId) {
      return res.status(400).json({ error: 'text and voiceId are required' });
    }

    console.log(`\n📝 Text-to-Speech Request`);
    console.log(`   Text: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
    console.log(`   Voice ID: ${voiceId}`);
    console.log(`   Source: ${sourceLanguage}, Target: ${targetLanguage || sourceLanguage}`);
    console.log(`   Use Translation: ${useTranslation}`);

    let finalText = text;
    let translatedText = null;

    // STEP 1: Translate if needed
    if (useTranslation && targetLanguage && targetLanguage !== sourceLanguage && translateClient) {
      const translateStart = Date.now();
      console.log(`\n🌐 Translating: ${sourceLanguage} → ${targetLanguage}`);

      const projectId = process.env.GCLOUD_PROJECT;
      const [response] = await translateClient.translateText({
        parent: `projects/${projectId}/locations/global`,
        contents: [text],
        sourceLanguageCode: sourceLanguage,
        targetLanguageCode: targetLanguage,
      });

      translatedText = response.translations[0].translatedText;
      finalText = translatedText;

      const translateDuration = ((Date.now() - translateStart) / 1000).toFixed(2);
      steps.push({ step: 'translation', duration: `${translateDuration}s` });
      console.log(`   ✅ Translated in ${translateDuration}s: "${translatedText.substring(0, 50)}..."`);
    } else if (targetLanguage && targetLanguage !== sourceLanguage && !translateClient) {
      console.log(`   ⚠️ Translation skipped (Google credentials not configured)`);
    }

    // STEP 2: Generate speech with ElevenLabs
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

    // STEP 3: Save audio file
    const fileName = `output-${uuidv4()}.mp3`;
    const filePath = path.join(__dirname, '../../output', fileName);
    fs.writeFileSync(filePath, Buffer.from(audioResponse.data));

    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Complete! Total time: ${totalDuration}s`);

    res.json({
      success: true,
      audioUrl: `/output/${fileName}`,
      originalText: text,
      translatedText,
      finalText,
      sourceLanguage,
      targetLanguage: targetLanguage || sourceLanguage,
      steps,
      totalDuration: `${totalDuration}s`
    });

  } catch (error) {
    console.error('❌ Text-to-Speech error:', error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data?.detail || error.message,
      code: error.response?.status
    });
  }
});

module.exports = router;
