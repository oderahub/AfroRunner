/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",   // Kills the 200MB cache → Cloudflare loves this

  reactStrictMode: true,

  // Only add CORS headers in development (ngrok)
  ...(process.env.NODE_ENV === 'development' && {
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            { key: 'Access-Control-Allow-Origin', value: '*' },
            { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
            { key: 'Access-Control-Allow-Headers', value: 'X-Requested-With, Content-Type, Authorization' },
            { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          ],
        },
      ];
    },
  }),

  webpack: (config, { dev, isServer }) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@react-native-async-storage/async-storage': false,
    };

    if (dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: false,
        minimize: false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;