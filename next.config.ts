import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Exclude test files from webpack bundling
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    
    // Ignore test directories in production
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        './test/data/05-versions-space.pdf': 'commonjs ./test/data/05-versions-space.pdf'
      });
    }
    
    return config;
  },
  
  // Exclude test files from static file serving
  async rewrites() {
    return [];
  },
  
  // Configure file system access
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
  },
};

export default nextConfig;
