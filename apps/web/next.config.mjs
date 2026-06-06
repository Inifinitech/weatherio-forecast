/** @type {import('next').NextConfig} */
const config = {
  // Allow images from WeatherAI storage (overlay images from tree analysis)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'storage.googleapis.com' },
      { protocol: 'https', hostname: 'api.weather-ai.co' },
    ],
  },
};

export default config;

