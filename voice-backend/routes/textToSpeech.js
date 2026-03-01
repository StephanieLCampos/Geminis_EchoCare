// voice-backend/routes/textToSpeech.js - from test-task5_2
const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

let translateClient = null;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  try {
    const { TranslationServiceClient } = require('@google-cloud/translate');
    translateClient = new TranslationServiceClient();
    console.log('✅ Google Translate client initialized');
  } catch (e) {
    console.log('⚠️ Google Translate failed:', e.message);
  }
}

/** Language codes for translation APIs */
const LANG_MAP = { en: 'en', zh: 'zh-CN', es: 'es', pt: 'pt', hi: 'hi' };

/** Translate via Google REST API (uses GOOGLE_TRANSLATE_API_KEY) */
async function translateWithGoogleKey(text, fromLang, toLang) {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!key) return null;
  const from = LANG_MAP[fromLang] || fromLang;
  const to = LANG_MAP[toLang] || toLang;
  if (from === to) return text;
  const { data } = await axios.get('https://translation.googleapis.com/language/translate/v2', {
    params: { key, q: text, source: from, target: to },
    timeout: 10000,
  });
  return data?.data?.translations?.[0]?.translatedText || null;
}

/** Translate via MyMemory API (free, no key) */
async function translateWithMyMemory(text, fromLang, toLang) {
  const from = LANG_MAP[fromLang] || fromLang;
  const to = LANG_MAP[toLang] || toLang;
  if (from === to) return text;
  try {
    const { data } = await axios.get('https://api.mymemory.translated.net/get', {
      params: { q: text, langpair: `${from}|${to}` },
      timeout: 10000,
    });
    const translated = data?.responseData?.translatedText;
    if (translated && data?.responseStatus !== 403) return translated;
  } catch (e) {
    console.warn('MyMemory translation failed:', e.message);
  }
  return null;
}

/**
 * POST /api/text-to-speech
 * Convert text to speech using ElevenLabs (with optional translation)
 * Translated text is spoken in the target language in the user's cloned voice.
 */
router.post('/', async (req, res) => {
  const startTime = Date.now();

  try {
    const {
      text,
      voiceId,
      sourceLanguage = 'en',
      targetLanguage,
      useTranslation = true,
    } = req.body;

    if (!text || !voiceId) {
      return res.status(400).json({ error: 'text and voiceId are required' });
    }

    console.log(`\n📝 Text-to-Speech: "${text.substring(0, 50)}..." voiceId=${voiceId} targetLang=${targetLanguage || 'none'}`);

    let finalText = text;
    let translatedText = null;

    if (useTranslation && targetLanguage && targetLanguage !== sourceLanguage) {
      let translated = null;
      if (translateClient && process.env.GCLOUD_PROJECT) {
        const projectId = process.env.GCLOUD_PROJECT;
        const [response] = await translateClient.translateText({
          parent: `projects/${projectId}/locations/global`,
          contents: [text],
          sourceLanguageCode: sourceLanguage,
          targetLanguageCode: targetLanguage,
        });
        translated = response.translations[0].translatedText;
        console.log(`   Translated (Google SDK): "${translated?.substring(0, 40)}..."`);
      }
      if (!translated && process.env.GOOGLE_TRANSLATE_API_KEY) {
        translated = await translateWithGoogleKey(text, sourceLanguage, targetLanguage);
        if (translated) console.log(`   Translated (Google API key): "${translated.substring(0, 40)}..."`);
      }
      if (!translated) {
        translated = await translateWithMyMemory(text, sourceLanguage, targetLanguage);
        if (translated) console.log(`   Translated (MyMemory): "${translated.substring(0, 40)}..."`);
      }
      if (translated) {
        translatedText = translated;
        finalText = translated;
      } else {
        console.warn('   ⚠ Translation failed — speaking original text. Add GOOGLE_TRANSLATE_API_KEY for reliable translation.');
      }
    }

    const audioResponse = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: finalText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      },
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        responseType: 'arraybuffer',
        timeout: 60000,
      }
    );

    const fileName = `output-${uuidv4()}.mp3`;
    const filePath = path.join(__dirname, '../output', fileName);
    fs.writeFileSync(filePath, Buffer.from(audioResponse.data));

    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ TTS complete in ${totalDuration}s`);

    res.json({
      success: true,
      audioUrl: `/output/${fileName}`,
      originalText: text,
      translatedText,
      finalText,
      sourceLanguage,
      targetLanguage: targetLanguage || sourceLanguage,
      totalDuration: `${totalDuration}s`,
    });
  } catch (error) {
    console.error('❌ Text-to-Speech error:', error.response?.data || error.message);
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

module.exports = router;
