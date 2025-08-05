/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle canvas module for react-konva
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
      };
    }

    // Handle other potential module issues
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push({
        canvas: 'canvas',
      });
    }

    return config;
  },
  // Ensure proper transpilation
  transpilePackages: ['konva', 'react-konva'],
};

export default nextConfig;
