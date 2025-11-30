/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Allow any ngrok tunnel for MiniPay mobile testing
  allowedDevOrigins: [
    '*.ngrok.io',
    '*.ngrok-free.app',
    '*.ngrok-free.dev',
  ],

  // Allow cross-origin requests for mobile testing
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },

  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')

    // Fix for MetaMask SDK trying to import React Native modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@react-native-async-storage/async-storage': false,
    };

    return config
  },
};

module.exports = nextConfig;
