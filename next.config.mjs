/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove standalone output - it conflicts with pages/api routes
  // output: 'standalone',
  
  // Optimize images
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // 1. Prevent HMR from breaking Socket.io
      config.snapshot = {
        managedPaths: [
          /^(.+?[\\/]node_modules[\\/])(?!(socket\.io-client|engine\.io-client))/,
        ],
      };

      // 2. Isolate WebSocket ports
      config.devServer = {
        ...(config.devServer || {}),
        webSocketPort: 3005,
      };
    }
    return config;
  },
};

export default nextConfig;
