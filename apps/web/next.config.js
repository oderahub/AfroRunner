/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',   // This is the magic — replaces `next export` entirely

  reactStrictMode: true,

  // Dev-only CORS for ngrok
  ...(process.env.NODE_ENV === 'development' && {
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            { key: 'Access-Control-Allow-Origin', value: '*' },
            { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
            { key: 'Access-Control-Allow-Headers', value: 'X-Requested-With, Content-Type, Authorization' },
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

  // Required for static export
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;