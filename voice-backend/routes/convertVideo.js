// voice-backend/routes/convertVideo.js - Convert WebM to MP4 for iOS compatibility
const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, `convert-in-${Date.now()}.webm`),
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB max

/**
 * POST /api/convert-video
 * Accept WebM video, convert to MP4 (H.264/AAC) for iOS compatibility, return MP4 file.
 */
router.post('/', upload.single('video'), async (req, res) => {
  const inputPath = req.file?.path;
  if (!inputPath || !fs.existsSync(inputPath)) {
    return res.status(400).json({ error: 'No video file provided' });
  }

  const outputPath = path.join(__dirname, '../uploads', `converted-${Date.now()}.mp4`);

  const cleanup = () => {
    try { if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch {}
    try { if (outputPath && fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch {}
  };

  try {
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .addOutputOptions('-movflags +frag_keyframe+separate_moof+omit_tfhd_offset+empty_moov')
        .videoCodec('libx264')
        .audioCodec('aac')
        .format('mp4')
        .output(outputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
    res.sendFile(outputPath, (err) => {
      cleanup();
      if (err && !res.headersSent) res.status(500).json({ error: 'Failed to send converted file' });
    });
  } catch (err) {
    cleanup();
    console.error('❌ Video conversion error:', err.message);
    res.status(500).json({
      error: err.message || 'Video conversion failed. Ensure ffmpeg is available.',
    });
  }
});

module.exports = router;
