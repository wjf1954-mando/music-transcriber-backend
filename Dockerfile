FROM node:20-slim

# Install system dependencies + Python + ffmpeg + Deno
RUN apt-get update && apt-get install -y \
    ffmpeg python3 python3-pip curl ca-certificates unzip \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp via pip with all default extras (includes EJS scripts for YouTube)
RUN pip3 install --break-system-packages "yt-dlp[default]"

# Install Deno (JS runtime required for YouTube n-challenge solver)
RUN curl -fsSL https://deno.land/install.sh | DENO_INSTALL=/usr/local sh

# Verify both are working
RUN yt-dlp --version && deno --version

# Set working directory
WORKDIR /app

# Copy and install Node dependencies
COPY package.json ./
RUN npm install

# Copy app
COPY server.js ./

# Expose port
EXPOSE 3000

CMD ["node", "server.js"]
