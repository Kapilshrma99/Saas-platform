/** @type {import('next').NextConfig} */
const backendApiOrigin = process.env.INTERNAL_API_URL || 'http://localhost:5000';

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: `${backendApiOrigin}/api/auth/:path*`
      },
      {
        source: '/api/tenants/:path*',
        destination: `${backendApiOrigin}/api/tenants/:path*`
      },
      {
        source: '/api/bookings/:path*',
        destination: `${backendApiOrigin}/api/bookings/:path*`
      },
      {
        source: '/api/upload/:path*',
        destination: `${backendApiOrigin}/api/upload/:path*`
      }
    ];
  }
};

module.exports = nextConfig;
