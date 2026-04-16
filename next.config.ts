import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['64.226.119.165', '167.99.140.244', 'tarbutrm.duckdns.org', 'tarbutrm.servehalflife.com'],
  devIndicators: false,

  // Performance optimizations
  compress: true,
  productionBrowserSourceMaps: false,

  // Experimental optimizations for faster builds
  experimental: {
    optimizePackageImports: [
      '@chakra-ui/react',
      '@radix-ui/*',
      'lodash',
      'date-fns',
    ],
    staticGenerationRetryCount: 3,
  },

  // Dev mode: use webpack instead of Turbopack for custom config
  ...(process.env.TURBOPACK_DISABLED === 'true' && {
    webpack: (config: any) => {
      config.devtool = false;
      return config;
    },
  }),

  // Prevent Turbopack errors when webpack config is present in dev
  ...(process.env.TURBOPACK_DISABLED === 'true' && {
    turbopack: {},
  }),
};

export default nextConfig;
