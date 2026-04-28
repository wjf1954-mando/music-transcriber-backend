const express = require('express');
const cors = require('cors');
const { execFile } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Music Transcriber Backend' });
});

// YouTube audio extraction endpoint
app.post('/api/youtube-audio', (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ ok: false, error: 'Missing or invalid URL' });
  }

  // Extract video ID to validate it's a real YouTube URL
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  const videoId = match ? match[1] : (url.match(/^([a-zA-Z0-9_-]{11})$/) ? url : null);

  if (!videoId) {
    return res.status(400).json({ ok: false, error: 'Could not find a valid YouTube video ID in that URL' });
  }

  const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;

  console.log(`Extracting audio for: ${ytUrl}`);

  // Run yt-dlp to get the direct stream URL (no download)
  // --get-url returns the stream URL
  // --get-title returns the video title  
  // -J returns full JSON info (we use this to get both URL and title cleanly)
  execFile(
    'yt-dlp',
    [
      '-J',                          // output JSON info
      '--no-playlist',
      '--no-warnings',
      '--format', 'bestaudio[ext=webm]/bestaudio[ext=m4a]/bestaudio',
      ytUrl,
    ],
    { timeout: 30000, maxBuffer: 10 * 1024 * 1024 },
    (err, stdout, stderr) => {
      if (err) {
        console.error('yt-dlp error:', stderr || err.message);
        return res.status(500).json({
          ok: false,
          error: 'Could not extract audio. The video may be private, age-restricted, or unavailable.',
        });
      }

      try {
        const info = JSON.parse(stdout);

        // Get the best audio-only format URL
        const formats = info.formats || [];
        const audioFormat = formats
          .filter(f => f.acodec !== 'none' && f.vcodec === 'none')
          .sort((a, b) => (b.abr || 0) - (a.abr || 0))[0];

        const audioUrl = audioFormat?.url || info.url;

        if (!audioUrl) {
          return res.status(500).json({ ok: false, error: 'No audio stream found for this video' });
        }

        console.log(`Success: "${info.title}" - format: ${audioFormat?.ext || 'unknown'}`);

        res.json({
          ok: true,
          audioUrl,
          title: info.title || videoId,
          duration: info.duration,
          thumbnail: info.thumbnail,
        });

      } catch (parseErr) {
        console.error('JSON parse error:', parseErr.message);
        res.status(500).json({ ok: false, error: 'Failed to parse audio stream data' });
      }
    }
  );
});

app.listen(PORT, () => {
  console.log(`Music Transcriber backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/`);
});
