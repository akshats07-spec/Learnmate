/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
  },
  async rewrites() {
    return [
      {
        source: '/api/py/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
      {
        source: '/api/py-health',
        destination: 'http://localhost:8000/',
      },
    ];
  },
};

export default nextConfig;
