MUSIC TRANSCRIBER + RANDOM SILENCER
====================================
Two-part deploy: Render backend + Netlify frontend

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1: Deploy the backend to Render
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The backend extracts YouTube audio streams using yt-dlp + Deno.

1. Go to https://render.com and sign up (free, no credit card)

2. Click "New +" → "Web Service"

3. Choose "Deploy an existing image or use a Dockerfile"
   → Select "Build and deploy from a Git repository"
   
   OR: Use "Public Git repository" and point to your GitHub repo
   (if you don't have GitHub, use "Manual Deploy" with the render-backend folder)

4. Settings:
   - Name: music-transcriber-backend (or anything you like)
   - Region: pick the closest to you
   - Branch: main
   - Runtime: Docker
   - Instance Type: Free

5. Click "Create Web Service"
   → Render will build the Docker image (takes 3-5 minutes the first time)

6. Once deployed, copy your Render URL — it looks like:
   https://music-transcriber-backend-xxxx.onrender.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2: Update and redeploy the frontend
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Open netlify-frontend/index.html in any text editor

2. Find this line near the top of the JavaScript section:
   const YOUTUBE_BACKEND_URL = 'PASTE_RENDER_URL_HERE';

3. Replace PASTE_RENDER_URL_HERE with your actual Render URL:
   const YOUTUBE_BACKEND_URL = 'https://music-transcriber-backend-xxxx.onrender.com';
   (no trailing slash)

4. Save the file

5. Go to https://app.netlify.com/drop
   Drag the netlify-frontend folder onto the page
   → This will update your existing site OR create a new one

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPORTANT NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Render free tier "spins down" after 15 minutes of inactivity.
  The first YouTube load after a period of no use may take 30-60 seconds
  while the server wakes up. After that it's fast.

• If YouTube extraction fails for any reason, the tool automatically
  falls back to an embedded player (limited features).

• Private or region-restricted YouTube videos will always fail —
  that's YouTube's restriction, not a bug.

• Your users never need a Render or Netlify account. They just visit
  your Netlify URL and use the tool.
